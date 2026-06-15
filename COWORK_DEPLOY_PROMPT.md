# COWORK DEPLOY PROMPT — davetimhazir.com
**Hedef:** Siteyi GitHub repo'sundan **Cloudflare Pages** ile production'a almak, custom domain + SSL kurmak ve domain'in **nameserver'larını Hostinger panelinden Cloudflare'e taşımak.**
**Kullanım:** Aşağıdaki bloğun tamamını yeni bir Cowork/agent oturumuna yapıştır. Agent'ın tarayıcı (Claude in Chrome eklentisi), `bash`, `git` ve `dig`/`curl` erişimi olmalı; Cloudflare/Hostinger/GitHub'a **kullanıcı login olur**.

---

## ROL
Sen kıdemli bir DevOps / release engineer agent'ısın. Aşağıdaki görevi adım adım, her adımı doğrulayarak (`dig`/`curl` ile teyit ederek) tamamla. Belirsizlik veya hata olursa dur, durumu raporla, devam etmeden önce kullanıcıdan teyit al.

## BAĞLAM (doğrulanmış gerçekler)
- **Repo:** https://github.com/mfos3c/davetimhazir.com — branch `main`, **statik site (build YOK)**.
- **Yapı:** Kökte `index.html`; ayrıca `css/`, `js/`, `assets/`, `templates/`. Build output dizini = **kök (`/`)**.
- **Domain:** `davetimhazir.com` — registrar **Hostinger**.
- **Mevcut DNS:** NS = `helios.dns-parking.com` + `aster.dns-parking.com` (Hostinger parking). Apex `A` = `2.57.91.91` (park sayfası). `www` → apex CNAME.
- **Hedef mimari:** Cloudflare Pages (hosting) + Cloudflare DNS (zone) + Hostinger (yalnızca registrar/nameserver).

## GÜVENLİK / ONAY KURALLARI
- **Parola girme.** Cloudflare, GitHub ve Hostinger login işlemlerini **kullanıcı** yapar; sen yönlendirir ve beklersin.
- **OAuth yetkilendirme** (Cloudflare ↔ GitHub) ve **nameserver değişikliği** gibi kalıcı/etkisi büyük adımlarda, işlemden ÖNCE kullanıcıdan **açık onay** al; **eski → yeni** değerleri ekranda göster.
- Panelden okunan değerleri (atanan nameserver'lar, `*.pages.dev` adresi) **tahmin etme** — ekrandan oku, kullanıcıya teyit ettir.
- Hostinger'da hiçbir kaydı **silme**; yalnızca nameserver alanını değiştir.
- Web linklerini doğrudan tıklama yerine bilinen panel URL'lerine (dash.cloudflare.com, hpanel.hostinger.com, github.com) git.

## RUNTIME PLACEHOLDER'LAR (çalışırken doldur)
- `<CF_NS_1>`, `<CF_NS_2>` — Cloudflare'e zone eklenince atanan 2 nameserver.
- `<PAGES_URL>` — ilk deploy sonrası verilen `*.pages.dev` adresi (örn. `davetimhazir-com.pages.dev`).

---

## ADIMLAR

### 0) GitHub repo'yu doğrula
- `git ls-remote https://github.com/mfos3c/davetimhazir.com main` ile `main`in remote'ta olduğunu doğrula.
- Yoksa kullanıcıdan repo kökünde `git push -u origin main` çalıştırmasını iste.
- Repo private olsa da sorun değil; Cloudflare GitHub App ile erişecek.

### 1) Cloudflare'e domain (zone) ekle
- `dash.cloudflare.com` → **(kullanıcı login)** → **Add a site** → `davetimhazir.com` → **Free** plan.
- Cloudflare mevcut DNS'i tarar. Taranan **parking A kaydını (`2.57.91.91`) ve gereksiz parking kayıtlarını sil** — apex'i Pages'e bağlayacağız.
- "Complete nameserver setup" ekranındaki 2 nameserver'ı oku → `<CF_NS_1>`, `<CF_NS_2>` olarak kaydet ve kullanıcıya göster.

### 2) Hostinger'da nameserver'ları değiştir  ← *"DNS bilgileri Hostinger'den konfigüre et"*
- `hpanel.hostinger.com` → **(kullanıcı login)** → **Domains** → `davetimhazir.com` → **DNS / Nameservers** → **Change nameservers** → **Use custom nameservers**.
- **ESKİ:** `helios.dns-parking.com` , `aster.dns-parking.com`
  **YENİ:** `<CF_NS_1>` , `<CF_NS_2>`
- Değişiklikten önce **kullanıcı onayı al**, sonra kaydet. (Yayılma genelde dakikalar – birkaç saat.)

### 3) Cloudflare zone "Active" olsun
- Cloudflare'de zone **Active** olana kadar bekle.
- Doğrula: `dig +short NS davetimhazir.com` → çıktı `*.ns.cloudflare.com` göstermeli.

### 4) Cloudflare Pages projesi oluştur (GitHub'dan)
- Cloudflare → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
- GitHub'ı **yetkilendir (OAuth — kullanıcı onayı)**, repo: `mfos3c/davetimhazir.com`.
- Build ayarları:
  - **Production branch:** `main`
  - **Framework preset:** `None`
  - **Build command:** *(boş bırak)*
  - **Build output directory:** `/`  (kök)
- **Save and Deploy.** Bitince `<PAGES_URL>` adresini oku, aç ve sitenin çalıştığını doğrula.

### 5) Custom domain bağla
- Pages projesi → **Custom domains** → **Set up a custom domain**:
  - `davetimhazir.com` → zone Cloudflare'de olduğu için CNAME (flatten) **otomatik** oluşur; **Active** olana kadar bekle.
  - `www.davetimhazir.com` → otomatik CNAME → proje.
- **Kanonik yön (www → apex, 301):** Cloudflare → **Rules → Redirect Rules** → yeni kural:
  - Eşleşme: hostname = `www.davetimhazir.com`
  - Hedef: `https://davetimhazir.com/${http.request.uri.path}` , **301** kalıcı.

### 6) SSL / HTTPS
- **SSL/TLS → Overview → mode: `Full`.**
- **Edge Certificates:** `Always Use HTTPS` = ON, `Automatic HTTPS Rewrites` = ON, `Minimum TLS Version` = 1.2.
- Universal SSL otomatik gelir; sertifika **Active** olana kadar bekle.

### 7) (Opsiyonel ama önerilir) Güvenlik header'ları
- Repo köküne `_headers` dosyası ekle (Cloudflare Pages destekler):
  ```
  /*
    Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
    X-Content-Type-Options: nosniff
    X-Frame-Options: DENY
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: geolocation=(), microphone=(), camera=()
  ```
- `git add _headers && git commit -m "add security headers" && git push` → Pages **otomatik** yeniden deploy eder.

### 8) DOĞRULAMA (acceptance testleri)
- `dig +short NS davetimhazir.com` → cloudflare nameserver'ları.
- `curl -sI https://davetimhazir.com` → `HTTP/2 200` + `server: cloudflare`.
- `curl -sI https://www.davetimhazir.com` → `301` → apex.
- `curl -sI http://davetimhazir.com` → `301`/`308` → https.
- Tarayıcıda aç: anasayfa, `templates/index.html`, CSS/JS, favicon, OG görselleri yüklensin; SSL kilidi geçerli.
- **CI testi:** küçük bir değişiklik push'la → Pages otomatik build/deploy etsin → canlıda görünsün.

## KABUL KRİTERLERİ
- `https://davetimhazir.com` Cloudflare üzerinden, **geçerli SSL** ile siteyi serve ediyor.
- `www → apex` ve `http → https` yönlendirmeleri çalışıyor.
- GitHub `main`'e **her push otomatik deploy** tetikliyor.
- Nameserver'lar Hostinger'da Cloudflare'e işaret ediyor; eski parking kayıtları temizlendi.

---

## EK — Alternatif mimari (GitHub Pages + Cloudflare DNS)
Hosting'i Cloudflare Pages yerine **GitHub Pages** yapmak istenirse (Cloudflare yalnızca DNS/CDN/SSL olarak önde durur):

1. GitHub repo → **Settings → Pages** → Source: **Deploy from branch** `main` `/ (root)`.
2. Repo köküne `CNAME` dosyası: tek satır `davetimhazir.com` → commit + push.
3. Cloudflare DNS (zone CF'de — yukarıdaki 1–3. adımlar aynen geçerli):
   - **Apex `A`** (4 kayıt): `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **Apex `AAAA`** (4 kayıt): `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - **`www` `CNAME`** → `mfos3c.github.io`
   - Proxy: turuncu bulut **açık** (Cloudflare CDN/SSL önde).
4. GitHub Pages → sertifika gelince **Enforce HTTPS** = ON. Cloudflare SSL mode: **Full**.

> Not: Apex domain'i Cloudflare Pages **veya** GitHub Pages'e bağlamanın temiz yolu, zone'u Cloudflare'e (nameserver) almaktır. Bu yüzden her iki mimaride de Hostinger'da yapılan tek işlem **nameserver'ı Cloudflare'e çevirmektir** — istek tam olarak bunu karşılar.
