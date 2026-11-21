(function () {
  var style = document.createElement('style');
  style.textContent = `
  .ai-fab{position:fixed;left:92px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:90;width:64px;height:64px;border-radius:50%;border:0;background:linear-gradient(135deg,#4f46e5,#2563eb);color:#fff;font-size:30px;cursor:pointer;box-shadow:0 6px 18px rgba(37,99,235,.5);transition:transform .2s}
  .ai-fab:hover{transform:scale(1.08)}
  .ai-fab::before{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid #4f7cff;animation:aiPulse 2.4s ease-out infinite;pointer-events:none}
  .ai-fab::after{content:"";position:absolute;right:1px;top:1px;width:13px;height:13px;border-radius:50%;background:#22c55e;border:2px solid #fff}
  @keyframes aiPulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.7);opacity:0}}

  .ai-ov{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:95;opacity:0;visibility:hidden;transition:opacity .22s,visibility .22s}
  .ai-ov.show{opacity:1;visibility:visible}
  .ai-box{position:fixed;left:50%;top:50%;z-index:96;width:min(720px,calc(100vw - 20px));height:min(88vh,760px);height:min(88dvh,760px);max-height:calc(100vh - 20px);display:flex;flex-direction:column;background:var(--card,#12203a);color:var(--text,#fff);border:1px solid var(--line,#2a3b5c);border-radius:20px;box-shadow:0 14px 40px rgba(0,0,0,.55);overflow:hidden;opacity:0;visibility:hidden;transform:translate(-50%,-47%) scale(.97);transition:opacity .22s,transform .22s,visibility .22s}
  .ai-box.show{opacity:1;visibility:visible;transform:translate(-50%,-50%)}

  .ai-head{display:flex;align-items:center;gap:10px;padding:13px 14px;background:linear-gradient(135deg,#4f46e5,#2563eb);color:#fff}
  .ai-av{position:relative;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px}
  .ai-av::after{content:"";position:absolute;right:0;bottom:0;width:10px;height:10px;border-radius:50%;background:#22c55e;border:2px solid #3558d8}
  .ai-ttl{flex:1;line-height:1.25}
  .ai-ttl b{display:block;font-size:15px}
  .ai-ttl small{opacity:.9;font-size:12px}
  .ai-hb{background:rgba(255,255,255,.18);border:0;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:14px}
  .ai-hb:hover{background:rgba(255,255,255,.3)}

  .ai-msgs{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}
  .ai-m{max-width:88%;padding:9px 13px 6px;font-size:15px;line-height:1.55;word-wrap:break-word;animation:aiIn .25s ease}
  @keyframes aiIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .ai-me{align-self:flex-end;background:linear-gradient(135deg,#4f46e5,#2563eb);color:#fff;border-radius:18px 18px 4px 18px}
  .ai-bot{align-self:flex-start;background:rgba(127,127,127,.17);border-radius:18px 18px 18px 4px}
  .ai-t > div{margin:0}
  .ai-t .ai-li{padding-left:16px;position:relative}
  .ai-t .ai-li::before{content:"•";position:absolute;left:3px}
  .ai-t .ai-gap{height:6px}
  .ai-typing > div:last-child::after{content:"▌";margin-left:2px;animation:aiBlink 1s infinite}
  .ai-meta{display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:3px;font-size:11px;opacity:.65}
  .ai-cp{background:transparent;border:0;color:inherit;cursor:pointer;font-size:11px;padding:0;font-family:inherit}
  .ai-dots i{display:inline-block;width:7px;height:7px;margin:4px 2px;border-radius:50%;background:currentColor;opacity:.4;animation:aiBlink 1.2s infinite}
  .ai-dots i:nth-child(2){animation-delay:.2s}
  .ai-dots i:nth-child(3){animation-delay:.4s}
  @keyframes aiBlink{0%,80%,100%{opacity:.25}40%{opacity:1}}

  .ai-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 12px 10px}
  .ai-chip{background:transparent;border:1px solid #4f7cff;color:inherit;border-radius:16px;padding:6px 12px;font-size:13px;cursor:pointer;font-family:inherit;transition:background .15s}
  .ai-chip:hover{background:rgba(79,124,255,.18)}

  .ai-row{display:flex;gap:8px;padding:10px;border-top:1px solid var(--line,#2a3b5c)}
  .ai-row input{flex:1;min-width:0;padding:11px 15px;border-radius:22px;border:1px solid var(--line,#2a3b5c);background:transparent;color:inherit;font-size:16px;font-family:inherit;outline:none}
  .ai-row input:focus{border-color:#4f7cff}
  .ai-send{width:44px;height:44px;border-radius:50%;border:0;background:linear-gradient(135deg,#4f46e5,#2563eb);color:#fff;cursor:pointer;font-size:16px;flex-shrink:0}
  .ai-send:disabled{opacity:.5}
    .ai-t .ai-h{font-weight:700;font-size:16px;margin:12px 0 4px}
  .ai-t .ai-nu{padding-left:4px}
  `;
  document.head.appendChild(style);

  var fab = document.createElement('button');
  fab.className = 'ai-fab';
  fab.textContent = '🤖';
  fab.setAttribute('aria-label', 'Hablullah AI');

  var box = document.createElement('div');
  box.className = 'ai-box';
  box.innerHTML =
    '<div class="ai-head"><span class="ai-av">🤖</span>' +
    '<div class="ai-ttl"><b>Hablullah AI</b><small>অনলাইন • যেকোনো প্রশ্ন করুন</small></div>' +
    '<button class="ai-hb ai-clr" aria-label="চ্যাট মুছুন" title="নতুন চ্যাট">🗑</button>' +
    '<button class="ai-hb ai-x" aria-label="বন্ধ করুন">✕</button></div>' +
    '<div class="ai-msgs"></div>' +
    '<div class="ai-chips"></div>' +
    '<div class="ai-row"><input maxlength="1500" placeholder="প্রশ্ন লিখুন..."><button class="ai-send" aria-label="পাঠান">➤</button></div>';

  var ov = document.createElement('div');
  ov.className = 'ai-ov';

  document.body.appendChild(fab);
  document.body.appendChild(ov);
  document.body.appendChild(box);

  var msgs = box.querySelector('.ai-msgs');
  var chips = box.querySelector('.ai-chips');
  var inp = box.querySelector('input');
  var sendBtn = box.querySelector('.ai-send');
  var busy = false;
  var greeted = false;
  var hist = [];

  var QUICK = [
    'পরীক্ষার প্রস্তুতি কীভাবে নেব?',
    'পড়ার রুটিন বানিয়ে দাও',
    'সাইট কীভাবে ব্যবহার করব?'
  ];

  QUICK.forEach(function (q) {
    var c = document.createElement('button');
    c.className = 'ai-chip';
    c.textContent = q;
    c.onclick = function () { inp.value = q; send(); };
    chips.appendChild(c);
  });

  function nowTime() {
    try { return new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }); }
    catch (e) { return ''; }
  }
  function inline(row, line) {
    line.split(/(\*\*[^*]+\*\*)/).forEach(function (part) {
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        var b = document.createElement('strong');
        b.textContent = part.slice(2, -2);
        row.appendChild(b);
      } else if (part) {
        row.appendChild(document.createTextNode(part));
      }
    });
  }

  // শিরোনাম (##), তালিকা (-), নম্বর (১.), **বোল্ড** সাজানো
  function fmt(el, text) {
    el.textContent = '';
    String(text).split('\n').forEach(function (line) {
      var row = document.createElement('div');
      var h = line.match(/^\s*#{1,4}\s+(.*)/);
      var li = line.match(/^\s*[-*•]\s+(.*)/);
      var nu = line.match(/^\s*([0-9০-৯]+)[.)]\s+(.*)/);
      if (h) { row.className = 'ai-h'; line = h[1]; }
      else if (li) { row.className = 'ai-li'; line = li[1]; }
      else if (nu) { row.className = 'ai-nu'; line = nu[1] + '. ' + nu[2]; }
      else if (!line.trim()) row.className = 'ai-gap';
      inline(row, line);
      el.appendChild(row);
    });
  }
  function add(text, who) {
    var d = document.createElement('div');
    d.className = 'ai-m ' + (who === 'me' ? 'ai-me' : 'ai-bot');
    var t = document.createElement('div');
    t.className = 'ai-t';
    var meta = document.createElement('div');
    meta.className = 'ai-meta';
    d.appendChild(t);
    d.appendChild(meta);
    if (text) fmt(t, text);
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return { box: d, t: t, meta: meta };
  }

  function finish(m, text, canCopy) {
    m.t.classList.remove('ai-typing');
    fmt(m.t, text);
    m.meta.textContent = '';
    var time = document.createElement('span');
    time.textContent = nowTime();
    if (canCopy) {
      var cp = document.createElement('button');
      cp.className = 'ai-cp';
      cp.textContent = '📋 কপি';
      cp.onclick = function () {
        try {
          navigator.clipboard.writeText(text);
          cp.textContent = '✓ কপি হয়েছে';
          setTimeout(function () { cp.textContent = '📋 কপি'; }, 1500);
        } catch (e) {}
      };
      m.meta.appendChild(cp);
    }
    m.meta.appendChild(time);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function greet() {
    var g = add('', 'bot');
    finish(g, 'আসসালামু আলাইকুম! 👋 আমি Hablullah AI।\nযেকোনো বিষয়ে প্রশ্ন করতে পারেন, আমি উত্তর দেওয়ার চেষ্টা করব।', false);
  }

  function toggle(show) {
    var on = show === undefined ? !box.classList.contains('show') : show;
    box.classList.toggle('show', on);
    ov.classList.toggle('show', on);
    if (on && !greeted) { greeted = true; greet(); }
    if (on) setTimeout(function () { try { inp.focus(); } catch (e) {} }, 250);
  }

  fab.onclick = async function () {
    var r = await sb.auth.getSession();
    if (!(r.data && r.data.session)) {
      location.href = 'login.html?next=' + (location.pathname.split('/').pop() || 'index.html');
      return;
    }
    toggle();
  };
  ov.onclick = function () { toggle(false); };
  box.querySelector('.ai-x').onclick = function () { toggle(false); };
  box.querySelector('.ai-clr').onclick = function () {
    if (busy) return;
    msgs.textContent = '';
    hist = [];
    chips.style.display = 'flex';
    greet();
  };
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') toggle(false);
  });

  async function send() {
    var text = inp.value.trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    inp.value = '';
    chips.style.display = 'none';
    var mine = add('', 'me');
    finish(mine, text, false);
    var wait = add('', 'bot');
    wait.t.innerHTML = '<span class="ai-dots"><i></i><i></i><i></i></span>';

    var full = '';
    var first = true;

    try {
      var s = await sb.auth.getSession();
      var tok = s.data && s.data.session && s.data.session.access_token;
      if (!tok) throw new Error('no session');
      var resp = await fetch(sb.supabaseUrl + '/functions/v1/ai-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + tok,
          'apikey': sb.supabaseKey
        },
        body: JSON.stringify({ message: text, history: hist.slice(-8) })
      });
      if (!resp.ok || !resp.body) throw new Error('http ' + resp.status);
      var reader = resp.body.getReader();
      var dec = new TextDecoder();
      var buf = '';
      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buf += dec.decode(chunk.value, { stream: true });
        var lines = buf.split('\n');
        buf = lines.pop();
        for (var i = 0; i < lines.length; i++) {
          var ln = lines[i].trim();
          if (ln.indexOf('data:') !== 0) continue;
          var j;
          try { j = JSON.parse(ln.slice(5)); } catch (e) { continue; }
          if (j.err) throw new Error('stream');
          if (j.t) {
            full += j.t;
            if (first) { first = false; wait.t.classList.add('ai-typing'); }
            fmt(wait.t, full);
            msgs.scrollTop = msgs.scrollHeight;
          }
        }
      }
      if (!full) throw new Error('empty');
      finish(wait, full, true);
      hist.push({ r: 'user', t: text }, { r: 'model', t: full });
    } catch (e) {
      console.error(e);
      if (full) finish(wait, full, true);
      else finish(wait, 'এখন উত্তর দিতে পারছি না, একটু পরে চেষ্টা করুন', false);
    }
    busy = false;
    sendBtn.disabled = false;
  }

  sendBtn.onclick = send;
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });

  async function refresh() {
    try {
      var r = await sb.auth.getSession();
      var ok = !!(r.data && r.data.session);
      if (!ok) { box.classList.remove('show'); ov.classList.remove('show'); }
    } catch (e) {}
  }
  refresh();
  sb.auth.onAuthStateChange(function () { refresh(); });
})();
