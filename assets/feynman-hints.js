/* 费曼问答页：三级提示演示。
   HTML 默认是三次额度都用完的样子；脚本接管后先收起三张提示卡，滚到眼前再播：
   点「提示」→ 提示 1 展开（1/3）→ 再点 → 提示 2（2/3）→ 再点 → 提示 3（3/3），按钮变成「提示已用完」。
   播完后可以「再看一遍」，或「自己点」：清空后由访客自己点「提示」。减少动态效果时什么都不做。 */
(function () {
  var phone = document.querySelector('.fq');
  if (!phone) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var feed = phone.querySelector('.fq-feed');
  var inner = phone.querySelector('.fq-feed-in');
  var hints = phone.querySelectorAll('.fq-hint');
  var ask = phone.querySelector('.fq-ask');
  var steps = document.querySelectorAll('#feynman .hint-steps li');
  var replay = document.querySelector('.fq-replay');
  var tryBtn = document.querySelector('.fq-try');
  var shifts = [0, 0, 0, 0];
  var shown = 3, playing = false, timers = [];

  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }

  /* 显示 n 张提示卡；instant 时不播过渡（量高度、复位用） */
  function show(n, instant) {
    shown = n;
    if (instant) phone.classList.add('fq-instant');
    hints.forEach(function (h, i) { h.classList.toggle('is-off', i >= n); });
    ask.classList.toggle('is-spent', n >= 3);
    steps.forEach(function (li, i) { li.classList.toggle('is-on', i < n); li.classList.toggle('is-now', i === n - 1); });
    inner.style.transform = 'translateY(' + (-shifts[n]) + 'px)';
    if (instant) { void inner.offsetWidth; phone.classList.remove('fq-instant'); }
  }

  /* 每个状态下内容要往上推多少，才能让「提示」按钮留在屏幕里：先瞬间切到各状态量一遍 */
  function measure() {
    var keep = shown;
    for (var n = 0; n <= 3; n++) {
      show(n, true);
      inner.style.transform = 'none';
      shifts[n] = Math.max(0, inner.scrollHeight - feed.clientHeight);
    }
    show(keep, true);
  }

  function tap(then) {
    ask.classList.remove('is-tap'); void ask.offsetWidth; ask.classList.add('is-tap');
    after(220, then);
  }

  function play() {
    timers.forEach(clearTimeout); timers = [];
    playing = true;
    phone.classList.remove('fq-free');
    show(0, true);
    var t = 900;
    [1, 2, 3].forEach(function (n) {
      after(t, function () { tap(function () { show(n); }); });
      t += 2600;
    });
    after(t - 1400, function () { playing = false; });
  }

  ask.addEventListener('click', function () {
    if (playing || !phone.classList.contains('fq-free') || shown >= 3) return;
    tap(function () { show(shown + 1); });
  });
  replay.addEventListener('click', play);
  tryBtn.addEventListener('click', function () {
    timers.forEach(clearTimeout); timers = [];
    playing = false;
    show(0, true);
    phone.classList.add('fq-free');
  });

  phone.classList.add('fq-live');
  document.documentElement.classList.add('fq-on');
  replay.hidden = false;
  tryBtn.hidden = false;
  measure();
  show(0, true);
  if ('ResizeObserver' in window) {
    var lastW = feed.clientWidth;
    new ResizeObserver(function () { if (feed.clientWidth !== lastW) { lastW = feed.clientWidth; measure(); } }).observe(feed);
  }

  if (!('IntersectionObserver' in window)) { play(); return; }
  var io = new IntersectionObserver(function (es) {
    if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); play(); }
  }, { threshold: 0.6 });
  io.observe(phone);
})();
