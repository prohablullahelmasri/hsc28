(function () {
  const NAME = 'Hablullah';
  const QUOTE = 'বন্ধুত্বের আরেক নাম চিনা বাদাম';
  const EMOJIS = ['😀','😂','😍','🥰','😎','🤔','😢','😡','👍','👎','🙏','👏','🔥','❤️','💔','🎉','🥜','📚','✅','❌','😴','🤝','💪','🌟'];
  const PEANUT = '<svg viewBox="0 0 120 120" width="120" height="120" aria-label="বাদাম"><path d="M60 8C77 8 89 19 89 34C89 44 81 50 77 56C83 62 91 70 91 84C91 101 77 113 60 113C43 113 29 101 29 84C29 70 37 62 43 56C39 50 31 44 31 34C31 19 43 8 60 8Z" fill="#e0a85f" stroke="#a36a2b" stroke-width="3"/><g fill="#b9803d"><circle cx="50" cy="26" r="2.2"/><circle cx="68" cy="30" r="2.2"/><circle cx="58" cy="40" r="2.2"/><circle cx="46" cy="76" r="2.2"/><circle cx="74" cy="72" r="2.2"/><circle cx="62" cy="96" r="2.2"/></g><circle cx="50" cy="82" r="4" fill="#3b2412"/><circle cx="70" cy="82" r="4" fill="#3b2412"/><path d="M52 94Q60 101 68 94" stroke="#3b2412" stroke-width="3" fill="none" stroke-linecap="round"/></svg>';

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tm = d => new Date(d).toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit' });
  const note = (m, e) => (typeof toast === 'function' ? toast(m, e) : alert(m));
  const ini = n => esc(String(n || '?').trim().charAt(0).toUpperCase());

  const css = document.createElement('style');
  css.textContent = `
  #chFab{position:fixed;left:16px;bottom:18px;width:56px;height:56px;border-radius:50%;border:0;font-size:26px;cursor:pointer;z-index:70;color:#fff;background:linear-gradient(135deg,#2b8cff,#12c2ff);box-shadow:0 8px 22px rgba(43,140,255,.55);transition:transform .25s}
  #chFab:hover{transform:scale(1.1)}
  #chBadge{position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;border-radius:10px;background:#e74c3c;color:#fff;font-size:12px;line-height:20px;padding:0 5px;display:none}
  #chOv{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:110;display:none;align-items:center;justify-content:center}
  #chOv.open{display:flex}
  #chBox{background:var(--bg);border:1px solid var(--line);width:min(460px,100%);height:min(720px,100%);display:flex;flex-direction:column;overflow:hidden;position:relative}
  @media(min-width:520px){#chBox{border-radius:18px;height:min(720px,92vh)}}
  .ch-splash{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px;cursor:pointer;background:radial-gradient(circle at top,#0a2350,#050d1f 70%)}
  .ch-splash svg{animation:chBob 2.4s ease-in-out infinite}
  @keyframes chBob{50%{transform:translateY(-8px) rotate(4deg)}}
  .ch-q{font-size:24px;font-weight:600;line-height:1.5;margin-top:14px;background:linear-gradient(90deg,#fff,#12c2ff);-webkit-background-clip:text;background-clip:text;color:transparent}
  .ch-n{margin-top:8px;font-size:13px;color:var(--muted)}
  .ch-hint{margin-top:26px;font-size:12px;color:var(--muted)}
  .ch-x{position:absolute;top:10px;right:12px;background:transparent;border:1px solid var(--line);color:var(--text);border-radius:8px;padding:3px 10px;cursor:pointer;z-index:2}
  .ch-head{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--card)}
  .ch-head h3{flex:1;font-size:17px;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ch-head small{display:block;font-size:12px;color:var(--accent2);font-weight:400}
  .ch-ib{background:transparent;border:0;color:var(--text);font-size:20px;cursor:pointer;padding:2px 6px}
  .ch-tabs{display:flex;border-bottom:1px solid var(--line);background:var(--card)}
  .ch-tabs button{flex:1;background:transparent;border:0;color:var(--muted);padding:10px 4px;font-family:inherit;font-size:14px;cursor:pointer;border-bottom:2px solid transparent}
  .ch-tabs button.on{color:var(--accent2);border-bottom-color:var(--accent2)}
  .ch-body{flex:1;overflow:auto;padding:10px}
  .ch-row{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;cursor:pointer}
  .ch-row:hover{background:rgba(43,140,255,.1)}
  .ch-av{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#2b8cff,#12c2ff);display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}
  .ch-mid{flex:1;min-width:0}
  .ch-mid b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ch-mid small{display:block;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ch-un{background:var(--accent);color:#fff;border-radius:10px;font-size:12px;padding:1px 7px}
  .ch-sec{color:var(--muted);font-size:13px;margin:12px 4px 4px}
  .ch-msgs{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:6px}
  .ch-m{max-width:80%;padding:8px 12px;border-radius:14px;background:var(--card2);border:1px solid var(--line);word-break:break-word;white-space:pre-wrap;align-self:flex-start;cursor:pointer}
  .ch-m.me{align-self:flex-end;background:linear-gradient(135deg,#1b6fe0,#12a8e0);border-color:transparent}
  .ch-m .by{display:block;font-size:12px;color:var(--accent2)}
  .ch-m .t{display:block;font-size:11px;opacity:.7;text-align:right;margin-top:2px}
  .ch-m.del{opacity:.6;font-style:italic}
  .ch-in{display:flex;gap:8px;padding:10px;border-top:1px solid var(--line);background:var(--card);align-items:flex-end}
  .ch-in textarea{flex:1;margin:0;min-height:42px;max-height:110px;resize:none;border-radius:20px;padding:10px 14px}
  .ch-emo{display:none;flex-wrap:wrap;gap:4px;padding:8px 10px;background:var(--card);border-top:1px solid var(--line)}
  .ch-emo span{font-size:22px;cursor:pointer;padding:2px 4px}
  .ch-foot{padding:8px;text-align:center;font-size:12px;color:var(--muted);border-top:1px solid var(--line)}
  .ch-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px;margin:8px 0}
  .ch-btns{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
  .ch-note{color:var(--muted);font-size:13px;margin:6px 0}
  `;
  document.head.appendChild(css);

  const fab = document.createElement('button');
  fab.id = 'chFab';
  fab.innerHTML = '💬<span id="chBadge"></span>';
  fab.setAttribute('aria-label', 'মেসেঞ্জার');
  const ov = document.createElement('div');
  ov.id = 'chOv';
  ov.innerHTML = '<div id="chBox"></div>';
  document.body.append(fab, ov);
  const box = ov.firstChild;

  let uid = null, me = null, isAdmin = false;
  let tab = 'chats', convs = [], cur = null, curMsgs = [];
  let fr = { rows: [], users: {} };
  let typingCh = null, typingTimer = null, lastTyp = 0, globalCh = null, seenSplash = false;

  const isOpen = () => ov.classList.contains('open');
  const head = (t, back) => `<div class="ch-head">${back ? `<button class="ch-ib" data-act="${back}">←</button>` : ''}<h3>${t}</h3><button class="ch-ib" data-act="close">✕</button></div>`;
  const otherUser = cv => (cv.members.find(x => x.user_id !== uid) || {}).chat_users;
  const cname = cv => cv.kind === 'group' ? (cv.title || 'গ্রুপ') : ((otherUser(cv) || {}).display_name || 'ব্যবহারকারী');
  const otherId = r => r.requester === uid ? r.addressee : r.requester;
  const relWith = id => fr.rows.find(r => otherId(r) === id);
  const U = id => fr.users[id] || { display_name: 'ব্যবহারকারী', username: '?' };
  const sortConvs = () => convs.sort((a, b) => new Date((b.last || b).created_at) - new Date((a.last || a).created_at));
  const reqCount = () => fr.rows.filter(r => r.status === 'pending' && r.addressee === uid).length;

  function beep() {
    try {
      const a = new (window.AudioContext || window.webkitAudioContext)();
      const o = a.createOscillator(), g = a.createGain();
      o.connect(g); g.connect(a.destination);
      o.frequency.value = 720; g.gain.value = .05;
      o.start(); o.stop(a.currentTime + .12);
    } catch (e) {}
  }

  function updBadge() {
    const n = convs.reduce((s, c) => s + (c.unread || 0), 0) + reqCount();
    const b = $('#chBadge');
    if (!b) return;
    b.style.display = n ? 'block' : 'none';
    b.textContent = n > 99 ? '99+' : n;
  }

  async function rpc(name, args, okMsg) {
    const { data, error } = await sb.rpc(name, args);
    if (error) {
      note(/too_fast/.test(error.message) ? 'একটু ধীরে চেষ্টা করুন' : /not_friends/.test(error.message) ? 'আগে বন্ধু হতে হবে' : 'কাজটি করা যায়নি', true);
      return { error };
    }
    if (okMsg) note(okMsg);
    return { data };
  }

  async function loadConvs() {
    const { data: mine } = await sb.from('conversation_members').select('conversation_id,last_read_at').eq('user_id', uid);
    const ids = (mine || []).map(r => r.conversation_id);
    if (!ids.length) { convs = []; updBadge(); return; }
    const [c, m, g] = await Promise.all([
      sb.from('conversations').select('*').in('id', ids),
      sb.from('conversation_members').select('conversation_id,user_id,role,last_read_at,chat_users(id,username,display_name)').in('conversation_id', ids),
      sb.from('chat_messages').select('*').in('conversation_id', ids).order('created_at', { ascending: false }).limit(300)
    ]);
    const lr = {};
    (mine || []).forEach(r => lr[r.conversation_id] = r.last_read_at);
    convs = (c.data || []).map(cv => {
      const members = (m.data || []).filter(x => x.conversation_id === cv.id);
      const list = (g.data || []).filter(x => x.conversation_id === cv.id);
      const unread = list.filter(x => x.sender_id !== uid && new Date(x.created_at) > new Date(lr[cv.id])).length;
      return { ...cv, members, last: list[0] || null, unread };
    });
    sortConvs();
    if (cur) cur = convs.find(c => c.id === cur.id) || cur;
    updBadge();
  }

  async function loadFriends() {
    const { data: rows } = await sb.from('friendships').select('*');
    const ids = new Set();
    (rows || []).forEach(r => { ids.add(r.requester); ids.add(r.addressee); });
    ids.delete(uid);
    const users = {};
    if (ids.size) {
      const { data } = await sb.from('chat_users').select('*').in('id', [...ids]);
      (data || []).forEach(u => users[u.id] = u);
    }
    fr = { rows: rows || [], users };
    updBadge();
  }

  function rerender() {
    if (!isOpen()) return;
    if (cur) drawMsgs(); else if ($('#chBody')) renderTab();
  }

  async function markRead(cid) {
    const cv = convs.find(c => c.id === cid);
    if (cv) cv.unread = 0;
    updBadge();
    try { await sb.rpc('mark_read', { p_cid: cid }); } catch (e) {}
  }

  /* ===== রিয়েলটাইম ===== */
  function subscribe() {
    if (globalCh) return;
    globalCh = sb.channel('chat-global')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, onMsg)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, onMsgUpd)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'conversation_members' }, onMem)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_members' }, async p => {
        if (p.new.user_id === uid) { await loadConvs(); rerender(); }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'friendships' }, onFr)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'friendships' }, onFr)
      .subscribe();
  }
  async function onFr() {
    await loadFriends();
    if (isOpen() && !cur && $('#chBody') && tab === 'friends') renderTab();
  }
  async function onMsg(p) {
    const m = p.new;
    let cv = convs.find(c => c.id === m.conversation_id);
    if (!cv) { await loadConvs(); cv = convs.find(c => c.id === m.conversation_id); if (!cv) return; }
    cv.last = m;
    if (cur && cur.id === m.conversation_id && isOpen()) {
      if (!curMsgs.some(x => x.id === m.id)) { curMsgs.push(m); drawMsgs(); }
      if (m.sender_id !== uid) markRead(cur.id);
    } else if (m.sender_id !== uid) {
      cv.unread = (cv.unread || 0) + 1;
      beep();
    }
    sortConvs(); updBadge();
    if (isOpen() && !cur && $('#chBody') && tab === 'chats') renderTab();
  }
  function onMsgUpd(p) {
    const m = p.new;
    const cv = convs.find(c => c.id === m.conversation_id);
    if (cv && cv.last && cv.last.id === m.id) cv.last = m;
    if (cur && cur.id === m.conversation_id) {
      const i = curMsgs.findIndex(x => x.id === m.id);
      if (i >= 0) { curMsgs[i] = m; drawMsgs(); }
    }
  }
  function onMem(p) {
    const n = p.new;
    const cv = convs.find(c => c.id === n.conversation_id);
    if (!cv) return;
    const mm = cv.members.find(x => x.user_id === n.user_id);
    if (mm) mm.last_read_at = n.last_read_at;
    if (cur && cur.id === cv.id) drawMsgs();
  }

  /* ===== "লিখছে..." ===== */
  function joinTyping(cid) {
    leaveTyping();
    typingCh = sb.channel('typing-' + cid, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (!payload || payload.uid === uid) return;
        const t = $('#chTyp');
        if (!t) return;
        t.textContent = (payload.name || 'কেউ') + ' লিখছে...';
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => { const x = $('#chTyp'); if (x) x.textContent = ''; }, 3000);
      }).subscribe();
  }
  function leaveTyping() {
    if (typingCh) { sb.removeChannel(typingCh); typingCh = null; }
    clearTimeout(typingTimer);
  }
  function closeAll() { ov.classList.remove('open'); leaveTyping(); cur = null; }

  /* ===== পর্দা ===== */
  function splash() {
    box.innerHTML = `<button class="ch-x" id="chX">✕</button><div class="ch-splash" id="chSp">${PEANUT}<div class="ch-q">“${QUOTE}”</div><div class="ch-n">— ${NAME}</div><div class="ch-hint">চালিয়ে যেতে ট্যাপ করুন</div></div>`;
    let t;
    const go = () => { clearTimeout(t); entry(); };
    $('#chSp').onclick = go;
    $('#chX').onclick = e => { e.stopPropagation(); clearTimeout(t); closeAll(); };
    t = setTimeout(go, 2600);
  }

  function entry() {
    cur = null;
    if (!uid) return loginView();
    if (!me) return setupView();
    mainView();
  }

  function loginView() {
    box.innerHTML = head('💬 মেসেঞ্জার') + `<div class="ch-body" style="text-align:center;padding:40px 20px"><div style="font-size:60px">🥜</div><p>চ্যাট করতে আগে লগইন করুন।</p><br><a class="btn" href="login.html">লগইন / রেজিস্টার</a></div>`;
  }

  function setupView() {
    box.innerHTML = head('প্রোফাইল তৈরি') + `<div class="ch-body">
      <p class="ch-note">অন্যরা আপনাকে এই ইউজারনেম ও নাম দিয়ে খুঁজবে। আপনার ইমেইল কেউ দেখবে না।</p>
      <p class="ch-note">মনে রাখবেন: বার্তা সার্ভারে সংরক্ষিত থাকে। কেউ রিপোর্ট করলে সেই বার্তা এডমিন দেখতে পারেন।</p>
      <input id="chUn" placeholder="ইউজারনেম (a-z, 0-9, _ ; ৩-২০ অক্ষর)" autocapitalize="none" autocomplete="off">
      <input id="chDn" placeholder="আপনার নাম" maxlength="40">
      <button class="btn" data-act="saveu" style="width:100%">সংরক্ষণ করুন</button><div id="chErr"></div></div>`;
  }

  function mainView() {
    cur = null; leaveTyping();
    box.innerHTML = head('💬 মেসেঞ্জার') + '<div class="ch-tabs" id="chTabs"></div><div class="ch-body" id="chBody"></div>' +
      `<div class="ch-foot">🥜 “${QUOTE}” — ${NAME}</div>`;
    renderTab();
  }

  function renderTab() {
    const b = $('#chBody');
    if (!b) return;
    const tabs = [['chats', 'চ্যাট'], ['friends', 'বন্ধু' + (reqCount() ? ' (' + reqCount() + ')' : '')]];
    if (isAdmin) tabs.push(['reports', 'রিপোর্ট']);
    $('#chTabs').innerHTML = tabs.map(t => `<button data-act="tab" data-t="${t[0]}" class="${t[0] === tab ? 'on' : ''}">${t[1]}</button>`).join('');
    if (tab === 'chats') b.innerHTML = chatsHtml();
    else if (tab === 'friends') b.innerHTML = friendsHtml();
    else reportsLoad(b);
  }

  function chatsHtml() {
    let h = '<button class="btn" data-act="newgroup" style="width:100%;margin-bottom:8px">➕ নতুন গ্রুপ</button>';
    if (!convs.length) return h + '<p class="ch-note">এখনো কোনো চ্যাট নেই। "বন্ধু" ট্যাব থেকে বন্ধু যোগ করে চ্যাট শুরু করুন।</p>';
    return h + convs.map(cv => {
      const n = cname(cv);
      const prev = cv.last ? (cv.last.deleted ? 'মুছে ফেলা হয়েছে' : cv.last.body) : 'নতুন চ্যাট';
      return `<div class="ch-row" data-act="open" data-id="${cv.id}"><div class="ch-av">${ini(n)}</div><div class="ch-mid"><b>${cv.kind === 'group' ? '👥 ' : ''}${esc(n)}</b><small>${esc(prev)}</small></div>${cv.unread ? `<span class="ch-un">${cv.unread}</span>` : ''}</div>`;
    }).join('');
  }

  function friendsHtml() {
    const inc = fr.rows.filter(r => r.status === 'pending' && r.addressee === uid);
    const out = fr.rows.filter(r => r.status === 'pending' && r.requester === uid);
    const fl = fr.rows.filter(r => r.status === 'accepted');
    const bl = fr.rows.filter(r => r.status === 'blocked' && r.blocked_by === uid);
    let h = `<div class="ch-card"><b>বন্ধু খুঁজুন</b><input id="chQ" placeholder="ইউজারনেম বা নাম" autocomplete="off" autocapitalize="none"><div class="ch-btns"><button class="btn small" data-act="search">খুঁজুন</button></div><div id="chRes"></div></div>`;
    h += `<div class="ch-note">আপনার ইউজারনেম: <b>@${esc(me.username)}</b></div>`;
    if (inc.length) {
      h += '<div class="ch-sec">বন্ধুত্বের অনুরোধ</div>' + inc.map(r => {
        const u = U(r.requester);
        return `<div class="ch-row"><div class="ch-av">${ini(u.display_name)}</div><div class="ch-mid"><b>${esc(u.display_name)}</b><small>@${esc(u.username)}</small></div><button class="btn small" data-act="acc" data-id="${r.id}">গ্রহণ</button><button class="btn small ghost" data-act="dec" data-id="${r.id}">বাতিল</button></div>`;
      }).join('');
    }
    if (out.length) {
      h += '<div class="ch-sec">পাঠানো অনুরোধ</div>' + out.map(r => {
        const u = U(r.addressee);
        return `<div class="ch-row"><div class="ch-av">${ini(u.display_name)}</div><div class="ch-mid"><b>${esc(u.display_name)}</b><small>@${esc(u.username)}</small></div><button class="btn small ghost" data-act="unfriend" data-uid="${r.addressee}">বাতিল</button></div>`;
      }).join('');
    }
    h += `<div class="ch-sec">বন্ধু (${fl.length})</div>`;
    h += fl.length ? fl.map(r => {
      const id = otherId(r), u = U(id);
      return `<div class="ch-row"><div class="ch-av">${ini(u.display_name)}</div><div class="ch-mid" data-act="dm" data-uid="${id}"><b>${esc(u.display_name)}</b><small>@${esc(u.username)}</small></div><button class="btn small" data-act="dm" data-uid="${id}">মেসেজ</button><button class="ch-ib" data-act="fmenu" data-uid="${id}">⋯</button></div>`;
    }).join('') : '<p class="ch-note">এখনো কোনো বন্ধু নেই।</p>';
    if (bl.length) {
      h += '<div class="ch-sec">ব্লক করা</div>' + bl.map(r => {
        const id = otherId(r), u = U(id);
        return `<div class="ch-row"><div class="ch-av">${ini(u.display_name)}</div><div class="ch-mid"><b>${esc(u.display_name)}</b><small>@${esc(u.username)}</small></div><button class="btn small ghost" data-act="unblock" data-uid="${id}">আনব্লক</button></div>`;
      }).join('');
    }
    return h;
  }

  async function reportsLoad(b) {
    b.innerHTML = '<p class="ch-note">লোড হচ্ছে...</p>';
    const { data, error } = await sb.from('chat_reports').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) { b.innerHTML = '<p class="ch-note">লোড করা যায়নি।</p>'; return; }
    b.innerHTML = data.length ? data.map(r => `<div class="ch-card"><b>${esc(r.reported_name || '')}</b> <small>— রিপোর্ট করেছেন ${esc(r.reporter_name || '')}</small>${r.message_text ? `<div class="ch-note">“${esc(r.message_text)}”</div>` : ''}<div class="ch-note">কারণ: ${esc(r.reason || '—')}</div><div class="ch-btns"><button class="btn small danger" data-act="delrep" data-id="${r.id}">রিপোর্ট মুছুন</button></div></div>`).join('') : '<p class="ch-note">কোনো রিপোর্ট নেই।</p>';
  }

  async function doSearch() {
    const raw = ($('#chQ').value || '').trim().toLowerCase().replace(/[^a-z0-9_\u0980-\u09FF ]/g, '');
    const out = $('#chRes');
    if (raw.length < 2) { out.innerHTML = '<p class="ch-note">অন্তত ২ অক্ষর লিখুন।</p>'; return; }
    const w = raw.replace(/\s+/g, '*');
    const { data, error } = await sb.from('chat_users').select('*').or(`username.ilike.${w}*,display_name.ilike.*${w}*`).neq('id', uid).limit(10);
    if (error) { out.innerHTML = '<p class="ch-note">খোঁজা যায়নি।</p>'; return; }
    if (!data.length) { out.innerHTML = '<p class="ch-note">কাউকে পাওয়া যায়নি।</p>'; return; }
    out.innerHTML = data.map(u => {
      const r = relWith(u.id);
      let b = '';
      if (!r) b = `<button class="btn small" data-act="req" data-uid="${u.id}">যোগ করুন</button>`;
      else if (r.status === 'accepted') b = `<button class="btn small" data-act="dm" data-uid="${u.id}">মেসেজ</button>`;
      else if (r.status === 'pending') b = r.requester === uid ? '<span class="ch-note">অনুরোধ পাঠানো হয়েছে</span>' : `<button class="btn small" data-act="acc" data-id="${r.id}">গ্রহণ</button>`;
      return `<div class="ch-row"><div class="ch-av">${ini(u.display_name)}</div><div class="ch-mid"><b>${esc(u.display_name)}</b><small>@${esc(u.username)}</small></div>${b}</div>`;
    }).join('');
  }

  /* ===== চ্যাট পর্দা ===== */
  async function openConv(cid) {
    cur = convs.find(c => c.id === cid);
    if (!cur) { await loadConvs(); cur = convs.find(c => c.id === cid); }
    if (!cur) return;
    const { data } = await sb.from('chat_messages').select('*').eq('conversation_id', cid).order('created_at', { ascending: false }).limit(100);
    curMsgs = (data || []).reverse();
    chatView();
    markRead(cid);
    joinTyping(cid);
  }

  function chatView() {
    const g = cur.kind === 'group';
    const peer = g ? null : otherUser(cur);
    box.innerHTML = `<div class="ch-head"><button class="ch-ib" data-act="back">←</button><h3>${g ? '👥 ' : ''}${esc(cname(cur))}<small id="chTyp"></small></h3>${g ? '<button class="ch-ib" data-act="ginfo">ⓘ</button>' : (peer ? `<button class="ch-ib" data-act="fmenu" data-uid="${peer.id}">⋯</button>` : '')}<button class="ch-ib" data-act="close">✕</button></div>
      <div class="ch-msgs" id="chMsgs"></div>
      <div class="ch-emo" id="chEmo">${EMOJIS.map(e => `<span data-act="emo" data-e="${e}">${e}</span>`).join('')}</div>
      <div class="ch-in"><button class="ch-ib" data-act="emotog">😊</button><textarea id="chTxt" rows="1" maxlength="1000" placeholder="বার্তা লিখুন..."></textarea><button class="btn" data-act="send">➤</button></div>`;
    drawMsgs();
  }

  function drawMsgs() {
    const el = $('#chMsgs');
    if (!el || !cur) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 120 || !el.dataset.init;
    el.dataset.init = '1';
    const g = cur.kind === 'group';
    const peer = g ? null : cur.members.find(x => x.user_id !== uid);
    el.innerHTML = curMsgs.map(m => {
      const mine = m.sender_id === uid;
      let by = '';
      if (g && !mine) {
        const mm = cur.members.find(x => x.user_id === m.sender_id);
        by = (mm && mm.chat_users && mm.chat_users.display_name) || 'সদস্য';
      }
      const seen = mine && peer && new Date(peer.last_read_at) >= new Date(m.created_at);
      const tick = mine && !m.deleted && !g ? (seen ? ' ✓✓' : ' ✓') : '';
      return `<div class="ch-m ${mine ? 'me' : ''} ${m.deleted ? 'del' : ''}" data-act="mact" data-id="${m.id}">${by ? `<span class="by">${esc(by)}</span>` : ''}${esc(m.deleted ? 'মুছে ফেলা হয়েছে' : m.body)}<span class="t">${tm(m.created_at)}${tick}</span></div>`;
    }).join('');
    if (near) el.scrollTop = el.scrollHeight;
  }

  async function send() {
    const t = $('#chTxt');
    if (!t || !cur) return;
    const body = t.value.trim();
    if (!body) return;
    t.value = '';
    const { data, error } = await sb.from('chat_messages').insert({ conversation_id: cur.id, sender_id: uid, body }).select().single();
    if (error) { t.value = body; note(/too_fast/.test(error.message) ? 'একটু ধীরে পাঠান' : 'পাঠানো যায়নি', true); return; }
    if (!curMsgs.some(x => x.id === data.id)) curMsgs.push(data);
    cur.last = data; sortConvs(); drawMsgs();
    const el = $('#chMsgs'); if (el) el.scrollTop = el.scrollHeight;
  }

  /* ===== গ্রুপ ===== */
  function newGroupView() {
    const fl = fr.rows.filter(r => r.status === 'accepted');
    box.innerHTML = head('নতুন গ্রুপ', 'tomain') + `<div class="ch-body">
      <input id="chGt" placeholder="গ্রুপের নাম" maxlength="60">
      <div class="ch-sec">সদস্য বাছুন (বন্ধুদের মধ্য থেকে)</div>
      ${fl.length ? fl.map(r => { const id = otherId(r), u = U(id); return `<label class="ch-row"><input type="checkbox" class="chPick" value="${id}" style="width:auto;margin:0"><div class="ch-av">${ini(u.display_name)}</div><div class="ch-mid"><b>${esc(u.display_name)}</b><small>@${esc(u.username)}</small></div></label>`; }).join('') : '<p class="ch-note">আগে কিছু বন্ধু যোগ করুন।</p>'}
      <button class="btn" data-act="mkgroup" style="width:100%;margin-top:10px">গ্রুপ তৈরি করুন</button></div>`;
  }

  function groupInfo() {
    if (!cur) return;
    const iAdmin = (cur.members.find(x => x.user_id === uid) || {}).role === 'admin';
    const inIds = cur.members.map(x => x.user_id);
    const addable = fr.rows.filter(r => r.status === 'accepted' && !inIds.includes(otherId(r)));
    box.innerHTML = head(esc(cur.title || 'গ্রুপ'), 'backchat') + `<div class="ch-body">
      <div class="ch-sec">সদস্য (${cur.members.length})</div>
      ${cur.members.map(m => { const u = m.chat_users || {}; return `<div class="ch-row"><div class="ch-av">${ini(u.display_name)}</div><div class="ch-mid"><b>${esc(u.display_name || 'সদস্য')}${m.role === 'admin' ? ' ⭐' : ''}</b><small>@${esc(u.username || '')}</small></div>${iAdmin && m.user_id !== uid ? `<button class="btn small danger" data-act="gkick" data-uid="${m.user_id}">সরান</button>` : ''}</div>`; }).join('')}
      ${iAdmin ? `<div class="ch-sec">বন্ধু যোগ করুন</div>${addable.length ? addable.map(r => { const id = otherId(r), u = U(id); return `<div class="ch-row"><div class="ch-av">${ini(u.display_name)}</div><div class="ch-mid"><b>${esc(u.display_name)}</b><small>@${esc(u.username)}</small></div><button class="btn small" data-act="gadd" data-uid="${id}">যোগ</button></div>`; }).join('') : '<p class="ch-note">যোগ করার মতো আর কোনো বন্ধু নেই।</p>'}` : ''}
      <button class="btn danger" data-act="gleave" style="width:100%;margin-top:14px">গ্রুপ ছেড়ে দিন</button></div>`;
  }

  /* ===== সব ক্লিক এক জায়গায় ===== */
  box.addEventListener('click', async e => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const a = el.dataset.act, d = el.dataset;
    try {
      switch (a) {
        case 'close': closeAll(); break;
        case 'tab': tab = d.t; renderTab(); break;
        case 'open': await openConv(d.id); break;
        case 'back': leaveTyping(); cur = null; mainView(); break;
        case 'tomain': mainView(); break;
        case 'backchat': chatView(); break;
        case 'saveu': {
          const un = ($('#chUn').value || '').trim().toLowerCase(), dn = ($('#chDn').value || '').trim();
          const er = $('#chErr');
          if (!/^[a-z0-9_]{3,20}$/.test(un)) { er.innerHTML = '<div class="msg err">ইউজারনেম ৩-২০ অক্ষরের হতে হবে (a-z, 0-9, _)।</div>'; break; }
          if (!dn) { er.innerHTML = '<div class="msg err">আপনার নাম লিখুন।</div>'; break; }
          const { data, error } = await sb.from('chat_users').insert({ id: uid, username: un, display_name: dn }).select().single();
          if (error) { er.innerHTML = `<div class="msg err">${error.code === '23505' ? 'এই ইউজারনেম আগেই নেওয়া হয়েছে।' : 'সংরক্ষণ করা যায়নি।'}</div>`; break; }
          me = data; await loadConvs(); await loadFriends(); subscribe(); mainView();
          break;
        }
        case 'search': await doSearch(); break;
        case 'req': await rpc('send_request', { p_target: d.uid }, 'অনুরোধ পাঠানো হয়েছে'); await loadFriends(); if ($('#chRes')) doSearch(); break;
        case 'acc': await rpc('respond_request', { p_req: +d.id, p_accept: true }, 'এখন আপনারা বন্ধু'); await loadFriends(); renderTab(); break;
        case 'dec': await rpc('respond_request', { p_req: +d.id, p_accept: false }); await loadFriends(); renderTab(); break;
        case 'unfriend': await rpc('remove_friend', { p_other: d.uid }); await loadFriends(); renderTab(); break;
        case 'unblock': await rpc('unblock_user', { p_target: d.uid }, 'আনব্লক করা হয়েছে'); await loadFriends(); renderTab(); break;
        case 'dm': {
          const { data, error } = await rpc('open_dm', { p_other: d.uid });
          if (error) break;
          await loadConvs(); await openConv(data);
          break;
        }
        case 'fmenu': {
          const c = prompt('১ = আনফ্রেন্ড\n২ = ব্লক\n৩ = রিপোর্ট\nনম্বর লিখুন:');
          if (c === '1') { await rpc('remove_friend', { p_other: d.uid }, 'আনফ্রেন্ড করা হয়েছে'); await loadFriends(); leaveTyping(); cur = null; mainView(); }
          else if (c === '2') { await rpc('block_user', { p_target: d.uid }, 'ব্লক করা হয়েছে'); await loadFriends(); leaveTyping(); cur = null; mainView(); }
          else if (c === '3') { const why = prompt('রিপোর্টের কারণ লিখুন:'); if (why !== null) await rpc('report_user', { p_user: d.uid, p_reason: why }, 'রিপোর্ট পাঠানো হয়েছে'); }
          break;
        }
        case 'newgroup': newGroupView(); break;
        case 'mkgroup': {
          const t = ($('#chGt').value || '').trim();
          if (!t) { note('গ্রুপের নাম লিখুন', true); break; }
          const ids = [...box.querySelectorAll('.chPick:checked')].map(x => x.value);
          const { data, error } = await rpc('create_group', { p_title: t, p_members: ids });
          if (error) break;
          await loadConvs(); await openConv(data);
          break;
        }
        case 'ginfo': groupInfo(); break;
        case 'gadd': await rpc('add_member', { p_cid: cur.id, p_user: d.uid }, 'যোগ করা হয়েছে'); await loadConvs(); groupInfo(); break;
        case 'gkick': if (confirm('সদস্যকে সরাবেন?')) { await rpc('remove_member', { p_cid: cur.id, p_user: d.uid }, 'সরানো হয়েছে'); await loadConvs(); groupInfo(); } break;
        case 'gleave':
          if (confirm('গ্রুপ ছেড়ে দেবেন?')) {
            const { error } = await sb.from('conversation_members').delete().eq('conversation_id', cur.id).eq('user_id', uid);
            if (error) { note('ছাড়া যায়নি', true); break; }
            leaveTyping(); cur = null; await loadConvs(); mainView();
          }
          break;
        case 'emotog': { const x = $('#chEmo'); x.style.display = x.style.display === 'flex' ? 'none' : 'flex'; break; }
        case 'emo': { const t = $('#chTxt'); t.value += d.e; t.focus(); break; }
        case 'send': await send(); break;
        case 'mact': {
          const m = curMsgs.find(x => String(x.id) === d.id);
          if (!m || m.deleted) break;
          if (m.sender_id === uid) { if (confirm('বার্তাটি মুছে ফেলবেন?')) await rpc('delete_message', { p_id: m.id }); }
          else if (confirm('এই বার্তাটি রিপোর্ট করবেন?')) {
            const why = prompt('রিপোর্টের কারণ লিখুন:');
            if (why !== null) await rpc('report_message', { p_id: m.id, p_reason: why }, 'রিপোর্ট পাঠানো হয়েছে');
          }
          break;
        }
        case 'delrep': await sb.from('chat_reports').delete().eq('id', +d.id); renderTab(); break;
      }
    } catch (err) { console.error(err); note('কিছু একটা সমস্যা হয়েছে', true); }
  });

  box.addEventListener('input', e => {
    if (e.target.id === 'chTxt') {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px';
      if (typingCh && Date.now() - lastTyp > 2000) {
        lastTyp = Date.now();
        typingCh.send({ type: 'broadcast', event: 'typing', payload: { uid, name: me.display_name } });
      }
    }
  });
  box.addEventListener('keydown', e => {
    if (e.target.id === 'chTxt' && e.key === 'Enter' && !e.shiftKey && !('ontouchstart' in window)) { e.preventDefault(); send(); }
    if (e.target.id === 'chQ' && e.key === 'Enter') doSearch();
  });

  fab.onclick = () => {
    ov.classList.add('open');
    if (!seenSplash) { seenSplash = true; splash(); } else entry();
  };
  ov.addEventListener('click', e => { if (e.target === ov) closeAll(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) closeAll(); });

  (async function init() {
    try {
      const { data: { session } } = await sb.auth.getSession();
      if (!session) return;
      uid = session.user.id;
      const { data: p } = await sb.from('profiles').select('role').eq('id', uid).maybeSingle();
      isAdmin = !!(p && p.role === 'admin');
      const { data: u } = await sb.from('chat_users').select('*').eq('id', uid).maybeSingle();
      me = u || null;
      if (me) { await loadConvs(); await loadFriends(); subscribe(); }
    } catch (e) { console.error(e); }
  })();
})();
