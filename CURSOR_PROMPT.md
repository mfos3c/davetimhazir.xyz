# Cursor Prompt — davetimhazir.xyz Backend

> Bu dosyadaki "PROMPT" bölümünü olduğu gibi kopyalayıp Cursor'a (Composer/Agent moduna) yapıştır.
> Frontend (landing + 3 davetiye şablonu) bu repoda hazır; Cursor'un işi bunları **veri-odaklı, ödemeli, otomatik** bir ürüne çevirmek.

---

## PROMPT (Cursor'a yapıştır) ⬇️

Bir dijital davetiye işinin (davetimhazir.xyz) backend'ini kuruyorum. Bu repoda zaten **statik bir frontend** var:

- `index.html` + `css/style.css` + `js/main.js` → pazarlama/landing sayfası
- `templates/index.html` → şablon galerisi
- `templates/altin-gece.html`, `templates/yildiz-tozu.html`, `templates/zarif-cicek.html` → 3 davetiye teması
- `templates/invitation.css` + `templates/invitation.js` → davetiyelerin ortak stil/davranışı. Bu dosyalar **tasarım referansıdır**; birebir görünümü koru.

`templates/invitation.js` içinde RSVP ve anı defteri submit'leri şu an **stub** (sadece `console.log`). `window.INVITE = { slug, theme }` global'i mevcut. Görünümü bozmadan bunları gerçek backend'e bağla.

### Hedef mimari
- **Framework:** Next.js 14 (App Router) + TypeScript. Mevcut statik tasarımı React bileşenlerine taşı; CSS'i birebir koru (global css olarak import edebilirsin).
- **Veritabanı + Storage + Auth:** Supabase (Postgres + Storage + RLS).
- **Hosting:** Vercel. Davetiyeler dinamik route ile: `davetimhazir.xyz/[slug]` (yeniden build GEREKMEDEN, ISR/SSR ile Supabase'den okur).
- **Otomasyon:** n8n workflow (Google Form → Supabase → Telegram). Workflow'u JSON export + node açıklamaları olarak `automation/n8n-workflow.md` dosyasına yaz.
- **Bildirim/onay:** Telegram bot.

### Veri modeli (Supabase SQL — `supabase/migrations/0001_init.sql` oluştur)
```sql
-- davetiyeler
create table invitations (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,           -- davetimhazir.xyz/elif-polat
  theme         text not null default 'altin',  -- altin | yildiz | cicek
  status        text not null default 'draft',  -- draft | preview | published
  type          text default 'dugun',           -- dugun | nisan | kina | sunnet | dogumgunu
  -- çift
  bride_name    text, groom_name text,
  bride_parents text, groom_parents text,
  cover_eyebrow text default 'Davetlisiniz',
  city          text,
  main_date     timestamptz,                     -- geri sayım hedefi
  -- merasimler (kına, düğün vs.) - esnek
  events        jsonb default '[]',              -- [{title,time,date,day,place,address,maps_query}]
  map_query     text,                            -- ana mekan harita sorgusu
  music_url     text,                            -- Supabase storage public url
  photos        jsonb default '{}',              -- {bride, groom, gallery:[]}
  story_text    text, story_sign text,
  rsvp_enabled  boolean default true,
  -- müşteri (sipariş sahibi)
  customer_name text, customer_contact text,     -- telefon/telegram
  created_at    timestamptz default now()
);

-- RSVP yanıtları  (frontend gönderdiği alanlar: name, attending, guests, slug)
create table rsvps (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete cascade,
  name          text not null,
  attending     text not null,                   -- 'evet' | 'hayir'
  guests        text,
  created_at    timestamptz default now()
);

-- anı defteri  (frontend: name, message, slug)
create table guestbook (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete cascade,
  name          text not null,
  message       text not null,
  approved      boolean default true,            -- spam'e karşı istersen false yap
  created_at    timestamptz default now()
);

-- siparişler / ödeme (Telegram + IBAN akışı)
create table orders (
  id            uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete set null,
  slug          text,
  plan          text,                            -- Sade | Premium | VIP
  amount        numeric,
  customer_name text, customer_contact text,
  status        text not null default 'pending', -- pending | paid | cancelled
  iban_ref      text,                            -- dekont notu/referans
  created_at    timestamptz default now(),
  paid_at       timestamptz
);
```
RLS politikaları:
- `invitations`: `status = 'published'` veya `'preview'` olanlar herkese **okunur**; yazma sadece service_role.
- `rsvps`, `guestbook`: herkes **insert** edebilir (RLS ile sadece insert), okuma sadece ilgili davetiyeye ait + service_role. Anon insert için rate limit / honeypot ekle.
- `orders`: sadece service_role.

### API route'ları (App Router, `app/api/...`)
1. `POST /api/rsvp` — body `{ slug, name, attending, guests }` → slug'tan invitation_id bul, `rsvps`'e insert. Başarıda `{ ok: true }`.
2. `POST /api/guestbook` — body `{ slug, name, message }` → insert, dönüşte güncel onaylı liste. Basit küfür/spam filtresi + rate limit.
3. `GET /api/guestbook?slug=...` — onaylı mesajları döndür (davetiye sayfası ilk yüklemede çeker).
4. `POST /api/orders` — landing'deki "Seç" butonundan `{ plan }` → order(pending) oluştur, Telegram'a bildir, kullanıcıyı `/basla?order=...` ya da WhatsApp/Telegram'a yönlendir.
5. `POST /api/webhooks/n8n` — n8n'den gelen doğrulanmış davetiye verisini `invitations`'a yazar (service_role, gizli token ile korumalı).

`templates/invitation.js` içindeki RSVP ve guestbook stub fetch'lerini bu route'lara bağla (TODO yorumları orada işaretli).

### Davetiye render (`app/[slug]/page.tsx`)
- Supabase'den slug ile invitation çek. Yoksa 404.
- `theme` alanına göre `theme-altin | theme-yildiz | theme-cicek` class'ını uygula (CSS hazır).
- Tüm metin/tarih/mekan/foto'ları veriden bas. `events` jsonb dizisini map'leyerek merasim kartlarını üret.
- `main_date`'i countdown `data-target`'ına ISO olarak ver.
- **Ödeme kapısı (önemli):** `status='published'` değilse davetiyeyi **filigranlı önizleme** göster (örn. üstte "ÖNİZLEME — ödeme sonrası yayınlanır" bandı, alt köşede watermark) ve paylaşım/indexlemeyi kapat (`noindex`). `status='published'` olunca temiz sürüm.
- SEO: published davetiyeler için OpenGraph (çift adı + tarih + kapak görseli).

### Otomasyon — n8n workflow (`automation/n8n-workflow.md`)
Şu node sırasını JSON export + açıklama olarak yaz:
1. **Trigger:** Google Sheets "Row Added" (Google Form yanıtları bu sheet'e düşer) — alternatif: Form webhook.
2. **Function/Set:** alanları normalize et, eksikleri kontrol et.
3. **Slug üret:** `bride+groom` → kebab-case (`elif-polat`); çakışırsa `-2` ekle (Supabase'de var mı diye HTTP ile kontrol).
4. **Foto işle:** Google Form'un Drive'a yüklediği dosyaları indir → Supabase Storage'a (veya Cloudinary) yükle, public URL al.
5. **Geocode (opsiyonel):** mekan adresi → maps_query / koordinat.
6. **Supabase insert:** `POST /api/webhooks/n8n` (gizli token) ya da Supabase REST ile `invitations` (status='preview').
7. **Telegram bildirim (SANA):** "🆕 Yeni davetiye: {çift} | paket: {plan} | önizleme: davetimhazir.xyz/{slug} | müşteri: {contact} | ödeme: BEKLENİYOR" + Inline butonlar: [Ödeme Alındı] [İptal].
8. **Ödeme onayı:** Telegram callback (veya bot komutu `/onayla {slug}`) → order.status='paid', invitation.status='published' → müşteriye final link mesajı.

### Telegram bot (`app/api/telegram/route.ts` veya n8n içinde)
- Sana bildirim gönderir (yeni sipariş, yeni RSVP özeti).
- `/onayla {slug}` veya inline "Ödeme Alındı" butonu → ilgili order'ı `paid`, invitation'ı `published` yapar, müşteriye otomatik "Davetiyeniz yayında: {link}" mesajı atar.
- `/rsvp {slug}` → o davetiyenin katılım listesini özetler.

### Google Form alanları (müşteriden toplanacak — forma birebir bunları koy)
Damat adı, Gelin adı, görünen sıra; Damat anne-baba, Gelin anne-baba; Davetiye türü (düğün/nişan/kına…); Ana tarih + saat; (varsa) Kına/Nişan tarih+saat; Her merasim için mekan adı + adres + Google Maps linki; Çift fotoğrafı/foto'ları (dosya yükleme); Müzik tercihi; "Bizim hikayemiz" metni; Tema seçimi (Altın Gece / Yıldız Tozu / Zarif Çiçek); RSVP açık mı + son tarih; Tercih edilen link adı (slug); Paket (Sade/Premium/VIP); İletişim (telefon/Telegram).

### Ödeme akışı (Telegram DM + IBAN — manuel onay)
- Otomatik tahsilat YOK; müşteri IBAN'a havale yapıp dekontu Telegram'dan gönderir.
- Sen "Ödeme Alındı" butonuna basana kadar davetiye `preview` (filigranlı) kalır.
- İleride Shopier/iyzico entegrasyonu için `orders` tablosunu ve `/api/orders`'ı buna uygun soyutla (provider alanı ekleyebilirsin).

### Env değişkenleri (`.env.local` + `.env.example`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_SECRET=
TELEGRAM_BOT_TOKEN=
TELEGRAM_ADMIN_CHAT_ID=
NEXT_PUBLIC_SITE_URL=https://davetimhazir.xyz
```

### Yapım sırası (bu sırayla ilerle, her adımda çalışır halde bırak)
1. Next.js + TypeScript + Supabase client kurulumu; mevcut statik landing'i `/` olarak çalıştır (CSS birebir).
2. SQL migration'ı uygula, RLS politikalarını ekle, 3 örnek `invitations` satırı seed'le (mevcut şablonların verisi).
3. `app/[slug]/page.tsx` — veriden davetiye render + tema + countdown. Seed verilerle 3 davetiye canlı çalışsın.
4. `/api/rsvp` + `/api/guestbook` + invitation.js bağlantısı (gerçek kayıt).
5. Ödeme kapısı (preview/published + filigran + noindex).
6. `/api/orders` + Telegram bildirim + `/onayla` ile yayına alma.
7. n8n workflow + `/api/webhooks/n8n` (Google Form → preview davetiye).
8. Vercel deploy + domain bağlama + env'ler.

### Kabul kriterleri
- [ ] `davetimhazir.xyz/elif-polat` Supabase verisinden render oluyor, 3 tema da çalışıyor.
- [ ] RSVP ve anı defteri gerçekten Supabase'e yazıyor; anı defteri liste anlık güncelleniyor.
- [ ] Ödenmemiş davetiye filigranlı önizleme + `noindex`; "Ödeme Alındı" sonrası temiz + yayında.
- [ ] Google Form doldurulunca n8n preview davetiye oluşturuyor ve Telegram'a bildirim düşüyor.
- [ ] Telegram'dan tek tıkla davetiye yayına alınıp müşteriye link gidiyor.
- [ ] Mevcut tasarımın görünümü hiçbir adımda bozulmadı.

Kodu küçük, gözden geçirilebilir commit'ler halinde yaz. Her adımda neyi neden yaptığını kısaca açıkla.

## PROMPT SONU ⬆️

---

### Notlar (sana, kullanıcıya)
- **Müzik telifi:** ticari kullanımda telifli şarkı riskli — telifsiz/lisanslı müzik kullan ya da müşteriden sorumluluğu devral.
- **KVKK:** misafir isim/foto'su topluyorsun; davetiyeye + landing'e kısa bir aydınlatma/gizlilik metni ekle (Cursor'a ayrıca yaptırabilirsin).
- **Fatura/vergi:** düzenli gelir olunca e-Arşiv fatura / şahıs şirketi gündeme gelir.
- **Ölçeklenince:** manuel IBAN onayı yorar — Shopier (dijital ürün için en pratik TR çözümü) entegrasyonunu 2. fazda ekle.
