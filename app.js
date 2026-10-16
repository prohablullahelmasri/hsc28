const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '#';

/* ===== লগইন অবস্থা ===== */
async function showAuth() {
  const box = $('auth');
  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { box.innerHTML = '<a class="btn small" href="login.html">লগইন</a>'; return; }
    const { data: p } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
    let html = '';
    if (p && p.role === 'admin') html += '<a class="btn small" href="admin.html">এডমিন প্যানেল</a>';
    html += '<button class="btn small ghost" id="logout">লগআউট</button>';
    box.innerHTML = html;
    $('logout').onclick = async () => { await sb.auth.signOut(); location.reload(); };
  } catch (e) { console.error(e); }
}

/* ===== লিস্ট লোড ===== */
async function loadList(table, id, render) {
  const el = $(id);
  const { data, error } = await sb.from(table).select('*').order('created_at', { ascending: false });
  if (error) { el.innerHTML = '<li class="empty">ডাটা লোড করা যায়নি</li>'; return; }
  el.innerHTML = data.length ? data.map(render).join('') : '<li class="empty">এখনো কিছু যোগ করা হয়নি</li>';
}

function loadAll() {
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

/* ===== কুইজ ===== */
document.addEventListener('click', e => {
  const a = e.target.closest('[data-quiz]');
  if (a) { e.preventDefault(); openQuiz(a.dataset.quiz, a.dataset.title); }
});

async function openQuiz(id, title) {
  const area = $('quiz-area');
  area.style.display = 'block';
  area.innerHTML = '<p class="empty">লোড হচ্ছে...</p>';
  area.scrollIntoView({ behavior: 'smooth' });
  const { data, error } = await sb.from('questions').select('*').eq('quiz_id', id).order('id');
  if (error || !data.length) { area.innerHTML = `<h2>${esc(title)}</h2><p class="empty">এই কুইজে এখনো প্রশ্ন যোগ হয়নি।</p>`; return; }
  const letters = ['a', 'b', 'c', 'd'];
  area.innerHTML = `<h2>📝 ${esc(title)}</h2>` + data.map((q, i) => `
    <div class="q-card" data-correct="${esc((q.correct || '').toLowerCase())}">
      <b>${i + 1}. ${esc(q.question)}</b>
      ${letters.map(l => q['option_' + l] ? `<label data-l="${l}"><input type="radio" name="q${q.id}" value="${l}" style="width:auto;margin:0 8px 0 0">${esc(q['option_' + l])}</label>` : '').join('')}
    </div>`).join('') +
    '<button class="btn" id="submitQuiz">উত্তর জমা দিন</button><div class="score" id="score"></div>';
  $('submitQuiz').onclick = () => {
    let ok = 0;
    area.querySelectorAll('.q-card').forEach(card => {
      const right = card.dataset.correct;
      const chosen = card.querySelector('input:checked');
      card.querySelectorAll('label').forEach(l => l.classList.remove('ok', 'bad'));
      const rightLabel = card.querySelector(`label[data-l="${right}"]`);
      if (rightLabel) rightLabel.classList.add('ok');
      if (chosen) {
        if (chosen.value === right) ok++;
        else chosen.closest('label').classList.add('bad');
      }
    });
    $('score').textContent = `আপনার স্কোর: ${ok} / ${data.length}`;
  };
}

/* ===== সার্চ ===== */
function doSearch() {
  const q = $('searchInput').value.trim().toLowerCase();
  document.querySelectorAll('.list li').forEach(li => {
    li.style.display = (!q || li.textContent.toLowerCase().includes(q)) ? '' : 'none';
  });
}
$('searchBtn').onclick = doSearch;
$('searchInput').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
$('searchInput').addEventListener('input', () => { if (!$('searchInput').value) doSearch(); });

/* ===== ছবির স্লাইডার ===== */
(function () {
  const slides = $('slides'), dots = $('dots');
  const n = slides.children.length;
  let i = 0, timer, startX = 0;
  for (let k = 0; k < n; k++) {
    const d = document.createElement('span');
    d.onclick = () => { go(k); restart(); };
    dots.appendChild(d);
  }
  function go(k) {
    i = (k + n) % n;
    slides.style.transform = `translateX(-${i * 100}%)`;
    [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i));
  }
  function restart() { clearInterval(timer); if (n > 1) timer = setInterval(() => go(i + 1), 4000); }
  slides.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  slides.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1); restart(); }
  });
  go(0); restart();
})();

/* ===== যোগাযোগ ফর্ম ===== */
$('cSend').onclick = async () => {
  const msg = $('cMsg').value.trim();
  const st = $('cStatus');
  if (!msg) { st.innerHTML = '<div class="msg err">বার্তা লিখুন।</div>'; return; }
  $('cSend').disabled = true;
  const { error } = await sb.from('messages').insert({ name: $('cName').value.trim(), email: $('cEmail').value.trim(), message: msg });
  $('cSend').disabled = false;
  if (error) { st.innerHTML = '<div class="msg err">পাঠানো যায়নি, আবার চেষ্টা করুন।</div>'; return; }
  st.innerHTML = '<div class="msg okk">ধন্যবাদ! আপনার বার্তা পাঠানো হয়েছে।</div>';
  $('cName').value = $('cEmail').value = $('cMsg').value = '';
};

showAuth();
loadAll();
