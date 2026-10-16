(function () {
  const H = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const note = (m, e) => (typeof toast === 'function' ? toast(m, e) : alert(m));

  const TYPES = {
    gov_links: { label: '🏛️ সরকারি লিংক', fields: [
      { k: 'title', l: 'নাম', req: 1 },
      { k: 'url', l: 'লিংক (https:// দিয়ে শুরু)', req: 1, url: 1 } ] },
    pdfs: { label: '📄 পিডিএফ', fields: [
      { k: 'title', l: 'শিরোনাম', req: 1 },
      { k: 'url', l: 'পিডিএফ লিংক (https://...)', req: 1, url: 1 },
      { k: 'size', l: 'সাইজ (যেমন 2.4 MB)' },
      { k: 'category', l: 'ক্যাটাগরি (যেমন পদার্থবিজ্ঞান)' } ] },
    books: { label: '📚 বই ও নোট', fields: [
      { k: 'title', l: 'নাম', req: 1 },
      { k: 'subject', l: 'বিষয়' },
      { k: 'url', l: 'লিংক (https://...)', url: 1 } ] },
    quizzes: { label: '📝 নতুন কুইজ তৈরি', table: 'quizzes', fields: [
      { k: 'title', l: 'কুইজের নাম', req: 1 },
      { k: 'subject', l: 'বিষয়' } ] },
    questions: { label: '❓ কুইজে প্রশ্ন যোগ', fields: [
      { k: 'quiz_id', l: 'কোন কুইজে?', type: 'quiz', req: 1 },
      { k: 'question', l: 'প্রশ্ন', type: 'area', req: 1 },
      { k: 'option_a', l: 'অপশন A', req: 1 },
      { k: 'option_b', l: 'অপশন B', req: 1 },
      { k: 'option_c', l: 'অপশন C' },
      { k: 'option_d', l: 'অপশন D' },
      { k: 'correct', l: 'সঠিক উত্তর', type: 'correct', req: 1 } ] },
    updates: { label: '🆕 আপডেট', fields: [
      { k: 'text', l: 'আপডেটের লেখা', type: 'area', req: 1 } ] }
  };

  async function init() {
    let session;
    try { session = (await sb.auth.getSession()).data.session; } catch (e) { return; }
    if (!session) return;
    const { data: p } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
    if (!p || p.role !== 'admin') return;

    const css = document.createElement('style');
    css.textContent = `
    #apFab{position:fixed;right:16px;bottom:72px;width:58px;height:58px;border-radius:50%;border:0;font-size:34px;line-height:1;color:#fff;cursor:pointer;z-index:70;background:linear-gradient(135deg,#2b8cff,#12c2ff);box-shadow:0 8px 22px rgba(43,140,255,.6);transition:transform .25s}
    #apFab:hover{transform:rotate(90deg) scale(1.08)}
    #apOv{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:100;display:none;align-items:center;justify-content:center;padding:14px}
    #apOv.open{display:flex}
    #apBox{background:var(--card);border:1px solid var(--line);border-radius:18px;width:100%;max-width:480px;max-height:88vh;overflow:auto;padding:18px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
    .ap-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;gap:8px}
    .ap-head h3{font-size:19px}
    .ap-x{background:transparent;border:1px solid var(--line);color:var(--text);border-radius:8px;padding:4px 10px;cursor:pointer;font-size:16px}
    .ap-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .ap-item{background:#071428;border:1px solid var(--line);color:var(--text);border-radius:12px;padding:16px 8px;font-family:inherit;font-size:15px;cursor:pointer;transition:all .2s}
    .ap-item:hover{border-color:var(--accent2);transform:translateY(-3px)}
    .ap-lbl{font-size:14px;color:var(--muted);display:block;margin-top:4px}
    .ap-msg{border-bottom:1px solid var(--line);padding:10px 0}
    .ap-msg small{color:var(--muted);display:block}
    `;
    document.head.appendChild(css);

    const fab = document.createElement('button');
    fab.id = 'apFab'; fab.innerHTML = '+'; fab.setAttribute('aria-label', 'নতুন কিছু যোগ করুন');
    const ov = document.createElement('div');
    ov.id = 'apOv'; ov.innerHTML = '<div id="apBox"></div>';
    document.body.append(fab, ov);
    const box = ov.firstChild;

    const open = () => { ov.classList.add('open'); menu(); };
    const close = () => ov.classList.remove('open');
    fab.onclick = open;
    ov.addEventListener('click', e => { if (e.target === ov) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

    function menu() {
      box.innerHTML = `<div class="ap-head"><h3>➕ কী যোগ করবেন?</h3><button class="ap-x" id="apClose">✕</button></div>
        <div class="ap-grid">
          ${Object.keys(TYPES).map(k => `<button class="ap-item" data-k="${k}">${TYPES[k].label}</button>`).join('')}
          <button class="ap-item" data-k="__msgs">✉️ পাওয়া বার্তা</button>
        </div>`;
      box.querySelector('#apClose').onclick = close;
      box.querySelectorAll('.ap-item').forEach(b => b.onclick = () => b.dataset.k === '__msgs' ? messages() : form(b.dataset.k));
    }

    async function form(key) {
      const t = TYPES[key];
      let quizzes = [];
      if (key === 'questions') {
        const { data } = await sb.from('quizzes').select('id,title').order('created_at', { ascending: false });
        quizzes = data || [];
        if (!quizzes.length) {
          box.innerHTML = `<div class="ap-head"><h3>${t.label}</h3><button class="ap-x" id="apBack">← পিছনে</button></div>
            <p class="empty">আগে "📝 নতুন কুইজ তৈরি" থেকে একটা কুইজ বানান।</p>`;
          box.querySelector('#apBack').onclick = menu;
          return;
        }
      }
      const ctl = f => {
        const id = 'f_' + f.k;
        if (f.type === 'area') return `<textarea id="${id}"></textarea>`;
        if (f.type === 'quiz') return `<select id="${id}">${quizzes.map(q => `<option value="${q.id}">${H(q.title)}</option>`).join('')}</select>`;
        if (f.type === 'correct') return `<select id="${id}"><option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option></select>`;
        return `<input id="${id}" autocomplete="off">`;
      };
      box.innerHTML = `<div class="ap-head"><h3>${t.label}</h3><button class="ap-x" id="apBack">← পিছনে</button></div>
        ${t.fields.map(f => `<label class="ap-lbl">${f.l}${f.req ? ' *' : ''}</label>${ctl(f)}`).join('')}
        <button class="btn" id="apSave" style="width:100%;margin-top:6px">যোগ করুন</button>`;
      box.querySelector('#apBack').onclick = menu;
      box.querySelector('#apSave').onclick = async () => {
        const row = {};
        for (const f of t.fields) {
          const v = box.querySelector('#f_' + f.k).value.trim();
          if (f.req && !v) { note('"' + f.l + '" পূরণ করুন', true); return; }
          if (f.url && v && !/^https?:\/\//i.test(v)) { note('লিংক https:// দিয়ে শুরু হতে হবে', true); return; }
          if (v) row[f.k] = v;
        }
        if (row.quiz_id) row.quiz_id = Number(row.quiz_id);
        const btn = box.querySelector('#apSave');
        btn.disabled = true;
        const { error } = await sb.from(t.table || key).insert(row);
        btn.disabled = false;
        if (error) { note('যোগ করা যায়নি: ' + error.message, true); return; }
        try { sessionStorage.removeItem('c_' + (t.table || key)); } catch (e) {}
        note('✅ সফলভাবে যোগ হয়েছে');
        t.fields.forEach(f => { if (f.type !== 'quiz' && f.type !== 'correct') box.querySelector('#f_' + f.k).value = ''; });
        if (typeof loadAll === 'function') loadAll();
      };
    }

    async function messages() {
      box.innerHTML = `<div class="ap-head"><h3>✉️ পাওয়া বার্তা</h3><button class="ap-x" id="apBack">← পিছনে</button></div><div id="apList"><p class="empty">লোড হচ্ছে...</p></div>`;
      box.querySelector('#apBack').onclick = menu;
      const { data, error } = await sb.from('messages').select('*').order('created_at', { ascending: false });
      const list = box.querySelector('#apList');
      if (error) { list.innerHTML = '<p class="empty">লোড করা যায়নি</p>'; return; }
      if (!data.length) { list.innerHTML = '<p class="empty">এখনো কোনো বার্তা আসেনি।</p>'; return; }
      list.innerHTML = data.map(m => `<div class="ap-msg"><b>${H(m.name || 'নামহীন')}</b> <small>${H(m.email || '')} • ${new Date(m.created_at).toLocaleString('bn-BD')}</small>
        <div>${H(m.message)}</div><button class="btn small danger" data-del="${m.id}" style="margin-top:6px">মুছুন</button></div>`).join('');
      list.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
        if (!confirm('বার্তাটি মুছে ফেলবেন?')) return;
        const { error: e2 } = await sb.from('messages').delete().eq('id', b.dataset.del);
        if (e2) { note('মোছা যায়নি', true); return; }
        b.closest('.ap-msg').remove();
        note('মুছে ফেলা হয়েছে');
      });
    }
  }
  init();
})();
