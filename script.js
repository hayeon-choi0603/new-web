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

// ── Supabase 방명록 ──
const SUPABASE_URL = 'https://lcfqamcjxhmvzqkgeedv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjZnFhbWNqeGhtdnpxa2dlZWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMTI2MDUsImV4cCI6MjA4ODc4ODYwNX0.awnO-H712vA8r6pziH_N2VIcOYujw4GawxB0iDduQ0w';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
};

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function loadEntries() {
  const el = document.getElementById('entries');
  el.innerHTML = '<div class="empty-msg">불러오는 중... ⏳</div>';
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/guestbook?order=id.desc`, { headers });
    const data = await res.json();
    if (!data.length) {
      el.innerHTML = '<div class="empty-msg">아직 아무도 안 남겼습니다. 첫 번째가 돼어보세요! 👀</div>';
      return;
    }
    el.innerHTML = '';
    data.forEach(e => {
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
  } catch(e) {
    el.innerHTML = '<div class="empty-msg">불러오기 실패 😢 새로고침 해봐요</div>';
  }
}

async function submitEntry() {
  const name = document.getElementById('g-name').value.trim();
  const msg  = document.getElementById('g-msg').value.trim();
  if (!name || !msg) { alert('이름이랑 메시지 둘 다 써줘!'); return; }

  const date = new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  const btn = document.querySelector('.submit-btn');
  btn.textContent = '저장 중...';
  btn.disabled = true;

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/guestbook`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ name, msg, date })
    });
    if (res.ok) {
      document.getElementById('g-name').value = '';
      document.getElementById('g-msg').value  = '';
      await loadEntries();
      launchFireworks();
    } else {
      alert('저장 실패 😢 다시 시도해봐요!');
    }
  } catch(e) {
    alert('오류 발생 😢 인터넷 연결 확인해봐요');
  } finally {
    btn.textContent = '남기기 💬';
    btn.disabled = false;
  }
}

loadEntries();
