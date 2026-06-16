/* =========================================================
   歯と美容のクリニック — main.js
   ハンバーガー / FAQアコーディオン / 軽いスクロール演出 / アンカー補正
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

  /* ---- スクロール演出（軽いフェードアップ・絶対に消えたままにしない） ---- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function showAll() { reveals.forEach(function (el) { el.classList.add('in'); }); }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -4% 0px' });

    reveals.forEach(function (el) {
      var r = el.getBoundingClientRect();
      // 初期表示時にすでに見えている/上にある要素は即表示（チラつき防止）
      if (r.top < window.innerHeight * 0.92) { el.classList.add('in'); }
      else { io.observe(el); }
    });

    // 保険：1.4秒後、画面付近にある未表示要素を表示（空白を残さない）
    setTimeout(function () {
      reveals.forEach(function (el) {
        if (!el.classList.contains('in')) {
          var r = el.getBoundingClientRect();
          if (r.top < window.innerHeight * 1.3) el.classList.add('in');
        }
      });
    }, 1400);
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
