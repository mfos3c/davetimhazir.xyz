/* ============================================================
   Dijital davetiye — ortak davranışlar
   Cursor backend notu: gerçek veriler window.INVITE içine gelecek
   (Supabase'den [slug] ile). RSVP & anı defteri submit'leri şu an
   stub; Cursor bunları /api/rsvp ve /api/guestbook'a bağlayacak.
   ============================================================ */
(function () {
  'use strict';
  var INVITE = window.INVITE || {};

  // ---- cover open ----
  var cover = document.getElementById('cover');
  var openBtn = document.getElementById('openBtn');
  var audio = document.getElementById('bgMusic');
  if (openBtn) {
    openBtn.addEventListener('click', function () {
      cover.classList.add('hidden');
      document.body.style.overflow = '';
      if (audio) { audio.play().then(setPlaying).catch(function () {}); }
      window.scrollTo(0, 0);
    });
  }

  // ---- music toggle ----
  var mt = document.getElementById('musicToggle');
  function setPlaying() { if (mt) mt.classList.add('playing'); }
  function setPaused() { if (mt) mt.classList.remove('playing'); }
  if (mt && audio) {
    mt.addEventListener('click', function () {
      if (audio.paused) { audio.play().then(setPlaying).catch(function () {}); }
      else { audio.pause(); setPaused(); }
    });
    audio.addEventListener('play', setPlaying);
    audio.addEventListener('pause', setPaused);
  }

  // ---- countdown ----
  var cd = document.getElementById('countdown');
  if (cd) {
    var iso = cd.getAttribute('data-target');
    var target = iso ? new Date(iso) : new Date(Date.now() + 86400000 * 77);
    var elD = cd.querySelector('[data-d]'), elH = cd.querySelector('[data-h]'),
        elM = cd.querySelector('[data-m]'), elS = cd.querySelector('[data-s]');
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var tick = function () {
      var diff = Math.max(0, target - new Date());
      elD.textContent = Math.floor(diff / 86400000);
      elH.textContent = pad(Math.floor(diff / 3600000) % 24);
      elM.textContent = pad(Math.floor(diff / 60000) % 60);
      elS.textContent = pad(Math.floor(diff / 1000) % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  // ---- scroll reveal ----
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal-i').forEach(function (el) { io.observe(el); });

  // ---- bottom nav active state ----
  var navLinks = document.querySelectorAll('.bottom-nav a');
  var secs = document.querySelectorAll('[data-sec]');
  var navIo = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting) {
        var id = e.target.getAttribute('data-sec');
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
      }
    });
  }, { threshold: 0.5 });
  secs.forEach(function (s) { navIo.observe(s); });

  // ---- RSVP submit (STUB — Cursor: POST /api/rsvp) ----
  var rsvp = document.getElementById('rsvpForm');
  if (rsvp) {
    rsvp.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = Object.fromEntries(new FormData(rsvp).entries());
      data.slug = INVITE.slug || null;
      // TODO (Cursor): await fetch('/api/rsvp', {method:'POST', body: JSON.stringify(data)})
      console.log('[RSVP stub]', data);
      rsvp.style.display = 'none';
      var ok = document.getElementById('rsvpOk');
      if (ok) ok.style.display = 'block';
    });
  }

  // ---- Guestbook submit (STUB — Cursor: POST /api/guestbook) ----
  var gb = document.getElementById('guestForm');
  if (gb) {
    gb.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = Object.fromEntries(new FormData(gb).entries());
      data.slug = INVITE.slug || null;
      // TODO (Cursor): await fetch('/api/guestbook', {...}) then re-render list
      console.log('[Guestbook stub]', data);
      var list = document.getElementById('guestList');
      if (list && data.name) {
        var div = document.createElement('div');
        div.className = 'guest reveal-i in';
        div.innerHTML = '<div class="g-name"></div><div class="g-msg"></div>';
        div.querySelector('.g-name').textContent = data.name;
        div.querySelector('.g-msg').textContent = data.message || '';
        list.prepend(div);
      }
      gb.reset();
    });
  }

  // ---- falling petals (light deco) ----
  var deco = document.getElementById('petals');
  if (deco) {
    var glyph = deco.getAttribute('data-glyph') || '✦';
    for (var i = 0; i < 9; i++) {
      var p = document.createElement('div');
      p.className = 'petal';
      p.textContent = glyph;
      p.style.left = Math.random() * 100 + '%';
      p.style.fontSize = (10 + Math.random() * 14) + 'px';
      p.style.animationDuration = (9 + Math.random() * 8) + 's';
      p.style.animationDelay = (-Math.random() * 10) + 's';
      deco.appendChild(p);
    }
  }
})();
