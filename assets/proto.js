/* 可交互原型引擎：把 HTML 写的一排低保真手机（.proto > .ps），变成一部能点的手机。

   没有脚本时（含画布）：一排手机 + 批注，和原来的原型图一样，`.st-off` 的元素不显示。
   脚本接管后（.proto.is-live）：一次只显示一个界面，左边是界面列表和当前界面的批注。

   HTML 里用这些属性描述交互（都写在原型内部的元素上）：
     data-go="att-2"            点击后跳到 id 为 att-2 的界面
     data-set="k=v; k2="        点击后设置状态（写空值 = 清掉）；状态存在 .proto 的 data-k 上
     data-then="5000: k=v"      点击后过 5 秒再设置状态（可写 go=界面id）
     data-then-if="k=v"         到点时状态还满足才执行（比如点了 Undo 就不再删）
     data-flip="k=v"            点击在 v 和空之间来回切换（开关一类）
     data-tog                   点击切换自己的 .on（勾选框一类）
     data-when="k=v|w, k2!=x"   只在状态满足时显示：逗号 = 或，& = 且，| = 多个可选值
     data-on="k=v"              状态满足时加 .on（单选、开关的选中样式）
     data-sum="32"              文本 = 32 + 本界面里 [data-tog].on 的个数
     界面上的 data-auto="3200: go=ai-4"   进入界面 3.2 秒后自动执行（期间点过界面就取消）
     界面上的 data-enter="k=v"           进入界面时设置状态
     .proto 上的 data-init="k=v"         初始状态（也是「重来」回到的状态）
     data-hint                  提示「下一步点这里」，轻轻发光
     .proto 上的 data-demo="选择器 | ~毫秒 | @界面id | ..."   自动演示：按顺序点这些元素（在当前界面里找）、
                                等几毫秒、或直接跳到某个界面。滚到眼前播一次；访客自己一点就停；左栏「看演示」重播。
   轻量版 .lite：只有一部手机、没有界面列表，只用上面的状态属性（费曼页顶部的手机）。 */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function parseSets(str) {
    var out = [];
    (str || '').split(';').forEach(function (part) {
      part = part.trim();
      if (!part) return;
      var i = part.indexOf('=');
      out.push([part.slice(0, i).trim(), part.slice(i + 1).trim()]);
    });
    return out;
  }

  function init(root) {
    var lite = root.classList.contains('lite');
    var screens = lite ? [] : [].slice.call(root.querySelectorAll('.ps'));
    if (!lite && !screens.length) return;
    var cur = null, timers = [], screenTimer = null;

    function get(k) { return root.getAttribute('data-' + k) || ''; }
    function test(expr) {
      return expr.split(',').some(function (alt) {
        return alt.split('&').every(function (cond) {
          cond = cond.trim();
          var neg = cond.indexOf('!=') > -1;
          var bits = cond.split(neg ? '!=' : '=');
          var hit = bits[1].split('|').map(function (s) { return s.trim(); }).indexOf(get(bits[0].trim())) > -1;
          return neg ? !hit : hit;
        });
      });
    }
    function apply() {
      root.querySelectorAll('[data-when]').forEach(function (el) { el.hidden = !test(el.getAttribute('data-when')); });
      root.querySelectorAll('[data-on]').forEach(function (el) { el.classList.toggle('on', test(el.getAttribute('data-on'))); });
      root.querySelectorAll('[data-sum]').forEach(function (el) {
        var ps = el.closest('.ps');
        el.textContent = (+el.getAttribute('data-sum')) + ps.querySelectorAll('[data-tog].on').length;
      });
    }
    function run(sets) {
      var target = null;
      sets.forEach(function (kv) {
        if (kv[0] === 'go') target = kv[1];
        else if (kv[1] === '') root.removeAttribute('data-' + kv[0]);
        else root.setAttribute('data-' + kv[0], kv[1]);
      });
      apply();
      if (target) go(target);
    }
    function later(spec, keep, cond) {
      var i = spec.indexOf(':');
      var t = setTimeout(function () { if (!cond || test(cond)) run(parseSets(spec.slice(i + 1))); }, +spec.slice(0, i));
      if (keep) timers.push(t);
      return t;
    }

    /* 左栏：界面列表（按 data-group 分组）+ 重来 */
    if (!lite) {
    var tabs = document.createElement('div');
    tabs.className = 'proto-tabs';
    var lastGroup = null;
    screens.forEach(function (ps) {
      var g = ps.getAttribute('data-group');
      if (g && g !== lastGroup) {
        var h = document.createElement('span');
        h.className = 'proto-group';
        h.textContent = g;
        tabs.appendChild(h);
        lastGroup = g;
      }
      var tag = ps.querySelector('.ps-tag');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'proto-tab';
      b.innerHTML = tag.innerHTML;
      b.addEventListener('click', function () { go(ps.id); });
      ps._tab = b;
      tabs.appendChild(b);
    });
    var demoBtn = null;
    if (root.hasAttribute('data-demo')) {
      demoBtn = document.createElement('button');
      demoBtn.type = 'button';
      demoBtn.className = 'proto-demo';
      demoBtn.textContent = '▶ 看演示';
      demoBtn.addEventListener('click', function () { if (demoing) stopDemo(); else demo(); });
      tabs.appendChild(demoBtn);
    }
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'proto-reset';
    reset.textContent = '重来';
    reset.addEventListener('click', function () { restart(); });
    tabs.appendChild(reset);
    root.insertBefore(tabs, root.firstChild);
    }

    function go(id) {
      var next = document.getElementById(id);
      if (!next || next === cur) return;
      clearTimeout(screenTimer);
      if (cur) { cur.classList.remove('is-cur'); cur._tab.classList.remove('on'); cur._tab.removeAttribute('aria-current'); }
      cur = next;
      cur.classList.add('is-cur');
      cur._tab.classList.add('on');
      cur._tab.setAttribute('aria-current', 'step');
      cur.classList.remove('is-touched');
      if (!reduce) { cur.classList.remove('enter'); void cur.offsetWidth; cur.classList.add('enter'); }
      if (cur.hasAttribute('data-enter')) run(parseSets(cur.getAttribute('data-enter')));
      if (cur.hasAttribute('data-auto')) screenTimer = later(cur.getAttribute('data-auto'), false);
    }
    function restart() {
      timers.forEach(clearTimeout); timers = [];
      clearTimeout(screenTimer);
      [].slice.call(root.attributes).forEach(function (a) {
        if (/^data-/.test(a.name) && !/^data-(init|proto|demo)$/.test(a.name)) root.removeAttribute(a.name);
      });
      root.querySelectorAll('[data-tog]').forEach(function (el) { el.classList.toggle('on', el.hasAttribute('data-tog-on')); });
      run(parseSets(root.getAttribute('data-init')));
      if (lite) return;
      cur && (cur.classList.remove('is-cur'), cur._tab.classList.remove('on'));
      cur = null;
      go(screens[0].id);
    }

    /* ── 自动演示 ── */
    var demoing = false, demoTimers = [], userTook = false, inView = false, pendingLoop = false;
    function tapAt(el, then) {
      var scr = el.closest('.lp-scr') || root.querySelector('.scr') || root;
      var dot = scr.querySelector('.lp-tap');
      if (!dot) { dot = document.createElement('span'); dot.className = 'lp-tap'; dot.setAttribute('aria-hidden', 'true'); scr.appendChild(dot); }
      var sr = scr.getBoundingClientRect(), er = el.getBoundingClientRect();
      dot.style.left = (er.left - sr.left + Math.min(er.width / 2, 40)) + 'px';
      dot.style.top = (er.top - sr.top + er.height / 2) + 'px';
      dot.classList.remove('go'); void dot.offsetWidth; dot.classList.add('go');
      demoTimers.push(setTimeout(function () { el.click(); then(); }, reduce ? 0 : 520));
    }
    function demo() {
      stopDemo();
      restart();
      demoing = true;
      root.classList.add('is-demo');
      if (demoBtn) demoBtn.textContent = '■ 停止演示';
      var steps = root.getAttribute('data-demo').split('|').map(function (x) { return x.trim(); }).filter(Boolean);
      var i = 0;
      (function next() {
        if (!demoing) return;
        if (i >= steps.length) {
          stopDemo();
          /* 轻量版可以循环（首页）：还在视口里就隔一会儿再播，滚走了等回来再播 */
          if (lite && root.hasAttribute('data-demo-loop') && !userTook) {
            if (inView) demoTimers.push(setTimeout(demo, 1600)); else pendingLoop = true;
          }
          return;
        }
        var st = steps[i++];
        if (st.charAt(0) === '~') { demoTimers.push(setTimeout(next, +st.slice(1))); return; }
        if (st.charAt(0) === '@') { go(st.slice(1)); demoTimers.push(setTimeout(next, 1300)); return; }
        var el = lite ? root.querySelector(st) : cur && cur.querySelector('.lp-scr ' + st);
        if (!el || el.offsetParent === null) { next(); return; }   // 找不到就跳过，不卡住
        demoTimers.push(setTimeout(function () { tapAt(el, function () { demoTimers.push(setTimeout(next, 1250)); }); }, 350));
      })();
    }
    function stopDemo() {
      demoing = false;
      demoTimers.forEach(clearTimeout); demoTimers = [];
      root.classList.remove('is-demo');
      if (demoBtn) demoBtn.textContent = '▶ 看演示';
    }
    /* 访客自己动手（真实的指针或键盘），演示立刻停 */
    root.addEventListener('pointerdown', function (e) { if (e.target !== demoBtn) { userTook = true; if (demoing) stopDemo(); } });
    root.addEventListener('keydown', function (e) { if (demoing && e.target !== demoBtn) stopDemo(); });

    root.addEventListener('click', function (e) {
      var scr = lite ? root : e.target.closest('.lp-scr');
      if (!scr) return;
      if (cur) cur.classList.add('is-touched');
      clearTimeout(screenTimer);
      var t = e.target.closest('[data-go], [data-set], [data-then], [data-tog], [data-flip]');
      if (!t || !scr.contains(t)) {
        /* 点了不能点的地方：像 Figma 一样，把这一屏能点的地方闪一下 */
        scr.classList.remove('flash'); void scr.offsetWidth; scr.classList.add('flash');
        return;
      }
      if (t.hasAttribute('data-tog')) { t.classList.toggle('on'); apply(); }
      if (t.hasAttribute('data-then')) later(t.getAttribute('data-then'), true, t.getAttribute('data-then-if'));
      var sets = parseSets(t.getAttribute('data-set'));
      if (t.hasAttribute('data-flip')) {
        var f = parseSets(t.getAttribute('data-flip'))[0];
        sets.push([f[0], get(f[0]) === f[1] ? '' : f[1]]);
      }
      if (t.hasAttribute('data-go')) sets.push(['go', t.getAttribute('data-go')]);
      if (sets.length) run(sets);
    });

    /* 能点的元素用键盘也能点 */
    root.querySelectorAll('[data-go], [data-set], [data-tog], [data-flip]').forEach(function (el) {
      if (/^(BUTTON|A)$/.test(el.tagName)) return;
      el.setAttribute('role', el.hasAttribute('data-tog') ? 'checkbox' : 'button');
      el.tabIndex = 0;
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
      });
    });

    root.querySelectorAll('[data-tog]').forEach(function (el) { if (el.classList.contains('on')) el.setAttribute('data-tog-on', ''); });
    root.classList.add('is-live');
    /* 给页面上别的模块用（路由图点「在原型里看这一屏」）：外部跳转算访客接管，不再自动演示 */
    root._go = function (id) { played = true; userTook = true; stopDemo(); go(id); };
    root._stopDemo = stopDemo;
    restart();

    /* 滚到眼前（露出四成以上）自动演示一次；减少动态效果时不自动播 */
    if ((demoBtn || (lite && root.hasAttribute('data-demo'))) && !reduce && 'IntersectionObserver' in window) {
      var played = false;
      var io = new IntersectionObserver(function (es) {
        inView = es.some(function (x) { return x.isIntersecting; });
        if (!inView) return;
        if (!played) { played = true; demo(); }
        else if (pendingLoop && !userTook) { pendingLoop = false; demo(); }
      }, { threshold: 0.4 });
      io.observe(root);
    }
  }

  document.querySelectorAll('.proto, .lite').forEach(init);
})();
