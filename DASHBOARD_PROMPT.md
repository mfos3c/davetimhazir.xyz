# Cursor Prompt — Ops Dashboard (panel.davetimhazir.com)

> `PROMPT` bloğunu Cursor'a yapıştır. Bu panel **Raspberry Pi 5'te** çalışır, **Cloudflare Tunnel + Access** arkasında yalnız işletme sahibine açıktır (bkz. `INFRA.md`). Backend/şema `CURSOR_PROMPT.md` ile aynı Supabase projesini kullanır.

---

## PROMPT (Cursor'a yapıştır) ⬇️

davetimhazir.com dijital davetiye işi için **yerel/self-host bir operasyon paneli** kuruyorum. Panel Raspberry Pi 5'te çalışacak, Cloudflare Access arkasında olacak (panel zaten kimlik doğrulamadan geçmiş kabul; uygulama içinde ayrıca login YOK). Aynı Supabase projesine bağlanır (şema `CURSOR_PROMPT.md`'de: invitations, orders, payments, rsvps, guestbook, activity_log, invitation_views).

### Stack & güvenlik
- **Next.js 14 (App Router) + TypeScript + Tailwind.** Tek kişilik kullanım, masaüstü öncelikli, mobil de çalışsın.
- **`SUPABASE_SERVICE_ROLE_KEY` yalnız sunucu tarafında** (server actions / route handlers / RSC). Tarayıcıya asla sızmasın.
- Erişim kontrolü Cloudflare Access tarafından; uygulama Access JWT header'ını (`Cf-Access-Authenticated-User-Email`) doğrulayıp e-postayı whitelist ile karşılaştırsın (savunma derinliği).
- Docker'da çalışacak (bkz. `INFRA.md`); `next start`, port 3000.

### Ekranlar / özellikler
**1. Pano (ana ekran)**
- KPI kartları: aktif sipariş, bu ay gelir (ödenen `payments` toplamı), bu hafta teslim edilecek, bekleyen ödeme sayısı/tutarı, süresi dolan (arşivlenecek) sayısı.
- Uyarı şeridi: ödeme >24s bekliyor, form gelmedi, etkinliğe ≤3 gün, `delete_after <= now()`.

**2. Kanban iş akışı** (ana çalışma alanı)
- Kolonlar = `orders.stage`: Yeni talep → Teklif → Ödeme bekliyor → Ödeme alındı → Form bekleniyor → Form geldi → Üretimde → Önizleme gönderildi → Revizyon → Yayında → Etkinlik geçti → PDF gönderildi → Arşiv.
- Kart = sipariş/müşteri: ad, etkinlik türü+tarihi, paket, ödeme rozeti, subdomain linki. Sürükle-bırak ile aşama değişir → `orders.stage` güncellenir + `activity_log`'a yazılır.
- Supabase **Realtime** ile canlı (n8n bir kaydı güncelleyince kart kendiliğinden hareket etsin).

**3. Sipariş/müşteri detayı** (drawer/sayfa)
- Tüm Google Form yanıtı (`invitations.form_data`), düzenlenebilir alanlar (isim/tarih/mekan/tema) → kaydet.
- Subdomain linki (aç) + QR kod üret; davetiye durumu (preview/published/archived) değiştir.
- **Ödeme & dekont:** `payments` listesi; yeni ödeme ekle (kapora/bakiye/tam), tutar, **dekont yükle** (Supabase Storage `dekontlar/{order_id}/`), önizle; toplam ödenen vs anlaşılan + kalan bakiye; "Ödeme alındı → published" tek tık.
- **Durum geçmişi (timeline):** `activity_log`.
- Notlar (`orders.notes`).
- **Katılım:** RSVP listesi + sayım (katılan/kişi sayısı), CSV export; anı defteri mesajları (onayla/sil — `guestbook.approved`).

**4. n8n aksiyonları (tek tık → webhook)**
- "Davetiye üret", "WhatsApp önizleme gönder", "Yayına al", "WhatsApp teslim", "PDF oluştur", "PDF gönder + sil". Her biri n8n webhook'una POST atar (`N8N_BASE_URL` + gizli token), sonucu `activity_log`'a yazar. Hızlı WhatsApp şablon mesajları (kopyala / wa.me linki).

**5. Gelir & raporlar**
- Aylık/günlük gelir grafiği, paket dağılımı, ödenmemişler tablosu, teslim takvimi (etkinlik tarihleri — takvim görünümü).

**6. Sistem sağlığı** (Pi'de çalıştığı için)
- n8n erişilebilir mi (health ping) + son akış durumu; Cloudflare Tunnel durumu; Pi metrikleri (CPU/RAM/disk/sıcaklık) — `/api/system` route'u `os` + `vcgencmd`/`/sys/class/thermal` okur (Pi'de). Veri yoksa zarifçe gizle.

### Veri/işlevler
- Sunucu tarafı Supabase admin client (`service_role`) ile tüm CRUD.
- Arama/filtre: müşteri adı, statü, aşama, paket, tarih aralığı.
- Tüm durum değişiklikleri `activity_log`'a (`action`, `actor='owner'`, `meta`).
- "Süresi dolanlar" görünümü: `delete_after <= now()` → tek tık "PDF gönder + sil" (n8n webhook); silme **manuel**.

### Yapım sırası
1. Next.js + Tailwind + server-side Supabase admin client + Cloudflare Access e-posta kontrolü (middleware).
2. Pano + Kanban (Realtime, sürükle-bırak) + `activity_log`.
3. Sipariş detayı + ödeme/dekont yükleme + RSVP/anı defteri.
4. n8n aksiyon webhook'ları + hızlı WhatsApp şablonları.
5. Raporlar + takvim + sistem sağlığı.
6. Dockerfile + `next start` (INFRA.md compose ile uyumlu).

### Env
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
N8N_BASE_URL=https://n8n.davetimhazir.com
N8N_WEBHOOK_SECRET=
ACCESS_ALLOWED_EMAILS=seninmail@ornek.com
ROOT_DOMAIN=davetimhazir.com
```

### Kabul kriterleri
- [ ] Panel Cloudflare Access arkasında açılıyor; yalnız izinli e-posta erişebiliyor; service_role tarayıcıya sızmıyor.
- [ ] Kanban sürükle-bırak çalışıyor, `orders.stage` + `activity_log` güncelleniyor, Realtime canlı.
- [ ] Dekont yüklenip görüntülenebiliyor; kalan bakiye doğru; "Ödeme alındı → published" çalışıyor.
- [ ] RSVP/anı defteri görüntüleme + CSV export çalışıyor.
- [ ] n8n aksiyon butonları webhook tetikliyor; "PDF gönder + sil" süresi dolanlarda çalışıyor.
- [ ] Pano KPI'ları ve uyarılar doğru; sistem sağlığı widget'ı Pi'de veri gösteriyor.

## PROMPT SONU ⬆️
