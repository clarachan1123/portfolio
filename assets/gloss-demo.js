/* Gloss 阅读页演示：复刻 withglossline.com 首页的演示动画（源码 components/landing/LandingDemo.tsx）。
   时间轴与源码一致：等 1s → 指针移到目标句 650ms → 按下 180ms → 白话每 45ms 出 4 个字
   → 停 1.6s → 移到「听不懂」700ms → 按下 260ms → 加载 700ms → 解释每 70ms 出 4 个字 → 停 600ms，指针退到段尾。
   HTML 默认就是播完的样子；减少动态效果时什么都不做。 */
(function () {
  var root = document.querySelector('.gdemo');
  if (!root) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = root.querySelector('.gdemo-canvas');
  var target = root.querySelector('.gdemo-target');
  var panel = root.querySelector('.gdemo-panel');
  var glossEl = root.querySelector('.gdemo-gloss');
  var explainBox = root.querySelector('.gdemo-explain');
  var explainEl = root.querySelector('.gdemo-explain-text');
  var explainBtn = root.querySelector('.is-explain');
  var pointer = root.querySelector('.gdemo-pointer');
  var replay = root.querySelector('.gdemo-replay');
  var steps = document.querySelectorAll('.demo-steps li');
  var GLOSS = Array.from(glossEl.textContent);
  var EXPLAIN = Array.from(explainEl.textContent);
  var timers = [];

  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clear() { timers.forEach(clearTimeout); timers = []; }
  function phase(name) { pointer.className = 'gdemo-pointer is-' + name; }
  function step(n) {
    steps.forEach(function (li) {
      var k = +li.dataset.step;
      li.className = k === n ? 'is-current' : k < n ? 'is-done' : '';
    });
  }
  function rel(rect, dx, dy) {
    var c = canvas.getBoundingClientRect();
    return { x: rect.left - c.left + dx, y: rect.top - c.top + dy };
  }
  function moveTo(p) { pointer.style.left = p.x + 'px'; pointer.style.top = p.y + 'px'; }
  function type(el, chars, every, done) {
    var shown = 0;
    (function tick() {
      shown = Math.min(shown + 4, chars.length);
      el.textContent = chars.slice(0, shown).join('');
      if (shown < chars.length) after(every, tick); else done();
    })();
  }

  /* 回到起点：面板收起，指针放在右上角 */
  function reset() {
    clear();
    root.classList.remove('is-target', 'is-pressed', 'is-open', 'is-explaining');
    explainBox.classList.remove('is-pending');
    glossEl.textContent = '';
    explainEl.textContent = '';
    step(0);
    pointer.style.transition = 'none';
    moveTo({ x: Math.max(0, canvas.clientWidth - 30), y: 10 });
    phase('waiting');
    void pointer.offsetWidth;
    pointer.style.transition = '';
  }

  function play() {
    reset();
    root.classList.add('is-playing');
    after(1000, function () {
      phase('moving'); step(1);
      var r = target.getClientRects()[0];
      moveTo(rel(r, Math.min(r.width / 2, 32), r.height / 2));
      after(650, function () {
        phase('clicking');
        after(180, function () {
          phase('revealing');
          root.classList.add('is-open');
          type(glossEl, GLOSS, 45, function () {
            after(1600, function () {
              phase('explain-moving'); step(2);
              var b = explainBtn.getBoundingClientRect();
              moveTo(rel(b, 22, b.height / 2));
              after(700, function () {
                phase('explain-clicking');
                root.classList.add('is-pressed');
                after(260, function () {
                  root.classList.remove('is-pressed');
                  root.classList.add('is-explaining');
                  explainBox.classList.add('is-pending');
                  phase('explain-pending');
                  after(700, function () {
                    explainBox.classList.remove('is-pending');
                    type(explainEl, EXPLAIN, 70, function () {
                      after(600, function () {
                        /* 指针退到最后一段段尾，目标句保持高亮 */
                        var tail = root.querySelector('.gdemo-panel + .gdemo-para span');
                        var rs = tail.getClientRects(), last = rs[rs.length - 1];
                        moveTo(rel(last, last.width + 10, 2));
                        phase('settled');
                        root.classList.add('is-target');
                        root.classList.remove('is-playing');
                        step(3);
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  /* 播完之后访客可以自己点：点目标句展开 / 收起白话，点「听不懂」出解释。
     文字都是写死的，不调用任何接口。播放中点击不响应。 */
  function manualOpen() {
    clear();
    pointer.className = 'gdemo-pointer is-gone';
    root.classList.remove('is-explaining', 'is-target');
    explainEl.textContent = '';
    explainBox.classList.remove('is-pending');
    glossEl.textContent = '';
    root.classList.add('is-open', 'is-target');
    step(1);
    type(glossEl, GLOSS, 45, function () {});
  }
  function manualExplain() {
    if (root.classList.contains('is-explaining')) return;
    clear();
    glossEl.textContent = GLOSS.join('');
    root.classList.add('is-explaining');
    explainBox.classList.add('is-pending');
    step(2);
    after(700, function () {
      explainBox.classList.remove('is-pending');
      type(explainEl, EXPLAIN, 70, function () { step(3); });
    });
  }
  target.setAttribute('role', 'button');
  target.tabIndex = 0;
  explainBtn.setAttribute('role', 'button');
  explainBtn.tabIndex = 0;
  function onTarget() {
    if (root.classList.contains('is-playing')) return;
    if (root.classList.contains('is-open')) { clear(); root.classList.remove('is-open', 'is-explaining', 'is-target'); step(0); }
    else manualOpen();
  }
  function onExplain() {
    if (root.classList.contains('is-playing') || !root.classList.contains('is-open')) return;
    manualExplain();
  }
  function keyed(fn) { return function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } }; }
  target.addEventListener('click', onTarget);
  target.addEventListener('keydown', keyed(onTarget));
  explainBtn.addEventListener('click', onExplain);
  explainBtn.addEventListener('keydown', keyed(onExplain));

  /* 按播完后的高度给正文留位，播放时下面的内容不跟着跳；宽度变了重新量 */
  var body = root.querySelector('.gdemo-body');
  function reserve() {
    var ghost = body.cloneNode(true);
    ghost.style.cssText = 'position:absolute;visibility:hidden;left:0;top:0;width:' + body.clientWidth + 'px;min-height:0';
    ghost.querySelector('.gdemo-panel').style.display = 'block';
    ghost.querySelector('.gdemo-explain').style.display = 'block';
    ghost.querySelector('.gdemo-gloss').textContent = GLOSS.join('');
    ghost.querySelector('.gdemo-explain-text').textContent = EXPLAIN.join('');
    canvas.appendChild(ghost);
    body.style.minHeight = ghost.offsetHeight + 'px';
    canvas.removeChild(ghost);
  }
  reserve();
  if ('ResizeObserver' in window) {
    var lastW = body.clientWidth;
    new ResizeObserver(function () { if (body.clientWidth !== lastW) { lastW = body.clientWidth; reserve(); } }).observe(canvas);
  }

  root.classList.add('is-live');
  document.documentElement.classList.add('gdemo-on');
  replay.hidden = false;
  reset();
  replay.addEventListener('click', play);

  /* 演示区露出一半以上才开始播，只自动播一次 */
  if (!('IntersectionObserver' in window)) { play(); return; }
  var io = new IntersectionObserver(function (es) {
    if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); play(); }
  }, { threshold: 0.5 });
  io.observe(root.querySelector('.gdemo-stage'));
})();
