/* davetim hazır — landing interactions */
(function () {
  'use strict';

  // --- sticky nav background on scroll ---
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- mobile menu ---
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // --- scroll reveal ---
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  // --- FAQ accordion ---
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var ans = item.querySelector('.faq-a');
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!open) { item.classList.add('open'); ans.style.maxHeight = ans.scrollHeight + 'px'; }
    });
  });

  // --- hero live countdown (target: 90 days from now, demo) ---
  var target = new Date();
  target.setDate(target.getDate() + 90);
  var el = {
    d: document.getElementById('hc-d'), h: document.getElementById('hc-h'),
    m: document.getElementById('hc-m'), s: document.getElementById('hc-s')
  };
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    if (!el.d) return;
    var diff = Math.max(0, target - new Date());
    var d = Math.floor(diff / 86400000);
    var h = Math.floor(diff / 3600000) % 24;
    var m = Math.floor(diff / 60000) % 60;
    var s = Math.floor(diff / 1000) % 60;
    el.d.textContent = d; el.h.textContent = pad(h); el.m.textContent = pad(m); el.s.textContent = pad(s);
  }
  tick();
  setInterval(tick, 1000);

  // --- pricing plan select -> hand off to order flow (Cursor wires backend) ---
  // For now, scroll to contact / open chat. Replace with checkout when backend is ready.
  document.querySelectorAll('[data-plan]').forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      var plan = b.getAttribute('data-plan');
      // TODO (Cursor): POST /api/orders { plan } -> redirect to /basla?plan=...
      var msg = encodeURIComponent('Merhaba! "' + plan + '" paketi ile davetiye oluşturmak istiyorum.');
      window.open('https://wa.me/?text=' + msg, '_blank');
    });
  });
})();
