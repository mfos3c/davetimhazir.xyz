# davetim hazır — davetimhazir.xyz

Dijital davetiye işi. Bu repo **frontend** kısmıdır: dikkat çeken pazarlama sayfası + canlı çalışan davetiye şablonları. Backend (Supabase, n8n, Telegram, ödeme) **Cursor** ile kurulacak — bkz. [`CURSOR_PROMPT.md`](CURSOR_PROMPT.md).

## Dosyalar
```
index.html              → Landing / pazarlama sayfası
css/style.css           → Landing stilleri
js/main.js              → Landing etkileşimleri (nav, geri sayım, FAQ, paket seçimi)
templates/
  index.html            → Şablon galerisi
  altin-gece.html       → Tema 1: siyah & altın, lüks (Düğün)
  yildiz-tozu.html      → Tema 2: lacivert, minimal, yıldızlı (Düğün)
  zarif-cicek.html      → Tema 3: krem & gül, romantik (Nişan)
  invitation.css        → Davetiyelerin ortak stili + 3 tema
  invitation.js         → Kapak açma, müzik, geri sayım, RSVP & anı defteri (backend'e bağlanacak)
CURSOR_PROMPT.md        → Tüm backend için Cursor'a verilecek prompt
```

## Önizleme
Statik site — kurulum gerekmez. `index.html` dosyasını tarayıcıda aç.
Yerel sunucu istersen:
```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Şablon davranışı
- **Kapak:** "Davetiyeyi Aç" → içerik açılır + müzik başlar.
- **Geri sayım:** `#countdown` üzerindeki `data-target` ISO tarihinden canlı sayar.
- **RSVP / Anı defteri:** şu an stub (`console.log`). Cursor `/api/rsvp` ve `/api/guestbook`'a bağlayacak.
- **Tema:** `<div class="inv theme-altin|theme-yildiz|theme-cicek">` ile değişir.

## Sonraki adım
`CURSOR_PROMPT.md` içindeki PROMPT bloğunu Cursor'a yapıştır → veri-odaklı, ödemeli, otomatik ürüne dönüşür.
```
davetimhazir.xyz/[slug]  → her çift için kişiye özel davetiye (Supabase verisinden)
```
