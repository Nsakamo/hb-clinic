/* =========================================================
   歯と美容のクリニック — main.js
   ハンバーガー / FAQアコーディオン / NO順番表示 / Scroll Reveal
   ========================================================= */
(function () {
  'use strict';

  /* ---- モバイルメニュー ---- */
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
      document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- FAQ アコーディオン ---- */
  document.querySelectorAll('[data-faq] .faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // 同じグループ内を閉じる（任意：1つだけ開く挙動）
      var group = item.closest('[data-faq]');
      group.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-a').style.maxHeight = null;
        }
      });
      if (isOpen) {
        item.classList.remove('open');
        a.style.maxHeight = null;
      } else {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- IntersectionObserver: Scroll Reveal + NO順番表示 ---- */
  var supportIO = 'IntersectionObserver' in window;

  if (supportIO) {
    var revealIO = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revealIO.observe(el); });

    /* NO宣言：カードを順番にフェードイン */
    var noGrid = document.getElementById('noGrid');
    if (noGrid) {
      var cards = noGrid.querySelectorAll('.no-card');
      var noIO = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            cards.forEach(function (card, i) {
              setTimeout(function () { card.classList.add('show'); }, i * 220);
            });
            obs.disconnect();
          }
        });
      }, { threshold: 0.3 });
      noIO.observe(noGrid);
    }
  } else {
    /* フォールバック：演出なしで全表示 */
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.no-card').forEach(function (el) { el.classList.add('show'); });
  }

  /* ---- アンカーリンクのヘッダー分オフセット補正 ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (ev) {
      var id = link.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      ev.preventDefault();
      var headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      var top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });
})();
