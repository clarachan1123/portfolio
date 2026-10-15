/* 规格原件按 1344px 宽排版（原稿 1440 视口减左右边距）。放进比它窄的栏里时整体等比缩小（CSS zoom），
   最小缩到 0.5，再窄就横向滚动。没有脚本时直接横向滚动，内容一样能看。 */
(function () {
  var W = 1344;
  var boxes = document.querySelectorAll('.spec-fit');
  if (!boxes.length) return;
  function fit(box) {
    var doc = box.firstElementChild;
    if (!doc || !box.clientWidth) return;
    var cs = getComputedStyle(box);
    var inner = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    doc.style.zoom = Math.max(0.5, Math.min(1, inner / W));
  }
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(function (es) { es.forEach(function (e) { fit(e.target); }); });
    boxes.forEach(function (b) { ro.observe(b); });
  } else {
    boxes.forEach(fit);
    window.addEventListener('resize', function () { boxes.forEach(fit); });
  }
})();
