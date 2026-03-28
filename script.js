const game = document.getElementById('game');
const ship = document.getElementById('ship');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const over = document.getElementById('over');
const bossWarning = document.getElementById('bossWarning');

let shipX = 190;
let score = 0;
let lives = 3;
let running = true;
let bossSpawned = false;
let bossHealth = 5;
let lastShot = 0;
let animationId = null;

const bullets = [];
const enemies = [];
const stars = [];

for (let i = 0; i < 60; i++) {
  const s = document.createElement('div');
  s.className = 'star';
  s.dataset.speed = (1 + Math.random() * 3).toFixed(2);
  s.style.left = Math.random() * 420 + 'px';
  s.style.top = Math.random() * 700 + 'px';
  game.appendChild(s);
  stars.push(s);
}

function updateShip() {
  ship.style.left = shipX + 'px';
}

document.addEventListener('keydown', (e) => {
  if (!running) return;
  let moved = false;

  if (e.key === 'ArrowLeft') {
    shipX = Math.max(0, shipX - 25);
    moved = true;
  }
  if (e.key === 'ArrowRight') {
    shipX = Math.min(380, shipX + 25);
    moved = true;
  }

  if (e.code === 'Space') {
    const now = Date.now();
    if (now - lastShot > 180) {
      shoot();
      lastShot = now;
    }
  }

  if (moved) {
    ship.classList.add('moving');
    setTimeout(() => ship.classList.remove('moving'), 120);
  }

  updateShip();
});

function shoot() {
  if (bullets.length > 24) return;
  const b = document.createElement('div');
  b.className = 'bullet';
  b.textContent = '⚡';
  b.style.left = shipX + 12 + 'px';
  b.style.bottom = '70px';
  game.appendChild(b);
  bullets.push(b);
}

function explosion(x, y) {
  const ex = document.createElement('div');
  ex.className = 'explosion';
  ex.textContent = '💥';
  ex.style.left = x + 'px';
  ex.style.top = y + 'px';
  game.appendChild(ex);
  setTimeout(() => ex.remove(), 400);
}

function spawnBoss() {
  if (bossSpawned || !running) return;
  bossSpawned = true;
  bossHealth = 5;
  bossWarning.style.display = 'block';

  setTimeout(() => {
    bossWarning.style.display = 'none';
    const e = document.createElement('div');
    e.className = 'enemy';
    e.textContent = '👾';
    e.dataset.boss = 'true';
    e.style.fontSize = '72px';
    e.style.left = '160px';
    e.style.top = '-80px';
    game.appendChild(e);
    enemies.push(e);
  }, 2000);
}

function spawnEnemy() {
  if (!running) return;
  const e = document.createElement('div');
  e.className = 'enemy';
  e.textContent = ['👾', '🛸', '☄️'][Math.floor(Math.random() * 3)];
  e.style.left = Math.random() * 380 + 'px';
  e.style.top = '-40px';
  game.appendChild(e);
  enemies.push(e);
}

setInterval(spawnEnemy, 900);

function collide(a, b) {
  const r1 = a.getBoundingClientRect();
  const r2 = b.getBoundingClientRect();
  return !(r1.right < r2.left || r1.left > r2.right || r1.bottom < r2.top || r1.top > r2.bottom);
}

function loop() {
  if (!running) return;

  stars.forEach((s) => {
    let y = parseFloat(s.style.top);
    y += parseFloat(s.dataset.speed);
    if (y > 700) y = 0;
    s.style.top = y + 'px';
  });

  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    let y = parseInt(b.style.bottom || '70');
    y += 10;
    b.style.bottom = y + 'px';
    if (y > 700) {
      b.remove();
      bullets.splice(i, 1);
    }
  }

  for (let ei = enemies.length - 1; ei >= 0; ei--) {
    const e = enemies[ei];
    let y = parseInt(e.style.top || '-40');
    y += 4;
    e.style.top = y + 'px';

    if (y > 660) {
      e.remove();
      enemies.splice(ei, 1);
      continue;
    }

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      if (!(e.isConnected && b.isConnected)) continue;

      if (collide(e, b)) {
        const er = e.getBoundingClientRect();
        const gr = game.getBoundingClientRect();
        explosion(er.left - gr.left, er.top - gr.top);

        b.remove();
        bullets.splice(bi, 1);

        if (e.dataset.boss === 'true') {
          bossHealth--;
          if (bossHealth <= 0) {
            e.remove();
            enemies.splice(ei, 1);
            score += 5;
            scoreEl.textContent = score;
            checkWin();
          }
        } else {
          e.remove();
          enemies.splice(ei, 1);
          score += 5;
          scoreEl.textContent = score;
          checkWin();
          if (score >= 50 && !bossSpawned) spawnBoss();
        }
        break;
      }
    }

    if (e.isConnected && collide(e, ship)) {
      e.remove();
      enemies.splice(ei, 1);
      lives--;
      livesEl.textContent = lives;
      if (lives <= 0) endGame();
    }
  }

  animationId = requestAnimationFrame(loop);
}

function checkWin() {
  if (score >= 100 && running) {
    running = false;
    if (animationId) cancelAnimationFrame(animationId);
    setTimeout(() => alert('🎉 You Won!'), 100);
  }
}

function endGame() {
  if (animationId) cancelAnimationFrame(animationId);
  running = false;
  over.classList.add('show');
  setTimeout(() => alert('💥 You Lost!'), 100);
}

function restartGame() {
  if (animationId) cancelAnimationFrame(animationId);
  bossSpawned = false;
  bossHealth = 5;
  lastShot = 0;
  bossWarning.style.display = 'none';

  bullets.forEach((b) => b.remove());
  enemies.forEach((e) => e.remove());
  bullets.length = 0;
  enemies.length = 0;

  score = 0;
  lives = 3;
  shipX = 190;
  running = true;

  scoreEl.textContent = 0;
  livesEl.textContent = 3;
  over.classList.remove('show');
  updateShip();
  animationId = requestAnimationFrame(loop);
}

updateShip();
animationId = requestAnimationFrame(loop);
