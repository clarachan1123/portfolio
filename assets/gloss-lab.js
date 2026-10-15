/* Gloss 第 04 章：评测集 20 句，两条长度规则各守住几句。
   上下两行是同一批 20 个点（我当时写的批注，按去掉空白后的实际字数算，和页面上「中位数 111%、最高 220%」同一口径）：
   上行按「批注 ÷ 原句」排在比例轴上，绿区是原定的 50%–80%；下行按批注字数排，绿区是改后的「不超过 150 字」。
   点在绿区里 = 守住规则（实心），在外面 = 没守住（空心）。点任意一个点，两行里同一句一起亮。
   HTML 里存了一份默认状态，没有脚本、画布上看到的就是它。 */
(function () {
  var root = document.querySelector('.glen');
  if (!root) return;
  var D = [["01", "混合", 124, 129, "莱布尼兹通过欲望（Appetitum），内在的努力（cons…"], ["02", "混合", 112, 201, "因此，这些东西，即实在性和它们的概念一起依赖于被动的自然（N…"], ["03", "混合", 82, 143, "因此每个概念之中都存在如下状况：1）绝对的、本源的存在者，它…"], ["04", "混合", 99, 91, "这二者必然在概念中相互从属，以至于思维（仅仅就其本质来考察）…"], ["05", "混合", 85, 146, "因为在无限的、永恒的、不变的事物中，一切都是无限地、不变地和…"], ["06", "混合", 82, 75, "XIX.能动的自然，即被视为自由因或者无限实体的神，除开它的…"], ["07", "术语", 57, 57, "现在您究竟基于什么表象来反对斯宾诺莎主义呢？您发现莱布尼兹的…"], ["08", "术语", 83, 70, "如果斯宾诺莎否定了任意一个行动的开端，并且把终极因（Endu…"], ["09", "术语", 85, 146, "但是这样的话，请别让我听到关于所谓正当引导行动的意志的讨论了…"], ["10", "术语", 35, 77, "XV.个别的、变化的、物体性的事物只是无限广延中运动与静止的…"], ["11", "术语", 45, 61, "有限的知性或者无限、绝对的思维的“以另一个样式为条件的样式”…"], ["12", "句法", 127, 16, "当我开始忧虑另一个世界的事情的时候，我还身着波兰长袍。八、九…"], ["13", "句法", 120, 58, "因此我们看到世界被划分为两个部分。一部分世界是完全惰性的和受…"], ["14", "句法", 135, 158, "确实，我不理解最初的力，除非它是使事物成为事物的力；我也不理…"], ["15", "句法", 89, 120, "至于宿命论，我将抛弃它，就宿命论是建立在唯物主义的基础上，或…"], ["16", "句法", 98, 98, "人们应该准确地感知到，我究竟在何种意义下接受了一部分斯宾诺莎…"], ["17", "指代+句法", 86, 144, "并且意志力，这位创造者的意志既非其知性的源泉，亦非其知性的后…"], ["18", "指代+句法", 84, 137, "当然这种机器类似于亲手操控的机械装置，在其中力按照需要和能量…"], ["19", "指代", 63, 47, "后来我偶遇了其他人，他们有的声誉相当，有的甚至更具名望，但是…"], ["20", "指代", 64, 32, "人能够通过这些性状在他的实存中获得提升，使自己跃入更高的生命…"]];
  var W = 640, H = 128, L = 14, R = 14, BASE = 82, RAD = 6.5;
  var ROWS = {
    ratio: { max: 230, ticks: [0, 50, 100, 150, 200], unit: '%', val: function (r) { return r[3] / r[2] * 100; }, ok: function (v) { return v >= 50 && v <= 80; }, lo: 50, hi: 80, zl: '50%–80%' },
    len: { max: 230, ticks: [0, 50, 100, 150, 200], unit: ' 字', val: function (r) { return r[3]; }, ok: function (v) { return v <= 150; }, lo: 0, hi: 150, zl: '≤ 150 字' }
  };
  var cur = null;
  function render(key) {
    var o = ROWS[key];
    function x(v) { return L + Math.min(v, o.max) / o.max * (W - L - R); }
    var g = '<rect class="zone" x="' + x(o.lo) + '" y="6" width="' + (x(o.hi) - x(o.lo)) + '" height="' + (BASE + RAD + 6) + '"/>';
    g += '<text class="zl" x="' + ((x(o.lo) + x(o.hi)) / 2) + '" y="20" text-anchor="middle">' + o.zl + '</text>';
    g += '<line class="base" x1="' + L + '" y1="' + (BASE + RAD + 12) + '" x2="' + (W - R) + '" y2="' + (BASE + RAD + 12) + '"/>';
    o.ticks.forEach(function (t) { g += '<text class="tick" x="' + x(t) + '" y="' + (BASE + RAD + 28) + '" text-anchor="middle">' + t + o.unit + '</text>'; });
    if (key === 'ratio') g += '<line class="med" x1="' + x(110.5) + '" y1="6" x2="' + x(110.5) + '" y2="' + (BASE + RAD + 12) + '"/><text class="ml" x="' + (x(110.5) + 6) + '" y="20">我的批注中位数 111%</text>';
    /* 蜂群排布：按数值从小到大放，碰到已经放下的点就往上叠一层 */
    var placed = [];
    var pts = D.map(function (r, i) { return { i: i, v: o.val(r) }; }).sort(function (a, b) { return a.v - b.v; }).map(function (p) {
      var cx = x(p.v), lv = 0;
      while (placed.some(function (q) { return q.lv === lv && Math.abs(q.cx - cx) < RAD * 2 + 1.5; })) lv++;
      placed.push({ cx: cx, lv: lv });
      var r = D[p.i], ok = o.ok(p.v);
      return '<circle class="pt ' + (ok ? 'in' : 'out') + (cur === p.i ? ' cur' : '') + '" cx="' + cx + '" cy="' + (BASE - lv * (RAD * 2 + 1)) + '" r="' + RAD + '" data-i="' + p.i + '" tabindex="0" role="button" aria-label="第 ' + r[0] + ' 句，批注 ' + r[3] + ' 字，是原句的 ' + Math.round(r[3] / r[2] * 100) + '%"/>';
    }).join('');
    var n = D.filter(function (r) { return o.ok(o.val(r)); }).length;
    root.querySelector('[data-k="' + key + '"] .glen-svg').innerHTML = g + pts;
    root.querySelector('[data-k="' + key + '"] .glen-n b').textContent = n;
  }
  function info() {
    var el = root.querySelector('.glen-info');
    if (cur === null) { el.innerHTML = '<span class="mute">点任意一个点，看是哪一句；上下两行里同一句会一起亮。</span>'; return; }
    var r = D[cur], k = Math.round(r[3] / r[2] * 100);
    el.innerHTML = '<b>第 ' + r[0] + ' 句 · ' + r[1] + '</b>原句 ' + r[2] + ' 字，批注 ' + r[3] + ' 字，是原句的 ' + k + '%。'
      + '原定规则' + (k >= 50 && k <= 80 ? '守住' : '没守住') + '，改后规则' + (r[3] <= 150 ? '守住' : '没守住') + '。<span class="src">' + r[4] + '</span>';
  }
  function all() { render('ratio'); render('len'); info(); }
  function pick(c) { var i = +c.getAttribute('data-i'); cur = cur === i ? null : i; all(); }
  root.addEventListener('click', function (e) { var c = e.target.closest('circle[data-i]'); if (c) pick(c); });
  root.addEventListener('keydown', function (e) {
    var c = e.target.closest('circle[data-i]');
    if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); var k = c.closest('[data-k]').getAttribute('data-k'); pick(c); var n = root.querySelector('[data-k="' + k + '"] circle[data-i="' + cur + '"]'); n && n.focus(); }
  });
  root.classList.add('is-live');
  all();
})();
