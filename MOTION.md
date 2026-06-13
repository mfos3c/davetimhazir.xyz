# Motion Sistemi — Altın Gece

Bu doküman, davetim hazır arayüzündeki ve davetiye şablonlarındaki tüm animasyonların kurallarını tanımlar. Amaç: zarif, sakin, "lüks" hissi veren hareketler — asla agresif veya dikkat dağıtıcı değil.

## 1. Temel Prensipler

- **Sakinlik önce gelir.** Hareketler bilgi iletmeli veya hiyerarşiye dikkat çekmeli; dekoratif fazlalık yapılmaz.
- **Yumuşak giriş, yumuşak çıkış.** Ani veya mekanik hareket yok — her şey `ease-out` veya özel cubic-bezier ile yavaşlayarak biter.
- **Kısa süreler.** Mikro-etkileşimler 150–300ms, sayfa/element girişleri 500–900ms, dekoratif/atmosferik animasyonlar (parıltı, kayan yıldız) 6–20s döngülerle.
- **Stagger (sıralı gecikme) ile derinlik.** Liste/grid elemanları tek tek değil, 60–120ms aralıklarla belirir.

## 2. Standart Easing & Süre Token'ları

```css
:root {
  /* Easing */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);       /* genel giriş/çıkış */
  --ease-soft: cubic-bezier(0.4, 0, 0.2, 1);        /* hover/micro */
  --ease-luxe: cubic-bezier(0.22, 1, 0.36, 1);      /* büyük reveal'lar */

  /* Süreler */
  --dur-micro: 180ms;   /* hover, focus, buton basımı */
  --dur-fast: 320ms;    /* küçük UI geçişleri (dropdown, tooltip) */
  --dur-base: 600ms;    /* kart/section reveal */
  --dur-slow: 900ms;    /* hero başlık, büyük kompozisyonlar */
  --dur-ambient: 12s;   /* parıltı, glow, sürüklenen partikül döngüleri */
}
```

## 3. Element Bazlı Spesifikasyonlar

### 3.1 Sayfa Yüklenişi (Landing + Davetiye Cover)
- **Hero başlık / davetiye isimleri**: `opacity 0→1` + `translateY(16px)→0`, `var(--dur-slow)` `var(--ease-luxe)`, gecikme yok (ilk eleman).
- **Eyebrow metni (üst etiket)**: aynı hareket, 80ms gecikme ile başlık öncesi belirir.
- **Alt metin / tarih**: 160ms gecikme.
- **CTA butonu**: 240ms gecikme, ek olarak `scale(0.98)→1`.
- **Spark/mark logosu**: `opacity 0→1` + hafif `rotate(-8deg)→0deg`, `var(--dur-base)`.

### 3.2 Scroll Reveal (`.reveal` sınıfı)
- IntersectionObserver ile tetiklenir, viewport'a %15 girince `is-visible` class eklenir.
- `opacity 0→1`, `translateY(24px)→0`, `var(--dur-base)` `var(--ease-out)`.
- Grid içindeki kartlar (`.tpl-card`, `.feature-card` vb.) **stagger**: `transition-delay: calc(var(--i) * 80ms)` (her kart `--i` custom property'sine sahip olmalı).
- Bir kez tetiklenir, tekrar gizlenmez (kullanıcı yukarı kaydırınca animasyon tekrar oynamaz).

### 3.3 Geri Sayım (Countdown)
- Sayı değiştiğinde: eski sayı `opacity 1→0` + `translateY(0→-6px)`, yeni sayı `opacity 0→1` + `translateY(6px→0)`, `var(--dur-micro)` `var(--ease-soft)`.
- Saniye biriminin değişimi her zaman, dakika/saat/gün sadece değiştiğinde animasyonlanır (gereksiz yeniden render yok).

### 3.4 Hover & Etkileşim
- **Butonlar**: `background`/`border-color` `var(--dur-micro)` `var(--ease-soft)`; `transform: translateY(-1px)` hover'da, `translateY(0)` active'de.
- **Kartlar (tpl-card, info-card)**: hover'da `translateY(-4px)` + `box-shadow` yoğunlaşması, `var(--dur-fast)` `var(--ease-soft)`.
- **Linkler**: alt çizgi `transform: scaleX(0)→1`, `transform-origin: left`, `var(--dur-fast)`.
- **Form alanları**: focus ring `box-shadow` geçişi `var(--dur-micro)`, renk değişimi ani değil.

### 3.5 Galeri / Lightbox (varsa)
- Açılış: arka plan `opacity 0→1` (`var(--dur-fast)`), görsel `scale(0.96)→1` + `opacity 0→1` (`var(--dur-base)` `var(--ease-luxe)`).
- Kapanış: ters sırada, %60 daha hızlı (`var(--dur-fast)`).

### 3.6 Davetiye Sayfası — RSVP / Form Gönderimi
- Gönder butonuna tıklanınca: buton içeriği `opacity` ile spinner'a geçer (180ms), başarı durumunda yeşil/gold check ikonu `scale(0)→1` `var(--ease-luxe)` ile büyür.
- Başarı mesajı kart şeklinde `opacity 0→1` + `translateY(8px→0)`, `var(--dur-base)`.

### 3.7 Atmosferik / Dekoratif (Sparks, Glow)
- Arka plan parıltıları (`.spark`, `.glow-orb`): `opacity` 0.3↔0.7 arası nazikçe pulse, `var(--dur-ambient)` (12–20s), `ease-in-out`, `infinite alternate`.
- Çok hafif `translate` (±8px) ile "yaşayan" bir arka plan hissi — asla göz alıcı değil.
- Sayfa scroll'una bağlı parallax: dekoratif elemanlar scroll hızının %5–10'u kadar hareket eder (performans için `transform: translate3d`, `will-change: transform`).

### 3.8 Sayfa Geçişleri (Şablonlar arası / link tıklama)
- Çıkış: `body { opacity: 1→0 }`, `var(--dur-fast)` `var(--ease-soft)`, ardından navigasyon.
- Yeni sayfa girişi: yukarıdaki "Sayfa Yüklenişi" kurallarına döner.

## 4. Reduced Motion

`prefers-reduced-motion: reduce` her zaman saygı görür:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .reveal {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

Kurallar:
- Tüm `translateY`/`scale`/`rotate` tabanlı giriş animasyonları **anında** son durumlarına geçer (görünürlük kaybı olmaz).
- Ambient/atmosferik animasyonlar (spark pulse, parallax) **tamamen durur** — statik son kareye sabitlenir.
- Countdown sayı geçiş animasyonu kapanır ama sayılar normal şekilde güncellenir (fonksiyonellik korunur).
- Sayfa geçiş fade-out'u kapanır — navigasyon anında gerçekleşir.

## 5. Performans Notları

- Sadece `opacity`, `transform` (translate/scale/rotate) ve `filter` (gerektiğinde) animasyonlanır — `width`/`height`/`top`/`left` gibi layout tetikleyen özellikler kullanılmaz.
- Ambient animasyonlu elemanlara `will-change: transform, opacity` eklenir, ancak sayfa başına en fazla 3–4 elemanla sınırlı tutulur.
- IntersectionObserver `threshold: 0.15`, `rootMargin: "0px 0px -40px 0px"` önerilir — elemanlar viewport'a tam girmeden biraz önce tetiklenir.

## 6. Uygulama Durumu

| Alan | Durum |
|---|---|
| Landing page hero/scroll reveal | Uygulanmalı (`reveal` sınıfı zaten kullanılıyor — bu spesifikasyona göre süre/easing token'ları eklenmeli) |
| Davetiye şablonları (8 tema) — countdown, form, hover | Uygulanmalı (`invitation.js` içinde merkezi olarak) |
| Reduced motion media query | Global `style.css` ve `invitation.css` içine eklenmeli |
| Atmosferik spark/glow animasyonları | Mevcut dekoratif SVG/CSS elemanlarına uygulanmalı |
