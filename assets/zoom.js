/* 点图放大：案例页里的截图、规格图点一下就铺满屏幕看原图。
   同一组（同一条横滑、或同一页的单张截图）里可以用 ← → 翻页，Esc 或点背景关闭。
   JS 不跑也不影响阅读 —— 只是图不能放大。 */
(function () {
  var SEL = '.filmstrip img, .shot img, .win img';
  var imgs = Array.prototype.slice.call(document.querySelectorAll(SEL));
  if (!imgs.length) return;

  var box = document.createElement('div');
  box.className = 'zoom';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', '查看大图');
  box.hidden = true;
  box.innerHTML =
    '<figure class="zoom-fig"><img alt=""><figcaption></figcaption></figure>' +
    '<button type="button" class="zoom-btn zoom-prev" aria-label="上一张">←</button>' +
    '<button type="button" class="zoom-btn zoom-next" aria-label="下一张">→</button>' +
    '<button type="button" class="zoom-btn zoom-close" aria-label="关闭">×</button>';
  document.body.appendChild(box);

  var big = box.querySelector('img');
  var cap = box.querySelector('figcaption');
  var prev = box.querySelector('.zoom-prev');
  var next = box.querySelector('.zoom-next');
  var group = [], idx = 0, opener = null;

  /* 一条横滑算一组；其余单张截图各自成组，不和别的图串在一起翻 */
  function groupOf(img) {
    var strip = img.closest('.filmstrip');
    return strip ? Array.prototype.slice.call(strip.querySelectorAll('img')) : [img];
  }

  function captionOf(img) {
    var fig = img.closest('figure');
    var fc = fig && fig.querySelector('figcaption');
    return (fc && fc.textContent.trim()) || img.alt || '';
  }

  function show(i) {
    idx = (i + group.length) % group.length;
    var img = group[idx];
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    cap.textContent = captionOf(img) + (group.length > 1 ? '　' + (idx + 1) + ' / ' + group.length : '');
  }

  function open(img) {
    opener = img;
    group = groupOf(img);
    prev.hidden = next.hidden = group.length < 2;
    show(group.indexOf(img));
    box.hidden = false;
    document.documentElement.classList.add('zoom-open');
    box.querySelector('.zoom-close').focus();
  }

  function close() {
    box.hidden = true;
    document.documentElement.classList.remove('zoom-open');
    if (opener) opener.focus();
  }

  imgs.forEach(function (img) {
    img.classList.add('zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', '放大查看：' + (img.alt || '截图'));
    img.addEventListener('click', function () { open(img); });
    img.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); }
    });
  });

  box.addEventListener('click', function (e) {
    if (e.target === prev) show(idx - 1);
    else if (e.target === next) show(idx + 1);
    else if (e.target !== big) close();
  });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft' && group.length > 1) show(idx - 1);
    else if (e.key === 'ArrowRight' && group.length > 1) show(idx + 1);
  });
})();
