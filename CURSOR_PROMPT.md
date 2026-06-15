# Cursor Prompt — davetimhazir.com Backend

> Bu dosyadaki "PROMPT" bölümünü olduğu gibi kopyalayıp Cursor'a (Composer/Agent moduna) yapıştır.
> Frontend (landing + davetiye şablonları) bu repoda hazır; Cursor'un işi bunları **veri-odaklı, ödemeli, otomatik** bir ürüne çevirmek.
> İlgili dökümanlar: ops paneli için `DASHBOARD_PROMPT.md`, Raspberry Pi + Cloudflare kurulumu için `INFRA.md`.

---

## PROMPT (Cursor'a yapıştır) ⬇️

Bir dijital davetiye işinin (davetimhazir.com) backend'ini kuruyorum. Bu repoda zaten **statik bir frontend** var:

- `index.html` + `css/style.css` + `js/main.js` → pazarlama/landing sayfası
- `templates/index.html` → şablon galerisi
- `templates/*.html` (altin-gece, yildiz-tozu, zarif-cicek, nisan, kina, sunnet, bebek, dogumgunu, acilis) → davetiye temaları
- `templates/invitation.css` + `templates/invitation.js` → davetiyelerin ortak stil/davranışı (perde/balon/konfeti efektleri dahil). Bu dosyalar **tasarım referansıdır**; birebir görünümü ve efektleri koru.

`templates/invitation.js` içinde RSVP ve anı defteri submit'leri şu an **stub** (sadece `console.log`). `window.INVITE = { slug, theme }` global'i mevcut. Görünümü/efektleri bozmadan bunları gerçek backend'e bağla.

### İş modeli (kritik — mimariyi buna göre kur)
- Müşteri **WhatsApp**'tan iletişime geçer; ödemeyi **IBAN** ile yapar, **dekontu** WhatsApp'tan gönderir (manuel onay).
- Ödeme sonrası müşteriden **Google Form** ile etkinlik bilgileri alınır; **n8n** davetiyeyi müşterinin seçtiği temada üretir ve **WhatsApp**'tan gönderir.
- Her davetiye kendi **subdomain'inde** yayınlanır: `musteri.davetimhazir.com` (örn. `elifpolatalemdar.davetimhazir.com`).
- **Son kullanıcı / misafir LOGIN OLMAZ.** Sadece işletme sahibi (sen) ops panelinden yönetir (bkz. `DASHBOARD_PROMPT.md`).
- **Yaşam döngüsü:** davetiye, etkinlikten 7 gün sonra PDF olarak müşteriye gönderilip verisi silinir. **Silme manuel/panelden tetiklenir** (otomatik cron zorunlu değil; panel "süresi dolanları" işaretler).

### Neden Supabase (Firebase değil)
İlişkisel veri (customers/orders/invitations/rsvps/guestbook/payments) + raporlama + n8n'in kolay hedefi (otomatik REST + Postgres + service_role) + login olmaması → Supabase. Firestore'un tek artısı native TTL otomatik silmeydi; silme manuel olduğu için bu da gereksiz. Postgres SQL ile "süresi dolanı bul", gelir raporu, RSVP sayımı doğal.

### Hedef mimari
- **Framework:** Next.js 14 (App Router) + TypeScript. Mevcut statik tasarımı React bileşenlerine taşı; CSS'i ve efekt JS'ini birebir koru (global olarak import edebilirsin).
- **Veritabanı + Storage + RLS:** Supabase (Postgres + Storage). Auth yalnız ops paneli için (son kullanıcıya auth yok).
- **Routing (subdomain):** Davetiyeler `https://{slug}.davetimhazir.com`. Next.js **middleware** ile `host`'tan subdomain etiketini (=`slug`) çöz, `app/_invite/[slug]`'a rewrite et; Supabase'den SSR/ISR ile oku (yeniden build gerekmez). `www`/apex landing'e gider.
- **Hosting:** Next.js app için **Vercel** en kolay yol — `*.davetimhazir.com` **wildcard domain** + otomatik wildcard SSL. (Alternatif: Pi üzerinde self-host + Cloudflare Tunnel; bkz. `INFRA.md`.) Pazarlama sitesi apex `davetimhazir.com`'da kalabilir.
- **Otomasyon:** n8n (Raspberry Pi'de self-host) — Google Form → Supabase → WhatsApp. Workflow'u `automation/n8n-workflow.md`'ye JSON export + açıklama olarak yaz.
- **Teslim/bildirim:** WhatsApp (Cloud API veya 360dialog/Twilio). Sahibe bildirim WhatsApp veya Telegram olabilir; admin onayları **ops panelinden** yapılır.

### Veri modeli (Supabase SQL — `supabase/migrations/0001_init.sql`)
```sql
-- DAVETİYELER
create table invitations (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,            -- subdomain etiketi: {slug}.davetimhazir.com
  theme         text not null default 'altin',   -- altin|yildiz|cicek|nisan|kina|sunnet|bebek|dogumgunu|acilis
  status        text not null default 'draft',   -- draft | preview | published | archived
  type          text default 'dugun',            -- dugun|nisan|kina|sunnet|babyshower|dogumgunu|acilis
  title         text,                             -- görünen ana başlık (çift adı / çocuk adı / marka)
  subtitle      text, cover_eyebrow text default 'Davetlisiniz',
  parents       jsonb default '{}',               -- {bride_parents, groom_parents} vs serbest
  city          text,
  main_date     timestamptz,                      -- geri sayım hedefi (etkinlik başlangıcı)
  event_end_at  timestamptz,                      -- etkinlik bitişi (lifecycle için)
  delete_after  timestamptz,                      -- = event_end_at + 7 gün (panel işaretler)
  events        jsonb default '[]',               -- [{title,time,date,day,place,address,maps_query}]
  map_query     text,
  music_url     text,                             -- Storage public url
  photos        jsonb default '{}',               -- {main, gallery:[]}  → Storage: invitations/{slug}/...
  story_text    text, story_sign text,
  form_data     jsonb default '{}',               -- ham Google Form yanıtı (panelde göster)
  pdf_url       text,                             -- arşiv PDF'i
  rsvp_enabled  boolean default true,
  created_at    timestamptz default now()
);

-- RSVP (frontend: name, attending, guests, slug)
create table rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete cascade,
  name text not null, attending text not null, guests text,
  created_at timestamptz default now()
);

-- ANI DEFTERİ (frontend: name, message, slug)
create table guestbook (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete cascade,
  name text not null, message text not null,
  approved boolean default true,
  created_at timestamptz default now()
);

-- SİPARİŞLER (WhatsApp + IBAN)
create table orders (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references invitations(id) on delete set null,
  slug text,
  plan text,                                       -- Sade | Premium | VIP
  amount numeric,                                  -- toplam anlaşılan tutar
  stage text not null default 'yeni_talep',        -- kanban aşaması (panel)
  status text not null default 'pending',          -- pending | paid | cancelled
  customer_name text, customer_contact text,       -- WhatsApp no
  notes text,
  created_at timestamptz default now(), paid_at timestamptz
);

-- ÖDEMELER / DEKONT (kapora + bakiye desteği)
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  amount numeric not null,
  type text default 'tam',                         -- kapora | bakiye | tam
  dekont_url text,                                 -- Storage: dekontlar/{order_id}/...
  status text default 'received',                  -- received | confirmed | refunded
  received_at timestamptz default now()
);

-- AKTİVİTE / AUDIT (timeline)
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  action text not null, actor text default 'system', meta jsonb,
  created_at timestamptz default now()
);

-- GÖRÜNTÜLENME ANALİTİĞİ (basit)
create table invitation_views (
  id bigint generated always as identity primary key,
  slug text, ts timestamptz default now(), ua text
);
```

### RLS politikaları (login YOK)
- `invitations`: `status in ('published','preview')` herkese **okunur**; yazma yalnız `service_role`.
- `rsvps`, `guestbook`: anon **insert** edebilir (rate limit + honeypot); okuma ilgili davetiyeye ait + `service_role`.
- `orders`, `payments`, `activity_log`: yalnız `service_role` (ops paneli sunucu tarafından erişir).
- `invitation_views`: anon **insert**; okuma `service_role`.

### Davetiye render (`app/_invite/[slug]/page.tsx`, middleware ile subdomain rewrite)
- Supabase'den slug ile invitation çek; yoksa 404.
- `theme` alanına göre `theme-{theme}` class'ı uygula (CSS hazır), `invitation.js` efektleri çalışsın.
- Metin/tarih/mekan/foto'ları veriden bas; `events` jsonb'sini map'leyerek kartları üret; `main_date`'i countdown `data-target`'ına ISO ver.
- **Ödeme kapısı:** `status='published'` değilse **filigranlı önizleme** + `noindex`. `published` olunca temiz sürüm.
- Her açılışta `invitation_views`'a kayıt (fire-and-forget) — analitik için.
- `status='archived'` ise nazik "bu davetiye arşivlendi" sayfası.
- SEO/OG: published davetiyeler için OpenGraph (başlık + tarih + kapak).

### API route'ları (`app/api/...`)
1. `POST /api/rsvp` — `{ slug, name, attending, guests }` → insert. (`invitation.js` stub'ını bağla.)
2. `POST /api/guestbook` — `{ slug, name, message }` → insert + güncel liste; küfür/spam filtresi + rate limit.
3. `GET /api/guestbook?slug=` — onaylı mesajlar.
4. `POST /api/webhooks/n8n` — n8n'den davetiye verisi → `invitations` (status='preview'), gizli token korumalı.
5. (Panel API'leri `DASHBOARD_PROMPT.md`'de.)

### Otomasyon — n8n (`automation/n8n-workflow.md`)
1. **Trigger:** Google Sheets "Row Added" (Form yanıtları) veya Form webhook.
2. Normalize + eksik kontrolü; `form_data` ham yanıtı sakla.
3. **Slug üret:** isim → kebab-case subdomain etiketi; çakışmada `-2`.
4. **Foto işle:** Form'un Drive dosyalarını → Supabase Storage `invitations/{slug}/`.
5. Supabase'e `invitations` insert (status='preview') — `POST /api/webhooks/n8n`.
6. Sahibe bildirim (WhatsApp/Telegram) + ops panelinde kart oluşur.
7. Ödeme panelden onaylanınca status='published' → müşteriye WhatsApp'tan davetiye linki.
8. **Lifecycle (panel-tetiklemeli):** `delete_after <= now()` olan davetiye için HTML→PDF render → WhatsApp'tan PDF → DB satırı + `invitations/{slug}/` Storage prefiksini sil → `orders`'ta arşiv kaydı.

### Google Form alanları
Etkinlik türü; ana başlık (çift/çocuk/marka adı); (varsa) aile isimleri; ana tarih+saat; ek merasim(ler) tarih+saat; her merasim için mekan adı+adres+Maps linki; foto(lar) yükleme; müzik tercihi; hikaye/mesaj metni; tema seçimi; RSVP açık mı + son tarih; tercih edilen subdomain (slug); paket; WhatsApp iletişim.

### Ödeme akışı (IBAN — manuel onay)
- Otomatik tahsilat yok; müşteri IBAN'a yatırır, dekontu WhatsApp'tan gönderir → panelden `payments`'a yüklenir, order `paid` yapılır, davetiye `published`.
- Kapora + bakiye desteği `payments.type` ile. İleride Shopier/iyzico için `payments`'a `provider` alanı eklenebilir.

### Env değişkenleri (`.env.local` + `.env.example`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_SECRET=
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
NEXT_PUBLIC_SITE_URL=https://davetimhazir.com
NEXT_PUBLIC_ROOT_DOMAIN=davetimhazir.com
```

### Yapım sırası
1. Next.js + TS + Supabase client; statik landing'i `/` olarak çalıştır (CSS/efekt birebir).
2. SQL migration + RLS; her temadan 1 örnek `invitations` seed'i.
3. Middleware (subdomain→slug) + `app/_invite/[slug]/page.tsx` render; seed davetiyeler `{slug}.davetimhazir.com`'da çalışsın (local'de `*.localhost` veya `lvh.me`).
4. `/api/rsvp` + `/api/guestbook` + `invitation.js` bağlantısı.
5. Ödeme kapısı (preview/published + filigran + noindex) + `invitation_views`.
6. `/api/webhooks/n8n` + n8n workflow (Google Form → preview davetiye).
7. WhatsApp teslim + lifecycle (PDF + sil) akışı.
8. Vercel deploy + `*.davetimhazir.com` wildcard domain + env'ler.

### Kabul kriterleri
- [ ] `elifpolat.davetimhazir.com` Supabase verisinden render oluyor; tüm temalar çalışıyor (efektler dahil).
- [ ] RSVP ve anı defteri Supabase'e yazıyor; anı defteri anlık güncelleniyor.
- [ ] Ödenmemiş davetiye filigranlı + `noindex`; ödeme onayı sonrası temiz + published.
- [ ] Google Form → n8n preview davetiye + panelde kart + sahibe bildirim.
- [ ] Süresi dolan davetiye için PDF + WhatsApp + silme akışı çalışıyor (panelden tetiklenir).
- [ ] Mevcut tasarım/efektler hiçbir adımda bozulmadı.

Kodu küçük, gözden geçirilebilir commit'ler halinde yaz; her adımda neyi neden yaptığını kısaca açıkla.

## PROMPT SONU ⬆️

---

### Notlar (sana, kullanıcıya)
- **Ops paneli & altyapı:** dashboard için `DASHBOARD_PROMPT.md`, Raspberry Pi 5 + Cloudflare Tunnel/Access kurulumu için `INFRA.md`.
- **Müzik telifi:** ticari kullanımda telifsiz/lisanslı müzik kullan.
- **KVKK:** misafir isim/foto + dekont topluyorsun; davetiye + landing'e aydınlatma metni ekle; veriyi etkinlik sonrası silmen (lifecycle) veri minimizasyonu için olumlu.
- **Fatura/vergi:** şahıs şirketi + (uygunsa) genç girişimci istisnası; düzenli gelirde e-Arşiv fatura.
- **Ödeme:** kişisel IBAN'ı kalıcı yapma; şirket + link-ile-ödeme (iyzico/Shopier) en sağlıklısı.
