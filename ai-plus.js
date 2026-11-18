(function () {
  var style = document.createElement('style');
  style.textContent = `
  .ai-fab{position:fixed;left:14px;bottom:calc(14px + env(safe-area-inset-bottom,0px));z-index:90;width:54px;height:54px;border-radius:50%;border:1px solid var(--line,#2a3b5c);background:var(--card,#12203a);color:var(--text,#fff);font-size:26px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35)}
  .ai-box{position:fixed;left:14px;bottom:calc(78px + env(safe-area-inset-bottom,0px));z-index:90;width:min(360px,calc(100vw - 28px));height:min(460px,calc(100vh - 140px));display:none;flex-direction:column;background:var(--card,#12203a);color:var(--text,#fff);border:1px solid var(--line,#2a3b5c);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.45);overflow:hidden}
  .ai-box.show{display:flex}
  .ai-head{padding:12px 14px;font-weight:600;border-bottom:1px solid var(--line,#2a3b5c)}
  .ai-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
  .ai-m{max-width:85%;padding:8px 12px;border-radius:12px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;font-size:15px}
  .ai-me{align-self:flex-end;background:var(--accent,#2b8cff);color:#fff}
  .ai-bot{align-self:flex-start;background:rgba(127,127,127,.18)}
  .ai-row{display:flex;gap:8px;padding:10px;border-top:1px solid var(--line,#2a3b5c)}
  .ai-row input{flex:1;min-width:0;padding:10px;border-radius:10px;border:1px solid var(--line,#2a3b5c);background:transparent;color:inherit;font-size:16px}
  .ai-row button{padding:0 14px;border-radius:10px;border:0;background:var(--accent,#2b8cff);color:#fff;cursor:pointer;font-size:15px}
  .ai-row button:disabled{opacity:.5}
  `;
  document.head.appendChild(style);

  var fab = document.createElement('button');
  fab.className = 'ai-fab';
  fab.textContent = '🤖';
  fab.setAttribute('aria-label', 'AI সহকারী');
  fab.style.display = 'none';

  var box = document.createElement('div');
  box.className = 'ai-box';
  box.innerHTML =
    '<div class="ai-head">🤖 AI সহকারী</div>' +
    '<div class="ai-msgs"></div>' +
    '<div class="ai-row"><input maxlength="500" placeholder="প্রশ্ন লিখুন..."><button>পাঠান</button></div>';

  document.body.appendChild(fab);
  document.body.appendChild(box);

  var msgs = box.querySelector('.ai-msgs');
  var inp = box.querySelector('input');
  var sendBtn = box.querySelector('button');
  var busy = false;
  var greeted = false;

  function add(text, who) {
    var d = document.createElement('div');
    d.className = 'ai-m ' + (who === 'me' ? 'ai-me' : 'ai-bot');
    d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
    return d;
  }

  fab.onclick = function () {
    box.classList.toggle('show');
    if (box.classList.contains('show') && !greeted) {
      greeted = true;
      add('আসসালামু আলাইকুম! পড়াশোনা বা সাইট নিয়ে কিছু জানতে চাইলে লিখুন।', 'bot');
    }
  };

  async function send() {
    var text = inp.value.trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    inp.value = '';
    add(text, 'me');
    var wait = add('লিখছি...', 'bot');
    try {
      var res = await sb.functions.invoke('ai-reply', { body: { message: text } });
      if (res.error) throw res.error;
      wait.textContent = (res.data && res.data.reply) || 'উত্তর পাওয়া যায়নি';
    } catch (e) {
      console.error(e);
      wait.textContent = 'এখন উত্তর দিতে পারছি না, একটু পরে চেষ্টা করুন';
    }
    busy = false;
    sendBtn.disabled = false;
    msgs.scrollTop = msgs.scrollHeight;
  }

  sendBtn.onclick = send;
  inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });

  async function refresh() {
    try {
      var r = await sb.auth.getSession();
      var ok = !!(r.data && r.data.session);
      fab.style.display = ok ? 'block' : 'none';
      if (!ok) box.classList.remove('show');
    } catch (e) {}
  }
  refresh();
  sb.auth.onAuthStateChange(function () { refresh(); });
})();
