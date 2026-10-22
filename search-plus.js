(function () {
  const E = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const U = u => /^https?:\/\//i.test(u || '') ? u : '';

  const SRC = [
    { t: 'gov_links',   tag: '🏛️ সরকারি লিংক',      alias: ['সরকারি','সরকার','লিংক','link','links','gov','govt','government','website','ওয়েবসাইট'],
      title: r => r.title, sub: r => r.url, url: r => r.url, hay: r => [r.title, r.url] },
    { t: 'pdfs',        tag: '📄 পিডিএফ',            alias: ['পিডিএফ','pdf','pdfs','ডাউনলোড','download'],
      title: r => r.title, sub: r => [r.category, r.size].filter(Boolean).join(' • '), url: r => r.url, hay: r => [r.title, r.category, r.size] },
    { t: 'books',       tag: '📚 বই ও নোট',          alias: ['বই','বইসমূহ','বুক','book','books','নোট','note','notes','রিসোর্স','resource','resources'],
      title: r => r.title, sub: r => r.subject, url: r => r.url, hay: r => [r.title, r.subject] },
    { t: 'batch_items', tag: '🎓 এইচএসসি ২৮ ব্যাচ', alias: ['ব্যাচ','batch','এইচএসসি','hsc','প্রশ্নপত্র','গাইডলাইন','কমিউনিটি','group','গ্রুপ'],
      title: r => r.title, sub: r => r.kind, url: r => r.url, hay: r => [r.title, r.kind] },
    { t: 'tools',       tag: '⚙️ টুলস',              alias: ['টুল','টুলস','tool','tools','উপকারী'],
      title: r => r.title, sub: r => '', url: r => r.url, hay: r => [r.title] },
    { t: 'quizzes',     tag: '📝 কুইজ',              alias: ['কুইজ','quiz','quizzes','mcq','এমসিকিউ','প্রশ্ন'],
      title: r => r.title, sub: r => r.subject, quiz: true, hay: r => [r.title, r.subject] },
    { t: 'updates',     tag: '🆕 আপডেট',             alias: ['আপডেট','update','updates','নতুন','new'],
      title: r => r.text, sub: r => '', hay: r => [r.text] }
  ];

  const css = document.createElement('style');
  css.textContent = `
  #sResults{display:none;background:var(--card);border:1px solid var(--accent);border-radius:14px;margin:-6px 0 16px;padding:6px;max-height:60vh;overflow:auto;box-shadow:0 12px 30px rgba(43,140,255,.25)}
  .sr-item{display:block;padding:10px 12px;border-radius:10px;color:var(--text)}
  a.sr-item:hover{background:rgba(43,140,255,.15)}
  .sr-item b{display:block;font-weight:600}
  .sr-item small{display:block;color:var(--muted);word-break:break-all}
  .sr-tag{display:block;font-size:12px;color:var(--accent2)}
  .sr-empty{padding:12px;color:var(--muted)}
  .sr-foot{display:flex;justify-content:space-between;align-items:center;padding:6px 12px;color:var(--muted);font-size:13px}
  .sr-foot a{color:var(--accent2);cursor:pointer}
  `;
  document.head.appendChild(css);

  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');
  const bar = document.querySelector('.search');
  if (!input || !bar) return;
  const panel = document.createElement('div');
  panel.id = 'sResults';
  bar.after(panel);

  let DATA = null, loadedAt = 0, loading = null;
  async function load() {
    if (DATA && Date.now() - loadedAt < 60000) return;
    if (loading) return loading;
    loading = (async () => {
      const out = {};
      await Promise.all(SRC.map(async s => {
        try {
          const { data } = await sb.from(s.t).select('*');
          out[s.t] = data || [];
        } catch (e) { out[s.t] = []; }
      }));
      DATA = out; loadedAt = Date.now(); loading = null;
    })();
    return loading;
  }

    function wordMatches(w, s, text) {
    const tokens = text.split(/[\s\-–—_.,:;|\/()\[\]{}'"“”‘’•?=&#]+/).filter(Boolean);
    if (tokens.some(t => t.startsWith(w))) return true;
    if (w.length >= 2 && s.alias.some(a => a.toLowerCase().startsWith(w))) return true;
    return false;
  }

  async function run() {
    const raw = input.value.trim();
    const q = raw.toLowerCase();
    if (!q) { panel.style.display = 'none'; panel.innerHTML = ''; return; }
    panel.style.display = 'block';
    if (!DATA) panel.innerHTML = '<div class="sr-empty">খোঁজা হচ্ছে...</div>';
    await load();
    if (input.value.trim().toLowerCase() !== q) return;

    const words = q.split(/\s+/);
    const hits = [];
    SRC.forEach(s => (DATA[s.t] || []).forEach(r => {
      const text = s.hay(r).filter(Boolean).join(' ').toLowerCase();
      if (words.every(w => wordMatches(w, s, text))) {
        hits.push({ s, r, rank: String(s.title(r) || '').toLowerCase().startsWith(q) ? 0 : 1 });
      }
    }));
    hits.sort((a, b) => a.rank - b.rank);

    if (!hits.length) {
      panel.innerHTML = '<div class="sr-empty">কিছু পাওয়া যায়নি</div>' +
        '<div class="sr-foot"><span></span><a id="srClose">✕ বন্ধ</a></div>';
    } else {
      panel.innerHTML = hits.slice(0, 30).map(({ s, r }) => {
        const inner = `<span class="sr-tag">${s.tag}</span><b>${E(s.title(r))}</b>${s.sub(r) ? `<small>${E(s.sub(r))}</small>` : ''}`;
        if (s.quiz) return `<a class="sr-item" href="#quiz-area" data-quiz="${r.id}" data-title="${E(r.title)}">${inner}</a>`;
        const u = U(s.url && s.url(r));
        if (u) return `<a class="sr-item" href="${E(u)}" target="_blank" rel="noopener">${inner}</a>`;
        return `<div class="sr-item">${inner}</div>`;
      }).join('') + `<div class="sr-foot"><span>${hits.length}টি ফলাফল</span><a id="srClose">✕ বন্ধ</a></div>`;
    }
    const c = document.getElementById('srClose');
    if (c) c.onclick = () => { input.value = ''; run(); };
  }

  window.doSearch = run;
  if (btn) btn.onclick = run;
  input.addEventListener('focus', () => { load(); });
})();
