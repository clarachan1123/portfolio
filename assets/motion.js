/* ══ 全站交互：入场、章节进度、到达提示、数字滚动、懒加载淡入、复制邮箱 ══════════
   原则：
   · 只用 IntersectionObserver，不监听 scroll 事件；只动 transform / opacity。
   · 只动「结构」（标题组、卡片组、图版、阶梯），正文段落不动——读的时候页面是静的。
   · 系统开了「减少动态效果」：不加任何入场类，数字直接显示终值，弹窗不缩放。
   · JS 不跑，页面照常可读：所有「先藏后显」都挂在 html.motion 下面，由这里加上。 */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ── 1. 入场 ─────────────────────────────────────────────────
     单位：章节眉题 + 标题、图版、决策卡组、阶梯、导航卡组、间奏、收尾。
     组里的子项按顺序错开 80ms，最多 5 项（再多就不是「引导」而是「表演」）。 */
  var UNITS = [
    /* 案例页大标题不做入场：它是页面切换时的共享元素，由 View Transition 负责 */
    '.case-head .case-dek', '.thread',
    '.cover h1', '.cover-lede', '.cover-go',
    '.band-head', '.entry', '.plate', '.plate-lead', '.chain-plate',
    '.step-kicker', '.step-body > h2', '.decisions', '.stair', '.steps7',
    '.shot', '.shot-wide', '.filmstrip', '.pair', '.mega',
    '.interlude', '.map-band', '.reveal-stair', '.reveal > h2', '.case-next',
    /* 首页张力版 */
    '.tz-r', '.tz-qs', '.tz-mess', '.tz-pains', '.tz-ans'
  ].join(',');
  var STAGGER_GROUPS = '.thread, .decisions, .stair, .steps7, .reveal-stair, .filmstrip, .pair, .entry-stats, .tz-qs, .tz-mess, .tz-pains, .tz-ans';

  if (!reduce && hasIO) {
    doc.classList.add('motion');
    var units = Array.prototype.slice.call(document.querySelectorAll(UNITS));
    /* 首页开屏在播时，封面交给 intro.js，这里不再管 */
    if (doc.classList.contains('intro')) units = units.filter(function (el) { return !el.closest('.cover'); });
    units.forEach(function (el) {
      el.classList.add('rv');
      if (el.matches(STAGGER_GROUPS)) {
        Array.prototype.slice.call(el.children).forEach(function (c, i) {
          c.style.setProperty('--i', Math.min(i, 5));
        });
      }
    });
    /* 首屏：已经在视口里的单位按文档顺序依次出现（标题 → 导语 → 导航），总时长 < 700ms */
    var firstScreen = 0;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (performance.now() < 1200) el.style.setProperty('--d', (firstScreen++ * 90) + 'ms');
        el.classList.add('in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    units.forEach(function (el) { io.observe(el); });
  }

  /* ── 2. 关键数字滚动：每页最多一个（64%），其余数字保持安静 ─────────── */
  var mega = document.querySelector('.mega b');
  if (mega && hasIO && !reduce) {
    var end = parseFloat(mega.textContent), unit = mega.textContent.replace(/[\d.]/g, '');
    mega.setAttribute('aria-label', mega.textContent);
    var mio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return;
      mio.disconnect();
      var t0 = null, DUR = 900;
      function tick(t) {
        if (t0 === null) t0 = t;
        var p = Math.min(1, (t - t0) / DUR);
        var eased = 1 - Math.pow(1 - p, 4);            /* easeOutQuart：前快后慢，停得稳 */
        mega.textContent = Math.round(end * eased) + unit;
        if (p < 1) requestAnimationFrame(tick);
      }
      mega.textContent = '0' + unit;
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    mio.observe(mega);
  }

  /* ── 3. 章节进度：左侧细栏列出章节编号，当前章节高亮 ─────────────────
     只在宽屏出现（CSS 控制）。用 IO 判断「哪一章的标题区占着视口中线」，不算滚动百分比。 */
  var steps = Array.prototype.slice.call(document.querySelectorAll('.chain > .step[id]'));
  if (steps.length >= 3 && hasIO) {
    var rail = document.createElement('nav');
    rail.className = 'toc-rail';
    rail.setAttribute('aria-label', '本页章节');
    rail.innerHTML = steps.map(function (s) {
      var num = (s.querySelector('.step-num') || {}).textContent || '';
      var name = (s.querySelector('.step-kicker') || {}).firstChild;
      name = name ? name.textContent.trim() : '';
      return '<a href="#' + s.id + '"><b>' + num + '</b><span>' + name + '</span></a>';
    }).join('');
    document.body.appendChild(rail);
    var links = rail.querySelectorAll('a');
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var i = steps.indexOf(e.target);
        if (e.isIntersecting) {
          links.forEach(function (a, j) { a.classList.toggle('on', j === i); });
          rail.classList.toggle('on-dark', e.target.classList.contains('is-dark'));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });     /* 视口中线那一条带：谁压着中线谁就是当前章 */
    steps.forEach(function (s) { sio.observe(s); });
    /* 页首到第一章之前、收尾之后不显示：读者在看总览时不需要定位 */
    var first = steps[0], tail = document.querySelector('.reveal, .case-next');
    var vio = new IntersectionObserver(function () {
      var a = first.getBoundingClientRect().top < window.innerHeight * .6;
      var b = tail ? tail.getBoundingClientRect().top > window.innerHeight * .5 : true;
      rail.classList.toggle('show', a && b);
    }, { threshold: [0, 1] });
    vio.observe(first); if (tail) vio.observe(tail);
    steps.forEach(function (s) { vio.observe(s); });
  }

  /* ── 4. 懒加载图片：加载完成前是纸色底，完成后 300ms 淡入（不移位，宽高早已占好） ── */
  Array.prototype.slice.call(document.querySelectorAll('img[loading="lazy"]')).forEach(function (img) {
    if (img.complete && img.naturalWidth) return;
    img.classList.add('wait');
    img.addEventListener('load', function () { img.classList.remove('wait'); }, { once: true });
    img.addEventListener('error', function () { img.classList.remove('wait'); }, { once: true });
  });

  /* ── 5. 复制邮箱：站点唯一的「表单式」操作。成功 / 失败都给明确反馈，并读给读屏软件 ── */
  Array.prototype.slice.call(document.querySelectorAll('[data-copy]')).forEach(function (btn) {
    var label = btn.textContent, timer = null;
    var live = document.createElement('span');
    live.className = 'sr-only'; live.setAttribute('aria-live', 'polite');
    btn.after(live);
    function done(ok) {
      btn.dataset.state = ok ? 'ok' : 'fail';
      btn.textContent = ok ? '已复制 ✓' : '没复制成功，请手动选中';
      live.textContent = ok ? '邮箱已复制' : '复制失败，请手动选中邮箱';
      clearTimeout(timer);
      timer = setTimeout(function () { btn.dataset.state = ''; btn.textContent = label; live.textContent = ''; }, ok ? 1800 : 3200);
    }
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      btn.dataset.state = 'busy';
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
        ta.remove(); done(ok);
      }
    });
  });

  /* ── 6. 点导航跳到章节：落地后标题眉题闪一下，告诉读者「到了，就是这一章」 ── */
  function arrive(id) {
    var t = id && document.getElementById(id);
    if (!t || reduce) return;
    t.classList.remove('arrived'); void t.offsetWidth; t.classList.add('arrived');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute('href').length > 1) setTimeout(function () { arrive(a.getAttribute('href').slice(1)); }, reduce ? 0 : 420);
  });
})();
