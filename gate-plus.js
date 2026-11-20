(function () {
  var loggedIn = null; // null = এখনো জানা যায়নি

  // কোন কোন তালিকার লিংকে লগইন লাগবে
  var SEL = '#gov-list a, #pdf-list a, #batch-list a, #books-list a, #quiz-list a, #tools-list a, #updates-list a';

  // লগআউট অবস্থায় লিংকের পাশে 🔒 দেখাবে
  var st = document.createElement('style');
  st.textContent =
    'body.guest #gov-list li a::after, body.guest #pdf-list li a::after, body.guest #batch-list li a::after,' +
    'body.guest #books-list li a::after, body.guest #quiz-list li a::after, body.guest #tools-list li a::after,' +
    'body.guest #updates-list li a::after{content:" 🔒";font-size:13px;opacity:.8}';
  document.head.appendChild(st);

  function setState(v) {
    loggedIn = v;
    document.body.classList.toggle('guest', !v);
  }

  function goLogin() {
    location.href = 'login.html?next=' + (location.pathname.split('/').pop() || 'index.html');
  }

  function check() {
    return sb.auth.getSession()
      .then(function (r) { setState(!!(r.data && r.data.session)); })
      .catch(function () { setState(false); });
  }

  check();
  sb.auth.onAuthStateChange(function (ev, s) { setState(!!s); });

  // ক্লিক আটকানো (সবার আগে ধরার জন্য capture)
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest(SEL);
    if (!a) return;
    if (loggedIn === true) return;
    e.preventDefault();
    e.stopPropagation();
    if (loggedIn === false) { goLogin(); return; }
    check().then(function () {
      if (loggedIn) a.click(); else goLogin();
    });
  }, true);
})();
