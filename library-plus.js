(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const note = (m, e) => (typeof toast === 'function' ? toast(m, e) : alert(m));
  const KIND = { tree: 'ফোল্ডার পর্দা', quiz: 'কুইজ (বিল্ট-ইন)', updates: 'আপডেট (বিল্ট-ইন)', contact: 'যোগাযোগ (বিল্ট-ইন)' };

  const cats = $('.cats');
  if (!cats) return;

  const css = document.createElement('style');
  css.textContent = `
  .lib-bar{display:flex;gap:8px;flex-wrap:wrap;margin:-4px 0 14px}
  #libOv{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:105;display:none;align-items:center;justify-content:center}
  #libOv.open{display:flex}
  #libBox{background:var(--bg);border:1px solid var(--line);width:min(560px,100%);height:min(760px,100%);display:flex;flex-direction:column;overflow:hidden;color:var(--text)}
  @media(min-width:620px){#libBox{border-radius:20px;height:min(760px,92vh);box-shadow:0 24px 70px rgba(0,0,0,.6)}}
  .lb-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line);background:linear-gradient(180deg,#0e2244,#0b1a33);color:#fff}
  .lb-head h3{flex:1;font-size:18px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff}
  .lb-ib{background:transparent;border:0;color:#fff;font-size:20px;cursor:pointer;padding:4px 8px;border-radius:8px}
  .lb-ib:hover{background:rgba(255,255,255,.1)}
  .lb-crumb{padding:8px 14px;font-size:14px;color:var(--muted);border-bottom:1px solid var(--line);background:var(--card);display:none;line-height:1.7}
  .lb-crumb a{color:var(--accent2);cursor:pointer}
  .lb-body{flex:1;overflow:auto;padding:10px}
  .lb-row{display:flex;align-items:center;gap:10px;padding:13px 12px;margin:6px 0;border-radius:14px;cursor:pointer;background:var(--card);border:1px solid var(--line);transition:border-color .15s,transform .15s}
  .lb-row:hover{border-color:var(--accent2);transform:translateX(3px)}
  .lb-ic{font-size:22px}
  .lb-mid{flex:1;min-width:0}
  .lb-mid b{display:block;font-weight:600;word-break:break-word}
  .lb-mid small{display:block;color:var(--muted)}
  .lb-arr{color:var(--muted);font-size:20px}
  .lb-adm{display:flex;gap:2px}
  .lb-adm button,.lb-lnk{background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text);border-radius:8px;padding:3px 7px;cursor:pointer;font-size:14px}
  .lb-note{color:var(--muted);padding:14px 4px;line-height:1.6}
  .lb-card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:14px}
  .lb-card label{display:block;margin-top:10px;color:var(--muted);font-size:14px}
  .lb-btns{display:flex;gap:8px;margin-top:12px}
  `;
  document.head.appendChild(css);

  const ov = document.createElement('div');
  ov.id = 'libOv';
  ov.innerHTML = '<div id="libBox"><div class="lb-head"><button class="lb-ib" data-act="back">←</button><h3 id="lbTitle"></h3><button class="lb-ib" data-act="close">✕</button></div><div class="lb-crumb" id="lbCrumb"></div><div class="lb-body" id="lbBody"></div></div>';
  document.body.appendChild(ov);

  let isAdmin = false, sections = [], sec = null, mode = 'tree', path = [], items = [], form = null, loading = false, loadErr = '';
  const adminReady = (async () => {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return;
      const { data: p } = await sb.from('profiles').select('role').eq('id', session.user.id).maybeSingle();
      isAdmin = !!(p && p.role === 'admin');
    } catch (e) {}
  })();

  const isTreeSec = () => sec && sec.kind === 'tree';
  const curParent = () => path.length ? path[path.length - 1].id : null;
  const kidsOf = pid => items.filter(i => (i.parent_id ?? null) === pid);

  /* ===== কার্ড ===== */
  async function loadSections(force) {
    const { data, error } = await sb.from('lib_sections').select('*')
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true });
    if (error) return false;
    sections = data || [];
    if (sections.length || force) renderCards();
    return true;
  }
  function renderCards() {
    cats.innerHTML = sections.map(s => `<a class="cat-card" href="#" data-sec="${s.id}"><span class="ico">${esc(s.icon || '📁')}</span>${esc(s.title)}</a>`).join('');
  }
  async function setupBar() {
    await adminReady;
    if (!isAdmin || $('#libBar')) return;
    const bar = document.createElement('div');
    bar.id = 'libBar';
    bar.className = 'lib-bar';
    bar.innerHTML = '<button class="btn small" data-bar="newcard">➕ নতুন কার্ড</button><button class="btn small ghost" data-bar="manage">⚙️ কার্ড পরিচালনা</button>';
    cats.after(bar);
  }

  /* ===== ফোল্ডারের তথ্য ===== */
  async function load() {
    loading = true; loadErr = '';
    const { data, error } = await sb.from('lib_items').select('*').eq('section_id', sec.id)
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true }).limit(2000);
    loading = false;
    if (error) { items = []; loadErr = error.message; return; }
    items = data || [];
  }

  function crumbHtml() {
    const parts = [`<a data-act="crumb" data-i="-1">${esc(sec.title)}</a>`];
    path.forEach((n, i) => parts.push(`<a data-act="crumb" data-i="${i}">${esc(n.title)}</a>`));
    return parts.join(' › ');
  }

  function render() {
    const body = $('#lbBody'), crumb = $('#lbCrumb');
    if (form) {
      crumb.style.display = 'none';
      $('#lbTitle').textContent = mode === 'manage' ? '⚙️ কার্ড পরিচালনা' : (sec.icon + ' ' + sec.title);
      return form.type === 'card' ? cardFormView() : itemFormView();
    }
    if (mode === 'manage') {
      $('#lbTitle').textContent = '⚙️ কার্ড পরিচালনা';
      crumb.style.display = 'none';
      return manageView();
    }
    $('#lbTitle').textContent = (sec.icon || '') + ' ' + sec.title;
    crumb.style.display = path.length ? 'block' : 'none';
    crumb.innerHTML = crumbHtml();
    if (loading) { body.innerHTML = '<p class="lb-note">লোড হচ্ছে...</p>'; return; }
    if (loadErr) { body.innerHTML = `<p class="lb-note">লোড করা যায়নি: ${esc(loadErr)}<br>ডাটাবেসের SQL চালানো হয়েছে কি না দেখুন।</p>`; return; }
    const kids = kidsOf(curParent());
    let h = isAdmin ? '<button class="btn" data-act="add" style="width:100%;margin-bottom:6px">➕ এখানে যোগ করুন</button>' : '';
    if (!kids.length) {
      h += `<p class="lb-note">${isAdmin ? 'এখনো কিছু নেই। উপরের ➕ বাটন চেপে যোগ করুন।' : 'এখনো কিছু যোগ করা হয়নি।'}</p>`;
    } else {
      h += kids.map(n => {
        const cnt = kidsOf(n.id).length;
        const folder = cnt > 0 || !n.url;
        const link = (folder && n.url) ? `<button class="lb-lnk" data-act="link" data-id="${n.id}" title="লিংক খুলুন">🔗</button>` : '';
        const adm = isAdmin ? `<span class="lb-adm"><button data-act="up" data-id="${n.id}" title="উপরে">↑</button><button data-act="down" data-id="${n.id}" title="নিচে">↓</button><button data-act="edit" data-id="${n.id}" title="সম্পাদনা">✏️</button><button data-act="del" data-id="${n.id}" title="মুছুন">🗑️</button></span>` : '';
        return `<div class="lb-row" data-act="go" data-id="${n.id}"><span class="lb-ic">${folder ? '📁' : '🔗'}</span><div class="lb-mid"><b>${esc(n.title)}</b>${cnt ? `<small>${cnt}টি</small>` : ''}</div>${link}${adm}<span class="lb-arr">${folder ? '›' : '↗'}</span></div>`;
      }).join('');
    }
    body.innerHTML = h;
    body.scrollTop = 0;
  }

  function itemFormView() {
    const where = [sec.title].concat(path.map(n => n.title)).join(' › ');
    $('#lbBody').innerHTML = `<div class="lb-card"><b>${form.mode === 'add' ? '➕ নতুন যোগ করুন' : '✏️ সম্পাদনা'}</b>
      ${form.mode === 'add' ? `<div class="lb-note" style="padding:6px 0">যোগ হবে: ${esc(where)}</div>` : ''}
      <label>নাম *</label><input id="lbT" maxlength="200" value="${esc(form.title || '')}" placeholder="যেমন: পদার্থবিজ্ঞান / প্রথম পত্র / অধ্যায় ১">
      <label>লিংক (https:// দিয়ে শুরু; ফোল্ডার হলে ফাঁকা রাখুন)</label><input id="lbU" value="${esc(form.url || '')}" placeholder="https://..." autocapitalize="none">
      <div class="lb-btns"><button class="btn" data-act="save">সংরক্ষণ</button><button class="btn ghost" data-act="cancel">বাতিল</button></div></div>`;
  }

  function cardFormView() {
    $('#lbBody').innerHTML = `<div class="lb-card"><b>${form.mode === 'add' ? '➕ নতুন কার্ড' : '✏️ কার্ড সম্পাদনা'}</b>
      <label>কার্ডের নাম *</label><input id="lbT" maxlength="40" value="${esc(form.title || '')}" placeholder="যেমন: প্রশ্নব্যাংক">
      <label>আইকন (একটা ইমোজি)</label><input id="lbI" maxlength="8" value="${esc(form.icon || '')}" placeholder="📁">
      <div class="lb-btns"><button class="btn" data-act="save">সংরক্ষণ</button><button class="btn ghost" data-act="cancel">বাতিল</button></div></div>`;
  }

  function manageView() {
    $('#lbBody').innerHTML = '<button class="btn" data-act="newcard" style="width:100%;margin-bottom:6px">➕ নতুন কার্ড</button>' +
      (sections.length ? sections.map(s => `<div class="lb-row" style="cursor:default"><span class="lb-ic">${esc(s.icon)}</span><div class="lb-mid"><b>${esc(s.title)}</b><small>${KIND[s.kind] || ''}</small></div><span class="lb-adm"><button data-act="cup" data-id="${s.id}" title="আগে আনুন">↑</button><button data-act="cdown" data-id="${s.id}" title="পরে নিন">↓</button><button data-act="cedit" data-id="${s.id}" title="সম্পাদনা">✏️</button><button data-act="cdel" data-id="${s.id}" title="মুছুন">🗑️</button></span></div>`).join('') : '<p class="lb-note">কোনো কার্ড নেই। উপরের বাটনে নতুন কার্ড বানান।</p>');
  }

  /* ===== পর্দা খোলা ===== */
  async function openSection(s) {
    if (s.kind === 'contact') {
      const t = document.getElementById('contact');
      if (t) t.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    sec = s; mode = 'tree'; path = []; items = []; form = null; loadErr = '';
    ov.classList.add('open');
    $('#lbTitle').textContent = (s.icon || '') + ' ' + s.title;
    $('#lbCrumb').style.display = 'none';
    $('#lbBody').innerHTML = '<p class="lb-note">লোড হচ্ছে...</p>';
    await adminReady;
    if (s.kind === 'quiz') return quizList();
    if (s.kind === 'updates') return updatesList();
    loading = true; render();
    await load(); render();
  }

  async function openManage(addNew) {
    await adminReady;
    if (!isAdmin) return;
    sec = null; mode = 'manage'; path = [];
    form = addNew ? { type: 'card', mode: 'add' } : null;
    ov.classList.add('open');
    render();
  }

  async function quizList() {
    const { data, error } = await sb.from('quizzes').select('*').order('created_at', { ascending: false });
    const body = $('#lbBody');
    if (error) { body.innerHTML = '<p class="lb-note">লোড করা যায়নি।</p>'; return; }
    let h = isAdmin ? '<p class="lb-note">নতুন কুইজ বা প্রশ্ন যোগ করতে হোম পেজের নিচের নীল "+" বাটন ব্যবহার করুন।</p>' : '';
    h += data.length ? data.map(q => `<div class="lb-row" data-act="quiz" data-id="${q.id}" data-t="${esc(q.title)}"><span class="lb-ic">📝</span><div class="lb-mid"><b>${esc(q.title)}</b>${q.subject ? `<small>${esc(q.subject)}</small>` : ''}</div><span class="lb-arr">›</span></div>`).join('') : '<p class="lb-note">এখনো কোনো কুইজ যোগ করা হয়নি।</p>';
    body.innerHTML = h;
  }

  async function updatesList() {
    const { data, error } = await sb.from('updates').select('*').order('created_at', { ascending: false });
    const body = $('#lbBody');
    if (error) { body.innerHTML = '<p class="lb-note">লোড করা যায়নি।</p>'; return; }
    let h = isAdmin ? '<p class="lb-note">নতুন আপডেট যোগ করতে হোম পেজের নিচের নীল "+" বাটন ব্যবহার করুন।</p>' : '';
    h += data.length ? data.map(u => `<div class="lb-row" style="cursor:default"><span class="lb-ic">🆕</span><div class="lb-mid"><b>${esc(u.text)}</b><small>${new Date(u.created_at).toLocaleDateString('bn-BD')}</small></div></div>`).join('') : '<p class="lb-note">এখনো কোনো আপডেট নেই।</p>';
    body.innerHTML = h;
  }

  /* ===== সাজানো, সংরক্ষণ ===== */
  async function move(id, dir) {
    const n = items.find(x => x.id === id);
    if (!n) return;
    const sibs = kidsOf(n.parent_id ?? null).slice();
    const i = sibs.findIndex(x => x.id === id), j = i + dir;
    if (j < 0 || j >= sibs.length) return;
    [sibs[i], sibs[j]] = [sibs[j], sibs[i]];
    const ups = [];
    sibs.forEach((s, k) => { if (s.sort_order !== k) ups.push(sb.from('lib_items').update({ sort_order: k }).eq('id', s.id)); });
    await Promise.all(ups);
    await load(); render();
  }

  async function moveCard(id, dir) {
    const list = sections.slice();
    const i = list.findIndex(x => x.id === id), j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    const ups = [];
    list.forEach((s, k) => { if (s.sort_order !== k) ups.push(sb.from('lib_sections').update({ sort_order: k }).eq('id', s.id)); });
    await Promise.all(ups);
    await loadSections(true); render();
  }

  async function saveItem() {
    const title = ($('#lbT').value || '').trim(), url = ($('#lbU').value || '').trim();
    if (!title) return note('নাম লিখুন', true);
    if (url && !/^https?:\/\//i.test(url)) return note('লিংক https:// দিয়ে শুরু হতে হবে', true);
    let error;
    if (form.mode === 'add') {
      const pid = curParent();
      const max = kidsOf(pid).reduce((m, i) => Math.max(m, i.sort_order), 0);
      ({ error } = await sb.from('lib_items').insert({ section_id: sec.id, parent_id: pid, title, url: url || null, sort_order: max + 1 }));
    } else {
      ({ error } = await sb.from('lib_items').update({ title, url: url || null }).eq('id', form.id));
    }
    if (error) { console.error(error); return note('সংরক্ষণ করা যায়নি: ' + error.message, true); }
    note('✅ সংরক্ষণ হয়েছে');
    form = null;
    await load(); render();
  }

  async function saveCard() {
    const title = ($('#lbT').value || '').trim();
    const icon = ($('#lbI').value || '').trim() || '📁';
    if (!title) return note('নাম লিখুন', true);
    let error;
    if (form.mode === 'add') {
      const max = sections.reduce((m, s) => Math.max(m, s.sort_order), 0);
      ({ error } = await sb.from('lib_sections').insert({ title, icon, kind: 'tree', sort_order: max + 1 }));
    } else {
      ({ error } = await sb.from('lib_sections').update({ title, icon }).eq('id', form.id));
    }
    if (error) { console.error(error); return note('সংরক্ষণ করা যায়নি: ' + error.message, true); }
    note('✅ সংরক্ষণ হয়েছে');
    form = null;
    await loadSections(true); render();
  }

  function close() { ov.classList.remove('open'); form = null; }

  ov.addEventListener('click', async e => {
    if (e.target === ov) { close(); return; }
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const a = el.dataset.act, id = +el.dataset.id;
    try {
      switch (a) {
        case 'close': close(); break;
        case 'back':
          if (form) { form = null; render(); }
          else if (mode === 'tree' && isTreeSec() && path.length) { path.pop(); render(); }
          else close();
          break;
        case 'crumb': path = path.slice(0, +el.dataset.i + 1); render(); break;
        case 'go': {
          const n = items.find(x => x.id === id);
          if (!n) break;
          if (kidsOf(n.id).length || !n.url) { path.push(n); render(); }
          else window.open(n.url, '_blank', 'noopener');
          break;
        }
        case 'link': { const n = items.find(x => x.id === id); if (n && n.url) window.open(n.url, '_blank', 'noopener'); break; }
        case 'add': form = { type: 'item', mode: 'add' }; render(); break;
        case 'edit': { const n = items.find(x => x.id === id); if (n) { form = { type: 'item', mode: 'edit', id, title: n.title, url: n.url }; render(); } break; }
        case 'del': {
          const n = items.find(x => x.id === id);
          if (!n) break;
          const k = kidsOf(id).length;
          if (!confirm(`"${n.title}" মুছে ফেলবেন?${k ? '\nএর ভেতরের সবকিছুও মুছে যাবে।' : ''}\nএটা ফেরানো যাবে না।`)) break;
          const { error } = await sb.from('lib_items').delete().eq('id', id);
          if (error) { note('মোছা যায়নি: ' + error.message, true); break; }
          note('মুছে ফেলা হয়েছে');
          await load(); render();
          break;
        }
        case 'up': await move(id, -1); break;
        case 'down': await move(id, 1); break;
        case 'newcard': form = { type: 'card', mode: 'add' }; render(); break;
        case 'cedit': { const s = sections.find(x => x.id === id); if (s) { form = { type: 'card', mode: 'edit', id, title: s.title, icon: s.icon }; render(); } break; }
        case 'cdel': {
          const s = sections.find(x => x.id === id);
          if (!s) break;
          if (!confirm(`"${s.title}" কার্ডটি মুছে ফেলবেন?\nএর ভেতরের সব ফোল্ডার ও লিংকও মুছে যাবে।${s.kind !== 'tree' ? '\n(এটা বিল্ট-ইন কার্ড, মুছলে হোম পেজ থেকে এই অংশে যাওয়ার পথ থাকবে না।)' : ''}\nএটা ফেরানো যাবে না।`)) break;
          const { error } = await sb.from('lib_sections').delete().eq('id', id);
          if (error) { note('মোছা যায়নি: ' + error.message, true); break; }
          note('কার্ড মুছে ফেলা হয়েছে');
          await loadSections(true); render();
          break;
        }
        case 'cup': await moveCard(id, -1); break;
        case 'cdown': await moveCard(id, 1); break;
        case 'save': if (form && form.type === 'card') await saveCard(); else await saveItem(); break;
        case 'cancel': form = null; render(); break;
        case 'quiz':
          close();
          if (typeof openQuiz === 'function') openQuiz(el.dataset.id, el.dataset.t);
          break;
      }
    } catch (err) { console.error(err); note('কিছু একটা সমস্যা হয়েছে', true); }
  });

  document.addEventListener('click', e => {
    const c = e.target.closest('.cat-card[data-sec]');
    if (c) {
      e.preventDefault();
      const s = sections.find(x => String(x.id) === c.dataset.sec);
      if (s) openSection(s);
      return;
    }
    const b = e.target.closest('[data-bar]');
    if (b) openManage(b.dataset.bar === 'newcard');
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && ov.classList.contains('open')) close(); });

  (async () => { await loadSections(false); setupBar(); })();
})();
