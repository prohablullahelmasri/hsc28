const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '#';

/* ===== প্রিমিয়াম স্টাইল (ভেতরেই যুক্ত) ===== */
(function () {
  const s = document.createElement('style');
  s.textContent = `
  html{scroll-behavior:smooth}
  .site-header{transition:box-shadow .3s}
  .site-header.scrolled{box-shadow:0 6px 24px rgba(0,0,0,.5)}
  .reveal{opacity:0;transform:translateY(26px);transition:opacity .7s ease,transform .7s ease}
  .reveal.in{opacity:1;transform:none}
  .panel,.cat-card{transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease}
  .panel:hover{transform:translateY(-4px);box-shadow:0 14px 32px rgba(43,140,255,.2);border-color:var(--accent)}
  .cat-card:hover{transform:translateY(-5px);box-shadow:0 10px 24px rgba(18,194,255,.25)}
  .list li{transition:padding .2s ease,background .2s ease;border-radius:8px}
  .list li:hover{padding-left:8px;background:rgba(43,140,255,.08)}
  .btn{transition:transform .2s ease,box-shadow .2s ease}
  .btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(43,140,255,.45)}
  .btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
  .skel{height:46px;border-radius:10px;margin:9px 0;list-style:none;background:linear-gradient(90deg,#0e2244 25%,#1b3a68 50%,#0e2244 75%);background-size:200% 100%;animation:sh 1.3s infinite}
  @keyframes sh{to{background-position:-200% 0}}
  .slider{position:relative}
  .s-arrow{position:absolute;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:50%;border:0;cursor:pointer;background:rgba(5,13,31,.6);color:#fff;font-size:20px;z-index:2;opacity:0;transition:opacity .3s}
  .slider:hover .s-arrow{opacity:1}
  .s-arrow.l{left:10px}.s-arrow.r{right:10px}
  .dots span{transition:all .3s}
  .dots span.on{width:26px;border-radius:6px}
  .search{transition:box-shadow .3s}
  .search:focus-within{box-shadow:0 0 0 3px rgba(43,140,255,.35)}
  #searchInfo{color:var(--muted);font-size:14px;margin:-8px 6px 10px;min-height:20px}
  .nores{color:var(--muted);list-style:none;padding:8px 0}
  .q-head{display:flex;justify-content:space-between;align-items:center;gap:10px}
  .progress{height:8px;background:#071428;border-radius:8px;overflow:hidden;margin:10px 0}
  .progress i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));transition:width .5s ease}
  .q-count{color:var(--muted);font-size:14px}
  .opt{display:block;width:100%;text-align:left;margin:8px 0;padding:12px 14px;border-radius:10px;border:1px solid var(--line);background:#071428;color:var(--text);font-family:inherit;font-size:16px;cursor:pointer;transition:all .2s}
  .opt:hover:not(:disabled){border-color:var(--accent2);transform:translateX(4px)}
  .opt.ok{background:rgba(39,174,96,.28);border-color:#27ae60}
  .opt.bad{background:rgba(192,57,43,.28);border-color:#c0392b}
  .result{text-align:center;padding:14px 0}
  .result .big{font-size:54px;font-weight:700;background:linear-gradient(90deg,#fff,var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent}
  .toasts{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:99;display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none}
  .toast{background:#0e2244;border:1px solid var(--accent);color:#fff;padding:10px 20px;border-radius:30px;box-shadow:0 8px 24px rgba(0,0,0,.5);animation:tin .35s ease}
  .toast.err{border-color:#c0392b}
  @keyframes tin{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  #toTop{position:fixed;right:16px;bottom:18px;width:44px;height:44px;border-radius:50%;border:0;cursor:pointer;font-size:20px;color:#fff;z-index:60;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:0 6px 18px rgba(43,140,255,.5);opacity:0;pointer-events:none;transition:opacity .3s,transform .3s;transform:translateY(10px)}
  #toTop.show{opacity:1;pointer-events:auto;transform:none}
  .chip{background:rgba(43,140,255,.15);border:1px solid var(--line);padding:5px 12px;border-radius:20px;font-size:13px;color:var(--text)}
  @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.reveal{opacity:1;transform:none}}
  `;
  document.head.appendChild(s);
})();

/* ===== পপ-আপ বার্তা ===== */
const toastBox = document.createElement('div');
toastBox.className = 'toasts';
document.body.appendChild(toastBox);
function toast(msg, isErr) {
  const t = document.createElement('div');
  t.className = 'toast' + (isErr ? ' err' : '');
  t.textContent = msg;
  toastBox.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .4s'; setTimeout(() => t.remove(), 400); }, 3000);
}

/* ===== লগইন অবস্থা ===== */
async function showAuth() {
  const box = $('auth');
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { box.innerHTML = '<a class="btn small" href="login.html">লগইন</a>'; return; }
    const { data: p } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
    let html = '';
    if (p && p.role === 'admin') html += '<a class="btn small" href="admin.html">এডমিন প্যানেল</a>';
    else html += '<span class="chip">👤 ' + esc((session.user.email || '').split('@')[0]) + '</span>';
    html += '<button class="btn small ghost" id="logout">লগআউট</button>';
    box.innerHTML = html;
    $('logout').onclick = async () => { await sb.auth.signOut(); location.reload(); };
  } catch (e) { console.error(e); }
}

/* ===== লিস্ট লোড (ক্যাশসহ) ===== */
const SKEL = '<li class="skel"></li><li class="skel"></li><li class="skel"></li>';
async function loadList(table, id, render) {
  const el = $(id);
  let cached = null;
  try { cached = JSON.parse(sessionStorage.getItem('c_' + table)); } catch (e) {}
  const draw = d => {
    el.innerHTML = d.length ? d.map(render).join('') : '<li class="empty">এখনো কিছু যোগ করা হয়নি</li>';
    if ($('searchInput').value.trim()) doSearch();
  };
  if (cached) draw(cached); else el.innerHTML = SKEL;
  const { data, error } = await sb.from(table).select('*').order('created_at', { ascending: false });
  if (error) { if (!cached) el.innerHTML = '<li class="empty">ডাটা লোড করা যায়নি</li>'; return; }
  try { sessionStorage.setItem('c_' + table, JSON.stringify(data)); } catch (e) {}
  draw(data);
}

function loadAll() {
    loadList('batch_items', 'batch-list', r => {
    const inner = `<div>${esc(r.title)}<small>${esc(r.kind || '')}</small></div>`;
    return r.url ? `<li><a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener">${inner}</a></li>` : `<li>${inner}</li>`;
  });
    loadList('tools', 'tools-list', r =>
    `<li><a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener"><div>${esc(r.title)}</div></a></li>`);
  loadList('gov_links', 'gov-list', r =>
    `<li><a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener"><div>${esc(r.title)}<small>${esc(r.url)}</small></div></a></li>`);
  loadList('pdfs', 'pdf-list', r =>
    `<li><a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener"><div>${esc(r.title)}<small>PDF${r.size ? ' • ' + esc(r.size) : ''}${r.category ? ' • ' + esc(r.category) : ''}</small></div></a></li>`);
  loadList('books', 'books-list', r => {
    const inner = `<div>${esc(r.title)}<small>${esc(r.subject || '')}</small></div>`;
    return r.url ? `<li><a href="${esc(safeUrl(r.url))}" target="_blank" rel="noopener">${inner}</a></li>` : `<li>${inner}</li>`;
  });
  loadList('quizzes', 'quiz-list', r =>
    `<li><a href="#quiz-area" data-quiz="${r.id}" data-title="${esc(r.title)}"><div>${esc(r.title)}<small>${esc(r.subject || '')}</small></div></a></li>`);
  loadList('updates', 'updates-list', r =>
    `<li><div>${esc(r.text)}<small>${new Date(r.created_at).toLocaleDateString('bn-BD')}</small></div></li>`);
}

/* ===== কুইজ (এক প্রশ্ন করে) ===== */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-quiz]');
  if (a) { e.preventDefault(); openQuiz(a.dataset.quiz, a.dataset.title); }
});

async function openQuiz(id, title) {
  const area = $('quiz-area');
  area.style.display = 'block';
  area.innerHTML = '<ul class="list">' + SKEL + '</ul>';
  area.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const { data, error } = await sb.from('questions').select('*').eq('quiz_id', id).order('id');
  if (error || !data || !data.length) {
    area.innerHTML = `<h2>${esc(title)}</h2><p class="empty">এই কুইজে এখনো প্রশ্ন যোগ হয়নি।</p>`;
    return;
  }
  const L = ['a', 'b', 'c', 'd'];
  let idx = 0, score = 0;

  function render() {
    const q = data[idx];
    const right = (q.correct || '').toLowerCase().trim();
    area.innerHTML = `
      <div class="q-head"><h2>📝 ${esc(title)}</h2><button class="btn small ghost" id="qClose">✕ বন্ধ</button></div>
      <div class="progress"><i style="width:${(idx / data.length) * 100}%"></i></div>
      <p class="q-count">প্রশ্ন ${idx + 1} / ${data.length}</p>
      <div class="q-card"><b>${esc(q.question)}</b>
        ${L.map(l => q['option_' + l] ? `<button class="opt" data-l="${l}">${esc(q['option_' + l])}</button>` : '').join('')}
      </div>
      <div id="qNext"></div>`;
    $('qClose').onclick = () => { area.style.display = 'none'; };
    let locked = false;
    area.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      if (locked) return;
      locked = true;
      const chosen = b.dataset.l;
      area.querySelectorAll('.opt').forEach(o => { o.disabled = true; });
      const rightBtn = area.querySelector(`.opt[data-l="${right}"]`);
      if (rightBtn) rightBtn.classList.add('ok');
      if (chosen === right) { score++; toast('✅ সঠিক উত্তর!'); }
      else { b.classList.add('bad'); toast('❌ ভুল উত্তর', true); }
      const last = idx + 1 >= data.length;
      $('qNext').innerHTML = `<button class="btn" id="nextBtn">${last ? 'ফলাফল দেখুন' : 'পরের প্রশ্ন →'}</button>`;
      $('nextBtn').onclick = () => { idx++; last ? result() : render(); };
    });
  }

  function result() {
    const pct = Math.round((score / data.length) * 100);
    const msg = pct >= 80 ? '🏆 অসাধারণ! চালিয়ে যান।' : pct >= 50 ? '👍 ভালো হয়েছে, আরেকটু অনুশীলন করুন।' : '📖 চিন্তা নেই, আবার চেষ্টা করুন।';
    area.innerHTML = `
      <div class="progress"><i style="width:100%"></i></div>
      <div class="result">
        <div class="big">${pct}%</div>
        <div class="score">স্কোর: ${score} / ${data.length}</div>
        <p>${msg}</p><br>
        <button class="btn" id="retry">আবার চেষ্টা করুন</button>
        <button class="btn ghost" id="qClose2">বন্ধ করুন</button>
      </div>`;
    $('retry').onclick = () => { idx = 0; score = 0; render(); };
    $('qClose2').onclick = () => { area.style.display = 'none'; };
  }
  render();
}

/* ===== সার্চ ===== */
function doSearch() {
  const q = $('searchInput').value.trim().toLowerCase();
  document.querySelectorAll('.nores').forEach(n => n.remove());
  let total = 0;
  document.querySelectorAll('ul.list').forEach(ul => {
    let shown = 0, real = 0;
    ul.querySelectorAll('li:not(.skel):not(.empty)').forEach(li => {
      real++;
      const hit = !q || li.textContent.toLowerCase().includes(q);
      li.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    total += shown;
    if (q && real > 0 && shown === 0) {
      const n = document.createElement('li');
      n.className = 'nores';
      n.textContent = 'কিছু পাওয়া যায়নি';
      ul.appendChild(n);
    }
  });
  $('searchInfo').textContent = q ? `"${$('searchInput').value.trim()}" এর জন্য ${total}টি ফলাফল পাওয়া গেছে` : '';
}
(function () {
  const info = document.createElement('div');
  info.id = 'searchInfo';
  document.querySelector('.search').after(info);
  let t;
  $('searchBtn').onclick = doSearch;
  $('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
  $('searchInput').addEventListener('input', () => { clearTimeout(t); t = setTimeout(doSearch, 250); });
})();

/* ===== ছবির স্লাইডার ===== */
(function () {
  const slides = $('slides'), dots = $('dots'), box = slides.parentElement;
  const n = slides.children.length;
  let i = 0, timer, startX = 0;
  for (let k = 0; k < n; k++) {
    const d = document.createElement('span');
    d.onclick = () => { go(k); restart(); };
    dots.appendChild(d);
  }
  if (n > 1) {
    const l = document.createElement('button'); l.className = 's-arrow l'; l.innerHTML = '‹'; l.setAttribute('aria-label', 'আগের ছবি');
    const r = document.createElement('button'); r.className = 's-arrow r'; r.innerHTML = '›'; r.setAttribute('aria-label', 'পরের ছবি');
    l.onclick = () => { go(i - 1); restart(); };
    r.onclick = () => { go(i + 1); restart(); };
    box.append(l, r);
  } else dots.style.display = 'none';
  function go(k) {
    i = (k + n) % n;
    slides.style.transform = `translateX(-${i * 100}%)`;
    [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i));
  }
  function stop() { clearInterval(timer); }
  function restart() { stop(); if (n > 1) timer = setInterval(() => go(i + 1), 4000); }
  box.addEventListener('mouseenter', stop);
  box.addEventListener('mouseleave', restart);
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : restart());
  slides.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  slides.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(dx < 0 ? i + 1 : i - 1);
    restart();
  });
  go(0); restart();
})();

/* ===== যোগাযোগ ফর্ম ===== */
$('cSend').onclick = async () => {
  const name = $('cName').value.trim().slice(0, 100);
  const email = $('cEmail').value.trim().slice(0, 150);
  const msg = $('cMsg').value.trim().slice(0, 1000);
  const st = $('cStatus');
  if (!msg) { st.innerHTML = '<div class="msg err">বার্তা লিখুন।</div>'; return; }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) { st.innerHTML = '<div class="msg err">সঠিক ইমেইল দিন।</div>'; return; }
  let last = 0;
  try { last = +localStorage.getItem('lastMsg') || 0; } catch (e) {}
  if (Date.now() - last < 30000) { st.innerHTML = '<div class="msg err">একটু অপেক্ষা করে আবার পাঠান।</div>'; return; }
  $('cSend').disabled = true;
  const { error } = await sb.from('messages').insert({ name, email, message: msg });
  $('cSend').disabled = false;
  if (error) { st.innerHTML = ''; toast('পাঠানো যায়নি, আবার চেষ্টা করুন', true); return; }
  try { localStorage.setItem('lastMsg', Date.now()); } catch (e) {}
  st.innerHTML = '';
  toast('✅ ধন্যবাদ! আপনার বার্তা পাঠানো হয়েছে');
  $('cName').value = $('cEmail').value = $('cMsg').value = '';
};

/* ===== স্ক্রল ইফেক্ট, উপরে ওঠার বাটন, মেনু হাইলাইট ===== */
(function () {
  const top = document.createElement('button');
  top.id = 'toTop'; top.innerHTML = '↑'; top.setAttribute('aria-label', 'উপরে যান');
  top.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  document.body.appendChild(top);
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    top.classList.toggle('show', scrollY > 500);
    header.classList.toggle('scrolled', scrollY > 10);
  }, { passive: true });

  const items = document.querySelectorAll('.hero,.search,.cat-card,.panel');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: .08 });
    items.forEach(el => { el.classList.add('reveal'); io.observe(el); });

    const links = [...document.querySelectorAll('.nav a')];
    const map = new Map();
    links.forEach(a => { const el = document.querySelector(a.getAttribute('href')); if (el) map.set(el, a); });
    const io2 = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) { links.forEach(a => a.classList.remove('active')); map.get(en.target).classList.add('active'); }
    }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((a, el) => io2.observe(el));
  }
})();

showAuth();
loadAll();
