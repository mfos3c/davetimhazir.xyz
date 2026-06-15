# INFRA — Raspberry Pi 5 + Cloudflare (davetimhazir.com)

Evdeki Raspberry Pi 5, n8n + ops panelini çalıştırır ve **Cloudflare Tunnel** ile mevcut Cloudflare hesabına bağlanır (port açma / sabit IP gerekmez). Yönetim arayüzleri **Cloudflare Access** ile yalnız sana açıktır. Veritabanı **Supabase (bulut)**'tadır; Pi sadece compute/otomasyon.

## Topoloji
```
Supabase (bulut) ── DB + Storage + RLS
      ▲ service_role (sadece Pi sunucu tarafı)
Raspberry Pi 5 (Docker Compose)
  ├─ n8n          :5678   davetiye üretim/WhatsApp/PDF/lifecycle
  ├─ dashboard    :3000   ops paneli (Next.js)
  ├─ gotenberg    :3000   HTML→PDF (yalnız iç ağ)
  └─ cloudflared          Cloudflare Tunnel (token ile)
Cloudflare (davetimhazir.com)
  ├─ panel.davetimhazir.com → dashboard   ┐ Cloudflare Access
  ├─ n8n.davetimhazir.com   → n8n         ┘ (sadece senin e-postan)
  ├─ *.davetimhazir.com     → davetiyeler (Vercel wildcard) *
  └─ davetimhazir.com       → pazarlama sitesi (Cloudflare Pages)
```
\* Davetiye Next.js app'ini Pi'de self-host etmek istersen onu da tunnel'a ekleyebilirsin; varsayılan öneri Vercel wildcard (bkz. `CURSOR_PROMPT.md`).

## 1. Pi hazırlık
- **Raspberry Pi OS 64-bit (Bookworm)**. Mümkünse SD kart yerine **USB SSD** (güvenilirlik/yedek).
- Güncelle + Docker kur:
  ```bash
  sudo apt update && sudo apt -y upgrade
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER     # yeniden giriş yap
  sudo apt -y install docker-compose-plugin
  ```
- Güvenlik: `sudo apt -y install unattended-upgrades`; SSH anahtar ile giriş; UFW ile sadece LAN/SSH (tunnel dışarı bağlandığı için gelen port açmana gerek yok).

## 2. Cloudflare Tunnel (dashboard-managed, token'lı)
1. Cloudflare **Zero Trust** paneli → **Networks → Tunnels → Create a tunnel** → *Cloudflared* → ad: `davetimhazir-pi` → **token'ı kopyala** (compose'da kullanacağız).
2. Aynı ekranda **Public hostnames** ekle:
   - `panel.davetimhazir.com` → Service: `HTTP` → `dashboard:3000`
   - `n8n.davetimhazir.com` → Service: `HTTP` → `n8n:5678`
   - (gotenberg'i **ekleme** — yalnız iç ağ.)
   DNS kayıtları otomatik oluşur (`*.cfargotunnel.com`'a CNAME). Not: `panel.` ve `n8n.` özel kayıtları, `*.davetimhazir.com` wildcard'ından **önceliklidir**, çakışmaz.

## 3. Cloudflare Access (yalnız sana açık)
Zero Trust → **Access → Applications → Add → Self-hosted**:
- Uygulama 1: domain `panel.davetimhazir.com`; Uygulama 2: `n8n.davetimhazir.com`.
- Her biri için **Policy:** Action `Allow`, Include → **Emails** → kendi e-postan (veya "Emails ending in" ile domainin). Login yöntemi: One-time PIN veya Google.
- Sonuç: bu adreslere giden herkes önce Cloudflare Access ekranından geçer; sadece sen girersin.

## 4. Docker Compose (Pi'de `~/davetimhazir/docker-compose.yml`)
```yaml
services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    environment:
      - N8N_HOST=n8n.davetimhazir.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.davetimhazir.com/
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - GENERIC_TIMEZONE=Europe/Istanbul
      - N8N_SECURE_COOKIE=true
    volumes: [ "n8n_data:/home/node/.n8n" ]

  dashboard:
    build: ./dashboard          # CURSOR/DASHBOARD_PROMPT ile üretilen Next.js app
    restart: unless-stopped
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - N8N_BASE_URL=https://n8n.davetimhazir.com
      - N8N_WEBHOOK_SECRET=${N8N_WEBHOOK_SECRET}
      - ACCESS_ALLOWED_EMAILS=${ACCESS_ALLOWED_EMAILS}
      - ROOT_DOMAIN=davetimhazir.com

  gotenberg:
    image: gotenberg/gotenberg:8
    restart: unless-stopped       # n8n PDF için http://gotenberg:3000 (iç ağ)

  cloudflared:
    image: cloudflare/cloudflared:latest
    restart: unless-stopped
    command: tunnel --no-autoupdate run
    environment: [ "TUNNEL_TOKEN=${TUNNEL_TOKEN}" ]
    depends_on: [ dashboard, n8n ]

volumes:
  n8n_data:
```
`~/davetimhazir/.env` (chmod 600):
```
TUNNEL_TOKEN=...                 # adım 2'deki token
N8N_ENCRYPTION_KEY=<rastgele-uzun>
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
N8N_WEBHOOK_SECRET=<rastgele>
ACCESS_ALLOWED_EMAILS=seninmail@ornek.com
```
Çalıştır: `docker compose up -d` → `docker compose logs -f cloudflared` (Tunnel "connected" olmalı).

## 5. Doğrulama
- `https://n8n.davetimhazir.com` → Access ekranı → giriş → n8n arayüzü.
- `https://panel.davetimhazir.com` → Access → ops paneli.
- Pi'yi yeniden başlat → `restart: unless-stopped` ile her şey otomatik kalkar.

## 6. Yedek & bakım
- **n8n:** `n8n_data` volume'ünü düzenli yedekle (`docker run --rm -v n8n_data:/d -v $PWD:/b alpine tar czf /b/n8n-$(date +%F).tgz /d`).
- **Supabase:** bulutta otomatik yedek; kritik tablolar için ayrıca haftalık SQL dump alabilirsin.
- **Güncelleme:** `docker compose pull && docker compose up -d`.
- **İzleme:** panelin "Sistem sağlığı" widget'ı n8n/tunnel/Pi metriklerini gösterir (bkz. `DASHBOARD_PROMPT.md`).

## Notlar
- Yönetim arayüzlerini **asla Access'siz** public etme.
- Gizli anahtarlar yalnız Pi `.env`'inde; repoya girmez (`.gitignore`'da `.env*`).
- Davetiye trafiği büyürse `*.davetimhazir.com`'u Vercel'de tutmak Pi'yi yormaz; Pi yalnız panel + n8n + PDF taşır.
