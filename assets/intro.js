/* 首页开屏：名字 → 标题升起 → 指针点一下「从零」→ 导语像 Gloss 撑开白话那样逐字写出来 → 按钮出现。
   约 3 秒。点击、滚动、按任意键都会直接跳到最后。每次访问只播一次（sessionStorage）；
   开了「减少动态效果」、带锚点进来、或页面不在顶部时不播。
   head 里有一小段内联脚本先给 <html> 加 .intro，避免开屏前闪一下完整页面。 */
(function () {
  var html = document.documentElement;
  if (!html.classList.contains('intro')) return;
  var cover = document.querySelector('.cover');
  if (!cover || window.scrollY > 80) { html.classList.remove('intro'); return; }
  var h1 = cover.querySelector('h1');
  var em = h1 && h1.querySelector('em');
  var lede = cover.querySelector('.cover-lede');
  var timers = [], done = false;
  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }

  var splash = document.createElement('div');
  splash.className = 'intro-splash';
  splash.setAttribute('aria-hidden', 'true');
  splash.innerHTML = '<b>' + '陈利行'.split('').map(function (c, i) { return '<i style="--i:' + i + '">' + c + '</i>'; }).join('') +
    '</b><span>CHEN LIXING · PORTFOLIO 2026</span>';
  document.body.appendChild(splash);

  var pointer = document.createElement('span');
  pointer.className = 'intro-pointer';
  pointer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pointer);

  var full = lede ? lede.textContent : '';

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    if (lede) { lede.textContent = full; lede.style.minHeight = ''; }
    html.classList.remove('intro', 'intro-1', 'intro-2', 'intro-3', 'intro-4');
    splash.classList.add('out');
    pointer.remove();
    setTimeout(function () { splash.remove(); }, 400);
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) { window.removeEventListener(t, finish, true); });
    try { sessionStorage.setItem('intro', '1'); } catch (e) {}
  }
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (t) { window.addEventListener(t, finish, true); });

  /* 1. 名字 */
  html.classList.add('intro-1');
  /* 2. 名字退场，页头和标题升起 */
  after(1050, function () { splash.classList.add('out'); html.classList.add('intro-2'); });
  /* 3. 指针移到「从零」，按下 */
  after(1750, function () {
    if (!em) return;
    var r = em.getBoundingClientRect();
    pointer.style.left = (r.right + 60) + 'px';
    pointer.style.top = (r.bottom + 50) + 'px';
    pointer.classList.add('on');
    after(80, function () {
      pointer.style.left = (r.left + r.width * .55) + 'px';
      pointer.style.top = (r.top + r.height * .55) + 'px';
    });
    after(760, function () { pointer.classList.add('press'); html.classList.add('intro-3'); });
  });
  /* 4. 导语逐字写出（先按最终高度留位，下面不跳） */
  after(2650, function () {
    if (!lede) return finish();
    lede.style.minHeight = lede.offsetHeight + 'px';
    lede.textContent = '';
    html.classList.add('intro-4');
    pointer.classList.remove('press');
    pointer.classList.add('fade');
    var chars = Array.from(full), n = 0;
    (function type() {
      n = Math.min(n + 3, chars.length);
      lede.textContent = chars.slice(0, n).join('');
      if (n < chars.length) after(22, type); else after(450, finish);
    })();
  });
})();
