/* ============================================================
   Dijital davetiye — ortak davranışlar + efekt motoru
   Efektler nişe göre: perde açılışı (düğün/nişan/kına/açılış),
   balon + konfeti (baby shower/doğum günü), konfeti (sünnet).
   Baby shower: cinsiyet sürpriz — karışık pembe+mavi, PATLAMA YOK.
   Ekstra: 3D detay carousel, cinsiyet tahmini, takvime ekle, paylaş.
   RSVP & anı defteri submit'leri stub (Cursor backend bağlayacak).
   ============================================================ */
(function () {
  'use strict';
  var INVITE = window.INVITE || {};
  var theme = INVITE.theme || '';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var invEl = document.getElementById('inv') || document.querySelector('.inv') || document.body;

  // nişe göre efekt eşlemesi
  var FX = {
    altin:     { curtain: 1, burst: 'gold' },
    yildiz:    { curtain: 1, burst: 'gold' },
    cicek:     { curtain: 1, burst: 'rose' },
    nisan:     { curtain: 1, burst: 'gold' },
    kina:      { curtain: 1, burst: 'kina' },
    sunnet:    { burst: 'royal' },
    mevlut:    { burst: 'gold' },
    bebek:     { balloons: 1, burst: 'baby', noPop: 1 },   // cinsiyet sürpriz: patlama yok
    dogumgunu: { balloons: 1, burst: 'party' },
    acilis:    { curtain: 1, burst: 'gold' }
  };
  var fx = FX[theme] || { burst: 'gold' };

  var PALETTES = {
    gold:  ['#f7e7b0', '#e3c372', '#b88a3c', '#fff4d6'],
    rose:  ['#e7b6ad', '#bb8a5f', '#f3dccf', '#d98f86'],
    kina:  ['#e3c372', '#c14258', '#f7e7b0', '#8f1d2c'],
    royal: ['#e0c074', '#9fb4e8', '#ffffff', '#d4af37'],
    baby:  ['#f6a5c0', '#9ec5f0', '#ffffff', '#ffd1e3', '#cfe6ff'], // karışık — cinsiyet belli olmaz
    party: ['#f6a5c0', '#9ec5f0', '#e0c074', '#8f7ff0', '#7fd7a0']
  };
  var pal = PALETTES[fx.burst] || PALETTES.gold;

  // ---------- PERDE (curtain) ----------
  if (fx.curtain) {
    var cur = document.createElement('div');
    cur.className = 'curtain';
    cur.innerHTML =
      '<div class="rod"></div>' +
      '<div class="cpanel left"></div>' +
      '<div class="cpanel right"></div>' +
      '<div class="chint">✦ açmak için dokun ✦</div>';
    invEl.appendChild(cur);
    document.body.style.overflow = 'hidden';
    var curOpened = false;
    var openCurtain = function () {
      if (curOpened) return; curOpened = true;
      cur.classList.add('open');
      document.body.style.overflow = '';
      setTimeout(function () { cur.classList.add('done'); }, reduce ? 0 : 1750);
    };
    cur.addEventListener('click', openCurtain);
    setTimeout(openCurtain, reduce ? 200 : 1400);
  }

  // ---------- KONFETİ PATLAMASI ----------
  function burst(colors, n, originY) {
    if (reduce) return;
    colors = colors || pal;
    n = n || 70;
    var oy = originY == null ? 44 : originY;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < n; i++) {
      var b = document.createElement('div');
      b.className = 'confetti-bit';
      var ang = Math.random() * Math.PI * 2, sp = 50 + Math.random() * 230;
      b.style.setProperty('--tx', (Math.cos(ang) * sp) + 'px');
      b.style.setProperty('--ty', (Math.sin(ang) * sp - 30 + Math.random() * 280) + 'px');
      b.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      b.style.setProperty('--c', colors[i % colors.length]);
      b.style.left = (48 + Math.random() * 4) + '%';
      b.style.top = oy + '%';
      if (Math.random() < 0.5) b.style.borderRadius = '50%';
      b.style.animationDelay = (Math.random() * 0.12) + 's';
      frag.appendChild(b);
      (function (el) { setTimeout(function () { el.remove(); }, 1850); })(b);
    }
    document.body.appendChild(frag);
  }

  // ---------- BALON ----------
  function spawnBalloon(colors) {
    if (reduce) return;
    var c = colors[Math.floor(Math.random() * colors.length)];
    var el = document.createElement('div');
    el.className = 'balloon';
    el.style.setProperty('--c', c);
    el.style.left = (5 + Math.random() * 88) + '%';
    el.style.setProperty('--dur', (8 + Math.random() * 7) + 's');
    el.style.setProperty('--sway', ((Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 28)) + 'px');
    var life = parseFloat(el.style.getPropertyValue('--dur')) * 1000;
    if (!fx.noPop) {
      el.addEventListener('click', function () { popBalloon(el, c); });
      setTimeout(function () { if (el.parentNode) popBalloon(el, c); }, life * 0.82);
    } else {
      // baby shower: patlama yok — süzülüp kaybolur (cinsiyet sürpriz)
      setTimeout(function () { if (el.parentNode) el.remove(); }, life + 300);
    }
    document.body.appendChild(el);
  }
  function popBalloon(el, c) {
    var r = el.getBoundingClientRect();
    var oy = Math.max(4, (r.top / window.innerHeight * 100));
    el.remove();
    burst([c, '#ffffff', c], 16, oy);
  }
  function balloonShower(colors, count) {
    for (var i = 0; i < count; i++) {
      (function (d) { setTimeout(function () { spawnBalloon(colors); }, d); })(i * 170);
    }
  }

  // ---------- cover open ----------
  var cover = document.getElementById('cover');
  var openBtn = document.getElementById('openBtn');
  var audio = document.getElementById('bgMusic');
  function fireOpenFx() {
    burst(pal, fx.balloons ? 46 : 84, 45);
    if (fx.balloons) balloonShower(pal, 16);
  }
  if (openBtn) {
    openBtn.addEventListener('click', function () {
      cover.classList.add('hidden');
      document.body.style.overflow = '';
      if (audio) { audio.play().then(setPlaying).catch(function () {}); }
      window.scrollTo(0, 0);
      fireOpenFx();
    });
  }

  // baby shower / doğum günü: hafif sürekli balonlar
  if (fx.balloons && !reduce) {
    for (var k = 0; k < 4; k++) (function (d) { setTimeout(function () { spawnBalloon(pal); }, d * 900); })(k);
    setInterval(function () { if (!document.hidden) spawnBalloon(pal); }, 4200);
  }

  // ---------- DETAY CAROUSEL (3D yelpaze) ----------
  [].slice.call(document.querySelectorAll('[data-carousel]')).forEach(function (root) {
    var cards = [].slice.call(root.querySelectorAll('.dcard'));
    var dotsWrap = root.querySelector('.ddots');
    var n = cards.length, curi = 0;
    if (dotsWrap) {
      cards.forEach(function (_, i) {
        var d = document.createElement('div'); d.className = 'ddot';
        d.addEventListener('click', function () { curi = i; render(); });
        dotsWrap.appendChild(d);
      });
    }
    var dots = dotsWrap ? [].slice.call(dotsWrap.children) : [];
    function render() {
      cards.forEach(function (c, i) {
        var off = i - curi, a = Math.abs(off);
        if (a > 2) {
          c.style.opacity = 0; c.style.zIndex = 0; c.style.pointerEvents = 'none';
          c.style.transform = 'translateX(' + (off < 0 ? -260 : 260) + 'px) scale(.6)';
        } else {
          c.style.opacity = 1 - a * 0.26; c.style.zIndex = 5 - a; c.style.pointerEvents = '';
          c.style.transform = 'translateX(' + (off * 118) + 'px) rotateY(' + (-off * 22) + 'deg) scale(' + (1 - a * 0.12) + ')';
        }
      });
      dots.forEach(function (d, i) { d.classList.toggle('active', i === curi); });
    }
    var sx = null, moved = false;
    root.addEventListener('pointerdown', function (e) { sx = e.clientX; moved = false; });
    root.addEventListener('pointermove', function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 8) moved = true; });
    window.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (dx > 45 && curi > 0) curi--;
      else if (dx < -45 && curi < n - 1) curi++;
      render();
    });
    cards.forEach(function (c, i) { c.addEventListener('click', function () { if (!moved && i !== curi) { curi = i; render(); } }); });
    render();
  });

  // ---------- CİNSİYET TAHMİNİ ----------
  (function () {
    var wrap = document.getElementById('guess');
    if (!wrap) return;
    var counts = { kiz: Number(wrap.getAttribute('data-kiz') || 0), erkek: Number(wrap.getAttribute('data-erkek') || 0) };
    var picked = null;
    function upd() {
      var tot = (counts.kiz + counts.erkek) || 1;
      wrap.querySelector('.gb-pink').style.width = (counts.kiz / tot * 100) + '%';
      wrap.querySelector('.gb-blue').style.width = (counts.erkek / tot * 100) + '%';
      wrap.querySelector('[data-g=kiz] b').textContent = counts.kiz;
      wrap.querySelector('[data-g=erkek] b').textContent = counts.erkek;
    }
    [].slice.call(wrap.querySelectorAll('.guess-btn')).forEach(function (b) {
      b.addEventListener('click', function () {
        var g = b.getAttribute('data-g');
        if (picked === g) return;
        if (picked) { counts[picked]--; wrap.querySelector('[data-g=' + picked + ']').classList.remove('sel'); }
        counts[g]++; picked = g; b.classList.add('sel'); upd();
        // tahmin rengi = tahmin edenin seçimi (bebeğin cinsiyetini AÇIKLAMAZ)
        burst(g === 'kiz' ? ['#f6a5c0', '#ffd1e3', '#ffffff'] : ['#9ec5f0', '#cfe6ff', '#ffffff'], 24, 52);
      });
    });
    upd();
  })();

  // ---------- TAKVİME EKLE + PAYLAŞ ----------
  var calBtn = document.getElementById('calBtn');
  if (calBtn) {
    calBtn.addEventListener('click', function () {
      var s = calBtn.getAttribute('data-start'), e = calBtn.getAttribute('data-end');
      var t = calBtn.getAttribute('data-title') || document.title;
      var loc = calBtn.getAttribute('data-loc') || '';
      var url = 'https://www.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(t) +
        '&dates=' + s + '/' + e + '&location=' + encodeURIComponent(loc) + '&details=' + encodeURIComponent('davetimhazir.xyz');
      window.open(url, '_blank', 'noopener');
    });
  }
  var shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      if (navigator.share) { navigator.share({ title: document.title, url: location.href }).catch(function () {}); }
      else if (navigator.clipboard) { navigator.clipboard.writeText(location.href); var o = shareBtn.innerHTML; shareBtn.innerHTML = '✓ Kopyalandı'; setTimeout(function () { shareBtn.innerHTML = o; }, 1800); }
    });
  }

  // ---------- music toggle ----------
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

  // ---------- countdown ----------
  var cd = document.getElementById('countdown');
  if (cd) {
    var iso = cd.getAttribute('data-target');
    var target = iso ? new Date(iso) : new Date(Date.now() + 86400000 * 77);
    var elD = cd.querySelector('[data-d]'), elH = cd.querySelector('[data-h]'),
        elM = cd.querySelector('[data-m]'), elS = cd.querySelector('[data-s]');
    var pad = function (x) { return (x < 10 ? '0' : '') + x; };
    var tick = function () {
      var diff = Math.max(0, target - new Date());
      elD.textContent = Math.floor(diff / 86400000);
      elH.textContent = pad(Math.floor(diff / 3600000) % 24);
      elM.textContent = pad(Math.floor(diff / 60000) % 60);
      elS.textContent = pad(Math.floor(diff / 1000) % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  // ---------- scroll reveal ----------
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal-i').forEach(function (el) { io.observe(el); });

  // ---------- bottom nav active state ----------
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

  // ---------- RSVP submit (STUB — Cursor: POST /api/rsvp) ----------
  var rsvp = document.getElementById('rsvpForm');
  if (rsvp) {
    rsvp.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = Object.fromEntries(new FormData(rsvp).entries());
      data.slug = INVITE.slug || null;
      console.log('[RSVP stub]', data);
      rsvp.style.display = 'none';
      var ok = document.getElementById('rsvpOk');
      if (ok) ok.style.display = 'block';
      burst(pal, 50, 50);
    });
  }

  // ---------- Guestbook submit (STUB — Cursor: POST /api/guestbook) ----------
  var gb = document.getElementById('guestForm');
  if (gb) {
    gb.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var data = Object.fromEntries(new FormData(gb).entries());
      data.slug = INVITE.slug || null;
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

  // ---------- falling petals / sparkles (light deco) ----------
  var deco = document.getElementById('petals');
  if (deco && !reduce) {
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
