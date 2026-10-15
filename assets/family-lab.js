/* 家庭协作页的四个「动手试」：把 PRD 里的规则做成能动手试的小实验台。
   规则全部照 PRD v2 写（附件 4.2 指标、同步 F6 冲突判定、Future Tab F3 评分 / F5 高亮 / F10 / F11、AI 全流程图）。
   每个实验台由脚本画出来；HTML 里预先存了一份默认状态（没有脚本时、以及画布上看到的就是它），脚本加载后会重画。 */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pct(n) { return Math.round(n * 100) + '%'; }

  /* ══ 02 附件：同一批数据，换个指标 ══════════════════════════════
     上传率 = 挂了附件的事项占比；非上传者查看率 = 挂了附件的事项里，至少一位非上传者在开始前打开过的比例（PRD 4.2 北极星）。
     反向指标：上传者本人查看占比 >80% = 退化成个人存储。数据是示意的。 */
  function labAtt(root) {
    var EV = [
      { t: 'Field trip', d: 'Fri', f: 'PDF', up: 'Mom', other: 'Dad', seen: true },
      { t: 'Swim meet', d: 'Sat', f: 'Photo', up: 'Mom', other: 'Dad', seen: false },
      { t: 'Piano recital', d: 'Sat', f: 'Photo', up: 'Mom', other: 'Dad', seen: true },
      { t: 'Buy birthday gift', d: 'Sat', f: 'Photo', up: 'Mom', other: 'Dad', seen: false },
      { t: 'Dentist – Mike', d: 'Mon', f: 'Photo', up: 'Mom', other: 'Dad', seen: false },
      { t: "Lisa's birthday party", d: 'Oct 31', f: 'Photo', up: 'Mom', other: 'Dad', seen: false },
      { t: 'Picture Day', d: 'Nov 5', f: 'PDF', up: 'Mom', other: 'Dad', seen: false },
      { t: 'Parent–Teacher Conference', d: 'Nov 12', f: 'PDF', up: 'Mom', other: 'Dad', seen: false },
      { t: 'Flight to Orlando', d: 'Nov 20', f: 'PDF', up: 'Dad', other: 'Mom', seen: true },
      { t: 'Soccer practice', d: 'Thu', f: '', up: '', other: '', seen: false }
    ];
    function render() {
      var withAtt = EV.filter(function (e) { return e.f; });
      var seen = withAtt.filter(function (e) { return e.seen; }).length;
      var upRate = withAtt.length / EV.length, viewRate = seen / withAtt.length;
      var selfShare = withAtt.length / (withAtt.length + seen);
      var verdict = viewRate >= .6 ? '过了挑战目标 60%：材料真的被执行的人看到了。'
        : viewRate >= .4 ? '过了成功线 40%：一半左右的材料被执行的人看过。'
        : '没过 40% 的成功线：多数附件只有上传的人自己看过，等于又一个网盘。';
      var rows = EV.map(function (e, i) {
        if (!e.f) return '<li class="la-row none"><span class="la-t">' + esc(e.t) + '<small>' + e.d + '</small></span><span class="la-f">没有附件</span><span class="la-v"></span></li>';
        return '<li class="la-row"><span class="la-t">' + esc(e.t) + '<small>' + e.d + '</small></span><span class="la-f">' + e.f + ' · ' + e.up + ' 传的</span>' +
          '<span class="la-v"><i class="la-av on ' + e.up.toLowerCase() + '" title="' + e.up + ' 自己看过">' + e.up[0] + '</i>' +
          '<button type="button" class="la-av ' + e.other.toLowerCase() + (e.seen ? ' on' : '') + '" data-i="' + i + '" aria-pressed="' + e.seen + '" title="' + e.other + ' 在开始前打开过">' + e.other[0] + '</button></span></li>';
      }).join('');
      root.querySelector('[data-lab-body]').innerHTML =
        '<div class="la-grid"><div><p class="lab-cap">10 件事 · 示意数据<span>点右边的头像：执行的那个人在开始前打开过没有</span></p><ul class="la-list">' + rows + '</ul></div>' +
        '<div class="la-metrics">' +
          '<div class="la-m dim"><p class="la-mk">上传率<small>挂了附件的事项占比</small></p><b>' + pct(upRate) + '</b><p class="la-mn">看着很好，但只说明有人在传。</p></div>' +
          '<div class="la-m"><p class="la-mk">非上传者查看率<small>挂了附件的事项里，至少一位非上传者在开始前打开过的比例</small></p><b>' + pct(viewRate) + '</b>' +
            '<div class="la-bar"><i style="width:' + pct(viewRate) + '"></i><span class="t40" title="成功线">40%</span><span class="t60" title="挑战目标">60%</span></div>' +
            '<p class="la-mn">' + seen + ' / ' + withAtt.length + ' 件事被执行的人看过。' + verdict + '</p></div>' +
          '<div class="la-m sm' + (selfShare > .8 ? ' alarm' : '') + '"><p class="la-mk">上传者本人查看占比<small>反向指标 · 超过 80% 说明退化成个人存储</small></p><b>' + pct(selfShare) + '</b></div>' +
        '</div></div>';
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]');
      if (!b) return;
      var ev = EV[+b.getAttribute('data-i')]; ev.seen = !ev.seen; render();
      var nb = root.querySelector('button[data-i="' + b.getAttribute('data-i') + '"]'); if (nb) nb.focus();
    });
    render();
  }

  /* ══ 03 同步：冲突沙盒（PRD F6 三步判定）════════════════════════ */
  function labSync(root) {
    var F = [
      { k: 'time', n: '开始时间', r: 'high', a: '7:00 PM', b: '6:00 PM' },
      { k: 'who', n: '参与人', r: 'high', a: '+ Grandma', b: '− Lisa' },
      { k: 'rep', n: '重复规则', r: 'high', a: '每周', b: '每两周' },
      { k: 'title', n: '标题', r: 'mid', a: 'Family dinner', b: "Dinner at Nonna's" },
      { k: 'place', n: '地点', r: 'low', a: 'Home', b: 'Olive Garden' },
      { k: 'note', n: '备注', r: 'low', a: 'Bring dessert', b: 'Bring wine' }
    ];
    var RISK = { high: '高', mid: '中', low: '低' };
    var PRESETS = [
      { n: '两人都改了时间', a: ['time'], b: ['time'] },
      { n: '两人都改了地点', a: ['place'], b: ['place'] },
      { n: '一边删、一边改', a: ['del'], b: ['time'] },
      { n: '只有 Dad 改了时间', a: [], b: ['time'] },
      { n: '改动相同 · 都改成 7 点', a: ['time'], b: ['time'], same: true }
    ];
    var S = { a: { time: 1 }, b: { time: 1 }, same: false, soon: false, preset: 0 };
    function set(list) { var o = {}; list.forEach(function (k) { o[k] = 1; }); return o; }
    function evaluate() {
      var steps = [], conflicts = [], outcome;
      var aDel = !!S.a.del, bDel = !!S.b.del;
      var aEd = F.some(function (f) { return S.a[f.k]; }), bEd = F.some(function (f) { return S.b[f.k]; });
      if (aDel && bDel) return { steps: ['两端都删除'], conflicts: [], outcome: { cls: 'ok', t: '直接删除，没有冲突', d: '两边的意思一致。' } };
      if ((aDel && bEd) || (bDel && aEd)) {
        conflicts.push({ n: '一端删除、一端修改', r: 'high' });
      } else if (aDel || bDel) {
        return { steps: ['只有一侧删除'], conflicts: [], outcome: { cls: 'one', t: '按删除规则处理', d: aDel ? '在 App 里删除：手机上的「Household」日历跟着删掉。' : '在手机上删除：只从这台手机隐藏，再问一句要不要全家都删（原型 P5）。' } };
      }
      F.forEach(function (f) {
        var A = S.a[f.k], B = S.b[f.k];
        if (A && B) {
          if (S.same) steps.push(f.n + '：两边改成同一个值 → 收敛，不算冲突');
          else { steps.push(f.n + '：两边都改、值不同 → 字段冲突（' + RISK[f.r] + '风险）'); conflicts.push({ n: f.n, r: f.r }); }
        } else if (A || B) steps.push(f.n + '：只有' + (A ? ' Mom（App）' : ' Dad（手机）') + '改了 → 直接采用');
      });
      if (!conflicts.length) {
        outcome = steps.length ? { cls: 'ok', t: '没有冲突，直接同步', d: '只有一侧改的字段直接采用；两边改成一样的算收敛。' } : { cls: 'idle', t: '还没人改', d: '在上面给 Mom 或 Dad 选几个要改的字段。' };
      } else {
        var high = conflicts.some(function (c) { return c.r === 'high'; });
        var mid = conflicts.some(function (c) { return c.r === 'mid'; });
        if (high || mid || S.soon) {
          var why = high ? '有高风险字段冲突' : mid ? '标题实质不同，可能是误匹配了两件事，宁可多问一次' : '事件 24 小时内开始，一律升级为高风险';
          outcome = { cls: 'card', t: '弹出冲突卡，让人来选', d: why + '。两版并排、差异高亮、不预选；未决期间暂停这件事的常规提醒，改在较早那个时间的 24 小时前推送一次「需要你决定」。', p: 'P4' };
        } else {
          outcome = { cls: 'auto', t: '自动采用最近一次修改，并留一条记录', d: '只有低风险字段冲突（地点、备注），选错代价很小，不打扰任何人。' };
        }
      }
      return { steps: steps, conflicts: conflicts, outcome: outcome };
    }
    function side(key, who, where) {
      var chips = F.map(function (f) {
        var on = !!S[key][f.k];
        return '<button type="button" class="ls-chip r-' + f.r + (on ? ' on' : '') + '" data-side="' + key + '" data-k="' + f.k + '" aria-pressed="' + on + '">' + f.n +
          (on ? '<em>' + esc(S.same && S[key === 'a' ? 'b' : 'a'][f.k] ? f.a : f[key]) + '</em>' : '') + '</button>';
      }).join('');
      var del = !!S[key].del;
      return '<div class="ls-side"><p class="ls-who"><i class="' + who.toLowerCase() + '"></i>' + who + ' · ' + where + '</p><div class="ls-chips">' + chips +
        '<button type="button" class="ls-chip r-high del' + (del ? ' on' : '') + '" data-side="' + key + '" data-k="del" aria-pressed="' + del + '">删除这件事</button></div></div>';
    }
    function render() {
      var r = evaluate();
      var rules = [
        ['任一高风险字段冲突', '冲突卡', r.conflicts.some(function (c) { return c.r === 'high'; })],
        ['标题实质不同（中风险）', '冲突卡', !r.conflicts.some(function (c) { return c.r === 'high'; }) && r.conflicts.some(function (c) { return c.r === 'mid'; })],
        ['只有低风险字段冲突', '自动采用最近修改', r.outcome.cls === 'auto'],
        ['事件 24 小时内开始', '一律升级为高风险', S.soon && r.conflicts.length > 0]
      ];
      root.querySelector('[data-lab-body]').innerHTML =
        '<p class="lab-cap">一件事：Family dinner · Sat 6:30 PM · Home · Mom, Dad, Lisa<span>给两边各选要改的字段；颜色是风险等级</span></p>' +
        '<div class="ls-presets">' + PRESETS.map(function (p, i) { return '<button type="button" data-preset="' + i + '"' + (S.preset === i ? ' class="on"' : '') + '>' + p.n + '</button>'; }).join('') + '</div>' +
        '<div class="ls-sides">' + side('a', 'Mom', '在 App 里改') + side('b', 'Dad', '在手机日历里改') + '</div>' +
        '<p class="ls-opts"><label><input type="checkbox" data-opt="soon"' + (S.soon ? ' checked' : '') + '> 这件事 24 小时内开始</label>' +
        '<label><input type="checkbox" data-opt="same"' + (S.same ? ' checked' : '') + '> 两边改成了同一个值</label></p>' +
        '<div class="ls-run">' +
          '<ol class="ls-steps"><li><b>第 1 步 · 逐个字段比对</b>' + (r.steps.length ? '<ul>' + r.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '<ul><li class="mute">没有字段被改</li></ul>') + '</li>' +
          '<li><b>第 2 步 · 冲突字段按风险分级</b><ul>' + (r.conflicts.length ? r.conflicts.map(function (c) { return '<li><span class="rk r-' + c.r + '">' + RISK[c.r] + '</span>' + esc(c.n) + '</li>'; }).join('') : '<li class="mute">没有冲突字段</li>') + '</ul></li>' +
          '<li><b>第 3 步 · 组合判定</b><ul class="ls-rules">' + rules.map(function (x) { return '<li' + (x[2] ? ' class="hit"' : '') + '>' + x[0] + ' → ' + x[1] + '</li>'; }).join('') + '</ul></li></ol>' +
          '<div class="ls-out ' + r.outcome.cls + '"><p class="lab-cap">结果</p><b>' + esc(r.outcome.t) + '</b><p>' + esc(r.outcome.d) + '</p></div>' +
        '</div>';
    }
    root.addEventListener('click', function (e) {
      var c = e.target.closest('button[data-k]'), p = e.target.closest('button[data-preset]');
      if (c) {
        var sd = c.getAttribute('data-side'), k = c.getAttribute('data-k');
        S[sd][k] = S[sd][k] ? 0 : 1; S.preset = -1; render();
        var n = root.querySelector('button[data-side="' + sd + '"][data-k="' + k + '"]'); if (n) n.focus();
      } else if (p) {
        var pr = PRESETS[+p.getAttribute('data-preset')];
        S.a = set(pr.a); S.b = set(pr.b); S.same = !!pr.same; S.preset = +p.getAttribute('data-preset'); render();
      }
    });
    root.addEventListener('change', function (e) {
      var o = e.target.getAttribute('data-opt'); if (!o) return;
      S[o] = e.target.checked; S.preset = -1; render();
    });
    render();
  }

  /* ══ 04 Future Tab：排序实验台（PRD F2 分层 / F3 评分 / F5 高亮 / F7 Why this / F10 Coming up / F11 N days to go）══ */
  function labFut(root) {
    var MOD = { cal: ['日历事件', 20, ''], task: ['任务', 10, 'Task'], shop: ['购物清单', 0, ''], trip: ['旅行', 30, 'Trip'], bday: ['生日', 25, 'Birthday'] };
    var EV = [
      { t: 'Return library books', day: 14, m: 'task', kid: 0, n: 1, who: 'Mom' },
      { t: 'Dentist', day: 15, m: 'cal', kid: 0, n: 1, who: 'Dad' },
      { t: 'Groceries', day: 16, m: 'shop', kid: 0, n: 1, who: 'Mom' },
      { t: 'Piano recital', day: 17, m: 'cal', kid: 1, n: 2, who: 'Mike, Mom' },
      { t: 'Family dinner', day: 18, m: 'cal', kid: 0, n: 2, who: 'Mom, Dad' },
      { t: 'Trip to Orlando', day: 24, m: 'trip', kid: 1, n: 4, who: 'Everyone' },
      { t: "Lisa's birthday party", day: 31, m: 'bday', kid: 1, n: 3, who: 'Lisa, Mom, Dad' },
      { t: 'Parent–teacher conference', day: 36, m: 'cal', kid: 0, n: 2, who: 'Mom, Dad' }
    ];
    var star = {}, today = 14;
    var WD = ['Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'];
    function dateLabel(day) { return day <= 31 ? 'Oct ' + day : 'Nov ' + (day - 31); }
    function wd(day) { return WD[(day - 14 + 70) % 7]; }
    function score(e) {
      var d = e.day - today, parts = [];
      var tp = d === 0 ? 30 : d <= 3 ? 25 : d <= 7 ? 20 : d <= 14 ? 10 : 5;
      parts.push(['时间', tp, d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : d <= 7 ? 'in ' + d + ' days' : d <= 14 ? 'next week' : 'in ' + d + ' days']);
      var m = MOD[e.m]; parts.push([m[0], m[1], m[2]]);
      if (e.kid) parts.push(['含儿童', 15, "Kid's event"]);
      if (e.n >= 2) parts.push(['多人', 10, 'With ' + e.n + ' people']);
      if (star[e.t]) parts.push(['标星', 40, 'You starred this']);
      var s = parts.reduce(function (a, p) { return a + p[1]; }, 0);
      return { s: s, parts: parts, d: d, stars: s >= 70 ? 5 : s >= 50 ? 4 : s >= 35 ? 3 : s >= 20 ? 2 : 1 };
    }
    function why(sc) {
      /* 取贡献最大的两个信号；默认的「日历事件」不算信号 */
      var sig = sc.parts.filter(function (p) { return p[2]; }).slice().sort(function (a, b) { return (b[0] === '标星') - (a[0] === '标星') || b[1] - a[1]; });
      return sig.slice(0, 2).map(function (p) { return p[2]; }).join(' · ');
    }
    function render() {
      var list = EV.filter(function (e) { return e.day >= today && e.day - today <= 30; }).map(function (e) { var sc = score(e); return { e: e, sc: sc }; });
      var byScore = function (a, b) { return b.sc.s - a.sc.s || a.e.day - b.e.day; };
      var todayL = list.filter(function (x) { return x.sc.d === 0; }).sort(function (a, b) { return a.e.day - b.e.day; });
      var week = list.filter(function (x) { return x.sc.d >= 1 && x.sc.d <= 7; }).sort(byScore);
      var later = list.filter(function (x) { return x.sc.d >= 8; }).sort(byScore);
      var coming = later.filter(function (x) { return x.sc.stars >= 4; }).slice(0, 2);
      later = later.filter(function (x) { return coming.indexOf(x) < 0; });
      var cand = list.filter(function (x) { return x.sc.stars >= 4 && x.sc.d <= 14; }).sort(byScore);
      var hl = cand.slice(0, 3), cut = cand.slice(3);
      function row(x) {
        var sc = x.sc, on = hl.indexOf(x) > -1, isCut = cut.indexOf(x) > -1;
        var badge = sc.stars >= 4 && sc.d >= 1 && sc.d <= 14 ? '<span class="lf-badge">' + (sc.d === 1 ? 'Tomorrow' : sc.d + ' days to go') + '</span>' : '';
        var formula = sc.parts.map(function (p) { return p[0] + ' ' + p[1]; }).join(' + ') + ' = ' + sc.s;
        return '<li class="lf-row' + (on ? ' hl' : '') + (isCut ? ' cut' : '') + '">' +
          '<span class="lf-main"><b>' + esc(x.e.t) + '</b><small>' + wd(x.e.day) + ', ' + dateLabel(x.e.day) + ' · ' + esc(x.e.who) + '</small>' +
          (sc.stars >= 4 ? '<small class="lf-why">Why this? ' + esc(why(sc)) + '</small>' : '') +
          (isCut ? '<small class="lf-cutnote">★4 但没被高亮：已有 3 个分更高的</small>' : '') + '</span>' +
          '<span class="lf-side">' + badge + '<span class="lf-stars">' + '★★★★★'.slice(0, sc.stars) + '<i>' + '★★★★★'.slice(sc.stars) + '</i></span>' +
          '<span class="lf-score" title="' + esc(formula) + '">' + esc(formula) + '</span>' +
          '<button type="button" class="lf-star' + (star[x.e.t] ? ' on' : '') + '" data-t="' + esc(x.e.t) + '" aria-pressed="' + !!star[x.e.t] + '">' + (star[x.e.t] ? '★ 已标星' : '☆ 标星') + '</button></span></li>';
      }
      function tier(name, rows, note) { return rows.length ? '<li class="lf-tier"><span>' + name + '</span>' + (note ? '<em>' + note + '</em>' : '') + '</li>' + rows.map(row).join('') : ''; }
      root.querySelector('[data-lab-body]').innerHTML =
        '<div class="lf-ctrl"><p class="lab-cap">今天是 <b>' + wd(today) + ', ' + dateLabel(today) + '</b><span>拖动看排序怎么随时间变；给任意一件标星（+40，只影响自己）</span></p>' +
        '<input type="range" min="14" max="24" step="1" value="' + today + '" aria-label="今天是哪一天" data-today>' +
        '<p class="lf-count">高亮 <b>' + hl.length + '</b> / 3' + (cut.length ? '　·　<span class="cut">' + cut.length + ' 件 ★4 被挤出</span>' : '') + '</p></div>' +
        '<ul class="lf-list">' + tier('Today', todayL, '按时间') + tier('This week', week, '按评分') + tier('Coming up', coming, '第 8–30 天里 ★4 以上，最多 2 个') + tier('Later', later, '按评分') + '</ul>' +
        '<p class="lf-note">产品里不显示分数和公式，只给一句「Why this?」；这里把分数摊开，是为了看清规则。</p>';
    }
    root.addEventListener('input', function (e) { if (e.target.hasAttribute('data-today')) { today = +e.target.value; render(); var r = root.querySelector('[data-today]'); r && r.focus(); } });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-t]'); if (!b) return;
      var t = b.getAttribute('data-t'); star[t] = !star[t]; render();
      var nb = root.querySelector('button[data-t="' + t.replace(/"/g, '\\"') + '"]'); nb && nb.focus();
    });
    render();
  }

  /* ══ 05 AI 管家：全流程路由图（照原来的全流程概念图，节点文字一字不改）════════ */
  function labAi(root) {
    var SC = {
      kid: { n: '孩子的比赛截图', path: ['m1', 'a2', 'm3', 'm3p', 'a4', 'd4', 'd5', 'a5'], d: 'U10 Basketball · 结束时间是猜的，Mom 点「Looks right」才能加；Mike 由 Mom 代确认，Dad 显示虚线，等他点「I\'m in」才进他的提醒。', p: 'ai-4' },
      fee: { n: '缴费通知', path: ['m1', 'a2', 'm3', 'm3p', 'a4', 'a5'], d: '红线 2：只生成「事件 + 提醒」，标题写成要做的事；界面里没有支付或报名按钮，付钱仍在学校自己的渠道。', p: 'ai-11' },
      priv: { n: '看心理医生的预约', path: ['m1', 'a2', 'm3', 'm3p'], d: '红线 3：看起来是私事，确认前必经这一问，默认「Only remind me」，只提醒自己，不进全家可见的日历。', p: 'ai-6' },
      dup: { n: '日历里已经有的牙医', path: ['m1', 'a2', 'm3', 'a3d', 'm3x'], d: '像已经有的日程：确认前把已有那条并排给出来，不自动合并；丢掉记为「Already added」，不算 AI 出错。', p: 'ai-12' },
      fail: { n: '一张看不出时间的图', path: ['m1', 'a2', 'a2x'], d: '没找到事件：说清原因，可以换一张或手动添加，已识别的字段带过去。', p: 'ai-3' },
      stale: { n: '没人处理的草稿', path: ['m1', 'a2', 'a3s'], d: '7 天没人处理就自动删除，绝不自动加进日历。', p: 'ai-7' },
      no: { n: 'Dad 去不了', path: ['m1', 'a2', 'm3', 'm3p', 'a4', 'd4', 'd5', 'm5x'], d: 'Dad 点「Can\'t make it」：只告诉 Mom 一个人，不通知全家，也不留拒绝记录。', p: 'ai-9' }
    };
    var EDGES = [['m1', 'a2', '截图 / 拍照 / 转发 / 说话'], ['a2', 'm3', '推送「Draft ready」'], ['a2', 'a2x', '', 1], ['m3', 'm3x', '', 1], ['m3', 'm3p', ''], ['m3p', 'a4', 'Add to calendar', 0, 'h'],
                 ['m3', 'a3d', '', 1], ['a3d', 'm3x', '', 1], ['a2', 'a3s', '', 1], ['a4', 'a5', ''], ['a4', 'd4', '涉及其他大人'], ['d4', 'd5', ''], ['d5', 'a5', "I'm in"], ['d5', 'm5x', '拒绝', 1, 'r']];
    var cur = null, timers = [];
    var box = root.querySelector('.lr-map'), svg = root.querySelector('.lr-lines');
    function el(id) { return box.querySelector('[data-n="' + id + '"]'); }
    function draw() {
      if (!svg || !box) return;
      var bb = box.getBoundingClientRect();
      svg.setAttribute('viewBox', '0 0 ' + Math.round(bb.width) + ' ' + Math.round(bb.height));
      var path = cur ? SC[cur].path : null, out = '';
      EDGES.forEach(function (e) {
        var A = el(e[0]), B = el(e[1]); if (!A || !B) return;
        var a = A.getBoundingClientRect(), b = B.getBoundingClientRect();
        var ax, ay, bx, by, d, lx, ly, anchor = 'end';
        if (e[4] === 'r') {
          /* 绕到右边外侧走，不穿过中间的节点 */
          var rx = Math.max(a.right, b.right) - bb.left + 14;
          ax = a.right - bb.left; ay = a.top + a.height / 2 - bb.top; bx = b.right - bb.left; by = b.top + b.height / 2 - bb.top;
          d = 'M' + ax + ' ' + ay + ' L' + rx + ' ' + ay + ' L' + rx + ' ' + by + ' L' + bx + ' ' + by;
          lx = rx + 6; ly = (ay + by) / 2; anchor = 'start';
        } else {
        if (b.left >= a.right - 4) { ax = a.right; ay = a.top + a.height / 2; bx = b.left; by = b.top + b.height / 2; }
        else if (b.right <= a.left + 4) { ax = a.left; ay = a.top + a.height / 2; bx = b.right; by = b.top + b.height / 2; }
        else if (b.top >= a.bottom) { ax = (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2; ay = a.bottom; bx = ax; by = b.top; }
        else { ax = (Math.max(a.left, b.left) + Math.min(a.right, b.right)) / 2; ay = a.top; bx = ax; by = b.bottom; }
        ax -= bb.left; bx -= bb.left; ay -= bb.top; by -= bb.top;
        var mid = (ax + bx) / 2, straight = Math.abs(ay - by) < 2 || Math.abs(ax - bx) < 2;
        d = straight ? 'M' + ax + ' ' + ay + ' L' + bx + ' ' + by : 'M' + ax + ' ' + ay + ' L' + mid + ' ' + ay + ' L' + mid + ' ' + by + ' L' + bx + ' ' + by;
        /* 标签：竖直直线放右边；拐弯的放在竖段左边；指定 h 的放在第一段横线上方 */
        if (e[4] === 'h') { lx = ax + 8; ly = ay - 7; anchor = 'start'; }
        else if (straight) { lx = ax + 7; ly = (ay + by) / 2; anchor = 'start'; }
        else { lx = mid - 7; ly = (ay + by) / 2; anchor = 'end'; }
        }
        var on = path && path.indexOf(e[0]) > -1 && path.indexOf(e[1]) === path.indexOf(e[0]) + 1;
        out += '<path class="' + (e[3] ? 'dash' : '') + (on ? ' on' : '') + '" d="' + d + '" marker-end="url(#lr-arrow' + (on ? '-on' : '') + ')"/>';
        if (e[2]) out += '<text class="' + (on ? 'on' : '') + '" x="' + lx + '" y="' + ly + '" text-anchor="' + anchor + '">' + esc(e[2]) + '</text>';
      });
      svg.innerHTML = '<defs><marker id="lr-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" class="ah"/></marker>' +
        '<marker id="lr-arrow-on" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" class="ah on"/></marker></defs>' + out;
    }
    function pick(k) {
      timers.forEach(clearTimeout); timers = [];
      cur = cur === k ? null : k;
      root.querySelectorAll('[data-sc]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-sc') === cur); b.setAttribute('aria-pressed', b.getAttribute('data-sc') === cur); });
      box.classList.toggle('picking', !!cur);
      box.querySelectorAll('[data-n]').forEach(function (n) { n.classList.remove('lit'); });
      var out = root.querySelector('.lr-out');
      if (!cur) { out.innerHTML = '<p class="mute">选一种情况，看它在三条泳道里怎么走。</p>'; draw(); return; }
      var sc = SC[cur];
      out.innerHTML = '<b>' + esc(sc.n) + '</b><p>' + esc(sc.d) + '</p><button type="button" class="lr-open" data-p="' + sc.p + '">在原型里看这一屏 →</button>';
      sc.path.forEach(function (id, i) {
        var lit = function () { var n = el(id); n && n.classList.add('lit'); };
        if (reduce) lit(); else timers.push(setTimeout(lit, i * 280));
      });
      draw();
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-sc]'); if (b) { pick(b.getAttribute('data-sc')); return; }
      var o = e.target.closest('.lr-open');
      if (o) {
        /* 打开下面收起的原型，跳到对应那一屏 */
        var fold = root.parentElement.querySelector('.proto-fold'), proto = document.querySelector('.proto[data-proto="ai"]');
        if (fold) fold.open = true;
        if (proto && proto._go) { proto._stopDemo && proto._stopDemo(); proto._go(o.getAttribute('data-p')); }
        if (proto) proto.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    });
    var ro = 'ResizeObserver' in window ? new ResizeObserver(draw) : null;
    if (ro) ro.observe(box); else window.addEventListener('resize', draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    root.classList.add('is-live');
    pick(null);
  }

  var MAP = { att: labAtt, sync: labSync, fut: labFut, ai: labAi };
  document.querySelectorAll('[data-lab]').forEach(function (r) {
    var f = MAP[r.getAttribute('data-lab')];
    if (f) { f(r); r.classList.add('is-live'); }
  });
})();
