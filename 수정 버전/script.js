// ── 커서 ──
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});

// ── 탄생일 (오늘 기준) ──
const BIRTH = new Date();
BIRTH.setHours(0, 0, 0, 0);
document.getElementById('made-date').textContent =
  BIRTH.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

// ── D+ 카운터 ──
function tick() {
  const diff = new Date() - BIRTH;
  document.getElementById('cnt-d').textContent = Math.floor(diff / 86400000);
  document.getElementById('cnt-h').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
  document.getElementById('cnt-m').textContent = String(Math.floor((diff % 3600000)  / 60000)).padStart(2, '0');
  document.getElementById('cnt-s').textContent = String(Math.floor((diff % 60000)    / 1000)).padStart(2, '0');
}
setInterval(tick, 1000);
tick();



// ── 폭죽 ──
const canvas = document.getElementById('fireworks-canvas');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.addEventListener('resize', resize);

let particles = [];
const COLORS  = ['#FFE600', '#FF3CAC', '#00C2FF', '#FF6B35', '#7FFF00', '#FF69B4', '#ffffff'];

function makeParticle(x, y, color) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 9 + 2;
  return {
    x, y, color,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
    decay: Math.random() * 0.02 + 0.012,
    size:  Math.random() * 4 + 2,
  };
}

function launchFireworks() {
  for (let b = 0; b < 10; b++) {
    setTimeout(() => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height * 0.55;
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      for (let i = 0; i < 90; i++) particles.push(makeParticle(x, y, c));
    }, b * 180);
  }
  animLoop();
}

let looping = false;
function animLoop() {
  if (looping) return;
  looping = true;
  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.18;
      p.life -= p.decay;
      ctx.globalAlpha = p.life;
      ctx.fillStyle   = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    if (particles.length > 0) {
      requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      looping = false;
    }
  })();
}

// ── 방명록 ──
let entries = [];
try { entries = JSON.parse(localStorage.getItem('gb-entries') || '[]'); } catch (e) {}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderEntries() {
  const el = document.getElementById('entries');
  if (entries.length === 0) {
    el.innerHTML = '<div class="empty-msg">아직 아무도 안 남겼다... 첫 번째가 돼봐 👀</div>';
    return;
  }
  el.innerHTML = '';
  [...entries].reverse().forEach(e => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-header">
        <span class="entry-name">${esc(e.name)}</span>
        <span class="entry-date">${e.date}</span>
      </div>
      <div class="entry-msg">${esc(e.msg)}</div>`;
    el.appendChild(card);
  });
}

function submitEntry() {
  const name = document.getElementById('g-name').value.trim();
  const msg  = document.getElementById('g-msg').value.trim();
  if (!name || !msg) { alert('이름이랑 메시지 둘 다 써줘!'); return; }
  entries.push({
    name, msg,
    date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
  });
  try { localStorage.setItem('gb-entries', JSON.stringify(entries)); } catch (e) {}
  document.getElementById('g-name').value = '';
  document.getElementById('g-msg').value  = '';
  renderEntries();
  launchFireworks();
}

renderEntries();
