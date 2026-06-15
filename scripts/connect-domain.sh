#!/usr/bin/env bash
# Cloudflare domain bağlantısı — DNS kayıtlarını sil + Worker custom domain ekle
# Kullanım: CLOUDFLARE_API_TOKEN=xxx ./scripts/connect-domain.sh

set -euo pipefail

ZONE_ID="f3534524a9f1d2cfd0c53628b5ff48d8"
ACCOUNT_ID="34a23d3ebcdbe3bd7072316170e0923a"
WORKER="davetimhazirxyz"
DOMAIN="davetimhazir.xyz"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "CLOUDFLARE_API_TOKEN gerekli."
  echo "Oluştur: https://dash.cloudflare.com/profile/api-tokens"
  echo "Template: Edit zone DNS + Workers Scripts Edit"
  exit 1
fi

AUTH=(-H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" -H "Content-Type: application/json")
API="https://api.cloudflare.com/client/v4"

echo "→ DNS kayıtları listeleniyor..."
records=$(curl -sf "${AUTH[@]}" "$API/zones/$ZONE_ID/dns_records")
echo "$records" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if not d.get('success'):
    print('DNS list failed:', d.get('errors')); sys.exit(1)
for r in d['result']:
    if r['type'] in ('A','CNAME') and ('davetimhazir.xyz' in r['name']):
        print(r['id'], r['type'], r['name'], r['content'])
" | while read -r id type name content; do
  echo "→ Siliniyor: $type $name → $content"
  curl -sf -X DELETE "${AUTH[@]}" "$API/zones/$ZONE_ID/dns_records/$id" >/dev/null
done

for host in "$DOMAIN" "www.$DOMAIN"; do
  echo "→ Custom domain ekleniyor: $host"
  curl -sf -X PUT "${AUTH[@]}" \
    "$API/accounts/$ACCOUNT_ID/workers/scripts/$WORKER/domains/records" \
    -d "{\"hostname\":\"$host\",\"zone_id\":\"$ZONE_ID\",\"service\":\"$WORKER\",\"environment\":\"production\"}" \
    | python3 -c "import sys,json;d=json.load(sys.stdin); print('  OK' if d.get('success') else d.get('errors'))"
done

echo "→ Deploy..."
cd "$(dirname "$0")/.."
npx wrangler deploy

echo "✅ Bitti. NS değişmediyse Hostinger'da jean.ns.cloudflare.com + miguel.ns.cloudflare.com ayarla."
