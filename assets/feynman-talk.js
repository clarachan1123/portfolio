/* 「我来讲述」对话演示：滚到眼前播一遍。
   你的讲述逐字写进输入框 → 发出去成了右边的气泡 → 「节度使」被标出来 → AI 的追问冒出来。左边三条说明跟着亮。
   HTML 默认是播完的样子；减少动态效果时什么都不做。 */
(function () {
  var ph = document.querySelector('.fx');
  if (!ph) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var feed = ph.querySelector('.fx-feed'), inner = ph.querySelector('.fx-feed-in');
  var me = ph.querySelector('[data-step="me"]'), ask = ph.querySelector('[data-step="ask"]');
  var typing = ph.querySelector('[data-typing]'), placeholder = typing.textContent;
  var notes = document.querySelectorAll('.talk-notes li');
  var replay = document.querySelector('.talk-replay');
  var full = Array.from(me.textContent), timers = [];
  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function note(n) { notes.forEach(function (li) { var k = +li.getAttribute('data-t'); li.classList.toggle('on', k === n); li.classList.toggle('done', k < n); }); }
  function settle() {
    /* 内容超出屏幕时往上推，让最新一条留在输入框上面 */
    inner.style.transform = 'translateY(' + (-Math.max(0, inner.scrollHeight - feed.clientHeight)) + 'px)';
  }
  function reset() {
    timers.forEach(clearTimeout); timers = [];
    ph.classList.add('fx-live');
    me.hidden = true; ask.hidden = true; ask.classList.remove('thinking');
    me.classList.remove('marked');
    typing.textContent = placeholder; typing.classList.remove('on');
    note(1);
    inner.style.transition = 'none'; settle(); void inner.offsetWidth; inner.style.transition = '';
  }
  function play() {
    reset();
    after(1100, function () {
      typing.classList.add('on');
      var n = 0;
      (function type() {
        n = Math.min(n + 4, full.length);
        typing.textContent = full.slice(0, n).join('');
        typing.scrollTop = typing.scrollHeight;
        if (n < full.length) after(38, type);
        else after(500, function () {
          typing.textContent = placeholder; typing.classList.remove('on');
          me.hidden = false; settle();
          after(900, function () { me.classList.add('marked'); note(2); });
          after(1700, function () { ask.hidden = false; ask.classList.add('thinking'); settle(); });
          after(2700, function () { ask.classList.remove('thinking'); settle(); });
          after(3600, function () { note(3); });
        });
      })();
    });
  }
  replay.hidden = false;
  replay.addEventListener('click', play);
  if (!('IntersectionObserver' in window)) { play(); return; }
  var io = new IntersectionObserver(function (es) {
    if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); play(); }
  }, { threshold: 0.5 });
  io.observe(ph);
})();
