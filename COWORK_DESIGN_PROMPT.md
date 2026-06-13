# Cowork — Claude Design Prompt (davetimhazir.xyz)

> Aşağıdaki **PROMPT** bloğunu olduğu gibi kopyalayıp Claude'a (Cowork modu) ver.
> Amaç: mevcut frontend'i sanatsal olarak üst seviyeye taşımak + marka kimliği + daha fazla davetiye teması + sosyal medya görselleri üretmek. Backend Cursor'da yapılıyor (bkz. `CURSOR_PROMPT.md`) — bu prompt **sadece tasarım/görsel** odaklıdır.

---

## PROMPT (Claude Cowork'e yapıştır) ⬇️

Sen kıdemli bir marka & web tasarımcısısın. **davetimhazir.xyz** adlı dijital davetiye işi için görsel kimliği ve frontend'i Awwwards/Dribbble seviyesine taşıyacaksın. Ürün: çiftlerin düğün/nişan/kına/söz davetiyelerini dakikalar içinde kişiye özel dijital davetiyeye çeviren bir servis. Hedef: **ilk saniyede dikkat çeken, "vay" dedirten, mobilde kusursuz** bir deneyim.

### Bağlam
- Bu projede zaten statik bir frontend var: `index.html` (landing), `css/style.css`, `js/main.js`, `templates/` (3 davetiye teması + galeri), `templates/invitation.css`, `templates/invitation.js`. Palet: ivory + altın; fontlar: Cormorant Garamond + Jost.
- Bunu **referans/başlangıç** al; tasarımı koru ama belirgin şekilde yukarı çek. Teknik yığın değişmesin: temiz, bağımlılıksız **HTML/CSS/JS** üret (vanilla). Davetiye şablonları **veri-odaklı** kalsın (her bölüm sonradan veriyle beslenecek), bu yüzden içerik ile yapı ayrık olsun.
- Eğer projeyi göremiyorsan, aşağıdaki yön ve teslimatlarla sıfırdan üret.

### Marka kimliği (oluştur/rafine et)
- **İsim:** "davetim hazır" — küçük harf, samimi, zarif.
- **Konum:** "Sevdiklerini en zarif haliyle, dakikalar içinde davet et." Premium ama erişilebilir; matbaa/kargo derdine modern alternatif.
- **Ton:** sıcak, zarif, modern, az-ve-öz. Abartısız lüks.
- **Hedef kitle:** 22–40 yaş, düğün/nişan/kına planlayan çiftler ve aileleri; Instagram + WhatsApp ağırlıklı, Türkiye.
- **Logo/wordmark:** ince, zarif bir kelime-markası + opsiyonel zarif bir işaret (mühür/zarf/monogram ya da tek çizgi illüstrasyon). Açık ve koyu zemin varyantları. SVG üret.

### Görsel yön
- **Tipografi:** display için zarif bir serif (Cormorant Garamond / Playfair / Fraunces gibi), gövde için temiz bir sans (Jost / Inter). Güçlü hiyerarşi, cömert boşluk, ince altın hairline ayraçlar.
- **Renk:** ivory/krem zeminli, sıcak mürekkep, altın aksan ana sistemi; davetiyelerde dramatik koyu temalar. Erişilebilir kontrast (WCAG AA).
- **Hareket:** ince ve zarif mikro-etkileşimler — scroll-reveal, kapak "Davetiyeyi Aç" geçişi, hover'da kart yükselmesi, canlı geri sayım, hafif paralaks/parıltı. Asla ucuz/abartılı değil. `prefers-reduced-motion`'a saygı.
- **His:** yüksek kaliteli düğün kırtasiyesi + modern SaaS landing karışımı. Dokunsal, premium, duygusal.

### Teslimatlar
1. **Landing sayfası (yeniden tasarım):** dönüşüm odaklı. Net değer önermesi, güçlü hero (canlı davetiye önizlemeli), sosyal kanıt, özellikler, "nasıl çalışır", şablon vitrini, fiyatlar, SSS, güçlü CTA. İlk ekran dikkat çekmeli.
2. **Tasarım sistemi / stil rehberi:** `design-system.html` — renk token'ları, tipografi ölçeği, buton/kart/form bileşenleri, boşluk ve gölge ölçeği, ikon seti. CSS değişkenleriyle.
3. **Etkinlik türlerine göre davetiye temaları** — aşağıdaki *"Davetiye Türleri & Temalar"* bölümündeki **8 etkinlik türünü** kapsa (düğün, nişan/söz, kına, sünnet, baby shower, doğum günü, açılış/kurumsal, + esnek ekstralar). Her tür için en az bir tema; toplam **en az 8 çalışan davetiye şablonu**. Hepsi ortak `invitation.css`/`invitation.js`'i paylaşsın, tema bir gövde class'ıyla değişsin. Palet ve motifler için *"Renk Sistemi"* bölümünü uygula. Her tema şu bölümleri içersin (etkinliğe göre uyarlanmış): kapak+müzik, kahraman(lar) + canlı geri sayım, etkinlik/merasim kartları (çoklu), harita, katılım/RSVP, dijital anı/dilek defteri, hikaye/mesaj, alt navigasyon.
4. **Marka görselleri:** favicon, OpenGraph/sosyal paylaşım görseli (1200×630, davetiye türleri için varyantlar), Instagram post/story şablonları (tanıtım: "davetiyen 5 dakikada hazır"), WhatsApp paylaşım kartı. SVG/HTML olarak üret; mümkünse PNG'ye de aktar.
5. **Hareket & mikro-etkileşim notu:** `MOTION.md` — hangi öğe nasıl animasyon alır, süre/easing değerleri.

### Renk sistemi — psikoloji & kalite algısı
İnsan, rengi bilinçaltında "kalite/güven/değer" sinyali olarak okur. Premium algı için ilkeler:

- **Kısıtlılık = lüks.** 2–3 ana renk + 1 metalik aksan. Çok renk ucuz görünür. **60-30-10** dengesi (60 zemin, 30 ikincil, 10 aksan).
- **Koyu zemin + metalik aksan** (siyah/antrasit/gece laciverti üstüne altın/şampanya/rose gold) → dışlayıcı, prestijli, "özel davet edilmiş" hissi.
- **Kırık beyaz > saf beyaz.** Ivory/krem sıcaklık ve "pahalı kâğıt" dokusu verir; saf beyaz steril/ucuz durur.
- **Doygunluğu düşür.** Mat, tozlu (dusty) tonlar sofistike; parlak/neon yüksek doygunluk dikkat çeker ama ucuzlaştırır (yalnız genç/eğlence temalarında serbest).
- **Mücevher tonları** (zümrüt, safir, bordo, mor) → zenginlik, köklülük, miras.
- **Metalin sıcaklığı duygu taşır:** altın = sıcak/davetkâr/geleneksel · platin-gümüş = modern/serin/kurumsal · rose gold = romantik/feminen/güncel.
- **Yüksek kontrast = hem premium hem okunur** (WCAG AA). Renk sıcaklığı duyguyu taşır: sıcak (terracotta/şeftali/altın) → yakınlık/kutlama; soğuk (lacivert/adaçayı/lavanta) → sakinlik/güven; pastel/düşük doygunluk → şefkat/masumiyet.

**Kaliteyi çeken hazır kombinasyonlar (hex + neden):**
| Kombinasyon | Hex | Psikoloji / Kullanım |
|---|---|---|
| Siyah + Altın | `#0E0D10` / `#C9A96A` | Zamansız lüks, gece, prestij. Düğün/davetin altın standardı. |
| Ivory + Antrasit + Altın | `#FAF7F2` / `#1C1813` / `#B8945F` | Sıcak premium, el yapımı kırtasiye. **Markanın ana sistemi.** |
| Gece Laciverti + Şampanya | `#0B1A33` / `#E7D3A1` | Şık, yıldızlı, romantik-modern. |
| Zümrüt + Altın | `#0E3B2E` / `#C9A96A` | Köklü, bereketli; kına & geleneksel için güçlü. |
| Bordo + Krem + Altın | `#5A1A2B` / `#F3E9DC` / `#B8945F` | Soylu, sıcak, klasik; sünnet/kına. |
| Mermer Beyaz + Rose Gold | `#F4F1EC` / `#B76E79` | Modern lüks, feminen, Instagram dostu. |
| Tozlu Gül + Adaçayı | `#D9A7A0` / `#9CA891` | Yumuşak, romantik, doğal (boho, baby shower). |

Marka ana sistemi: **Ivory + Antrasit + Altın**. Etkinlik temaları bu çekirdekten türesin; tutarlılık güveni, varyasyon canlılığı verir.

### Davetiye türleri & temalar (detaylı)
Her tür için: *his/psikoloji → tema → palet (hex) → tipografi → motif → kopya tonu → hareket aksanı.*

1. **Düğün** — sonsuzluk, zarafet, görkem.
   - Temalar: **Altın Gece** (`#0E0D10`/`#C9A96A`), **Yıldız Tozu** (`#0B1A33`/`#E7D3A1`), **Zarif Çiçek** (`#F7EEE9`/`#B07A6F`), **Mermer & Altın** (`#F4F1EC`/`#B8945F`).
   - Tipografi: zarif yüksek-kontrast serif. Motif: ince botanik, monogram, mum, halka, tezhip kenarlık. Kopya: zarif, duygusal. Hareket: kapak açılışı, geri sayım, hafif parıltı.
2. **Nişan / Söz** — başlangıç, umut, içtenlik.
   - Tema: **Şampanya & Krem** (`#F3E9DC`/`#C9A96A`/`#B76E79`). Daha açık, hafif, samimi. Motif: tek yüzük, fiyonk, küçük çiçek. Kopya: sıcak, sade ("Söz veriyoruz").
3. **Kına Gecesi** — gelenek, sıcaklık, coşku, bereket.
   - Tema: **Zümrüt Kına** (`#0E3B2E`/`#C9A96A`/ bordo aksan `#7A2031`) veya modern **Siyah-Altın**. Motif: kına eli/hamsa, gül, mum, tef, tezhip. Kopya: folklorik-sıcak ("Kınan kutlu olsun"). Hareket: mum ışığı titreşimi, altın toz.
4. **Sünnet** — erkek çocuk, kutlama, gurur, "prens" havası.
   - Tema: **Prens Lacivert** (`#10234A`/`#D4AF37`/`#FFFFFF`) veya **Osmanlı Bordo** (`#5A1A2B`/`#D4AF37`). Motif: hilal-yıldız, taç, tuğra/tezhip, at. Kopya: neşeli ama asil, "Maşallah" vurgusu. Hareket: yıldız parıltısı, kurdele.
5. **Baby Shower / Bebek** — masumiyet, şefkat, yumuşaklık.
   - Temalar (düşük doygunluk pastel): **Nötr** (adaçayı `#9CA891` + şeftali `#F3C9B0` + krem), **Kız** (tozlu pembe `#E7B7BE` + altın), **Erkek** (puslu mavi `#A9C2D9` + krem). Motif: bulut, ay-yıldız, balon, papatya, zarif ayıcık (kitsch değil). Kopya: şefkatli, sıcak. **Cinsiyet sürprizi (gender reveal)** varyantı: tıklayınca renk açığa çıkan animasyon.
6. **Doğum Günü** — kutlama, enerji, kişilik. İki kol:
   - (a) **Çocuk:** neşeli ama dengeli — pastel + altın, konfeti. (b) **Milestone/Yetişkin:** **Şık Parti** koyu `#141118` + neon/altın gradient ya da siyah-altın. Motif: konfeti, mum, yıldız, balon. Kopya: enerjik. Hareket: konfeti patlaması, mum.
7. **Açılış / Kurumsal** — güven, prestij, profesyonellik, bereket.
   - Tema: **Antrasit & Altın Kurdele** (`#1C1B1F`/`#C9A96A`) veya **Lacivert & Platin** (`#0B1A33`/`#D8DCE2`); müşteri marka rengine uyarlanır. Motif: kurdele/makas, ince çizgi, mühürlü logo alanı, geometrik. Kopya: resmî ama davetkâr; "katılım/teyit", program akışı, harita, otopark notu. RSVP → kurumsal teyit formu.
8. **Esnek ekstralar** (aynı sistemden türet): **Mevlüt** (yeşil-altın, sakin), **Mezuniyet** (lacivert-altın, kep motifi), **Yıldönümü** (gül-altın). Bunları opsiyonel tema olarak bırak.

### Logo sistemi (detaylı)
- **Kelime-markası:** `davetim hazır` — **küçük harf** (samimiyet/ulaşılabilirlik). "davetim" antrasit/normal, "hazır" altın veya medium-italic; ya da sonundaki **"." noktası altın aksan**. Hafif harf aralığı. Tipografi: zarif yüksek-kontrast serif (Cormorant/Fraunces) **veya** yumuşak geometrik sans — iki yön de sun.
- **İşaret (opsiyonel — 4 yön öner, SVG):**
  1. **Mühür / wax seal** — daire içinde `dh` monogram; geleneksel davetiye mührü → *güven, zanaat, resmiyet.*
  2. **Açılan zarf** — tek hat çizgisiyle açılan zarf + ince kalp/çizgi → *davet, sıcaklık.*
  3. **Monogram `dh`** — iç içe ince serif → *minimal, modern.*
  4. **Tek çizgi botanik** — zarif dal/çiçek → *düğün kırtasiyesi zarafeti.*
- **Renk varyantları:** koyu zemin (ivory + altın), açık zemin (antrasit + altın), tek renk (yalnız siyah / yalnız beyaz), **favicon** (sadece işaret ya da `dh` — küçükte okunur).
- **Kullanım kuralları:** logo yüksekliği kadar minimum boşluk; minimum boyut; yasak kullanımlar (gölge, eğme, oransız renk, kalabalık zemin). Açık & koyu temalı sürümlerin ikisini de teslim et.
- **Psikolojik gerekçe:** mühür/serif = miras + güven; küçük harf = samimiyet; altın aksan = premium; az öğe = kalite. Logoyu marka ana paletiyle (Ivory + Antrasit + Altın) kur.

### Kısıtlar
- **Dil:** tüm metinler Türkçe, akıcı ve duygusal kopya (sıkıcı/jenerik değil).
- **Mobil öncelikli & responsive:** davetiyeler telefon ekranı için tasarlanmış; landing her boyutta kusursuz.
- **Performans:** hızlı yüklensin; ağır kütüphane yok, sadece Google Fonts. Görselleri optimize et / SVG tercih et.
- **Erişilebilirlik:** semantik HTML, odak halkaları, alt metinler, AA kontrast, reduced-motion.
- **Backend uyumu:** davetiye şablonlarında içerik/yapı ayrık olsun ki Next.js+Supabase backend (Cursor tarafı) veriyle besleyebilsin; gerçek müşteri fotoğrafları için zarif placeholder bırak.

### Çalışma yöntemi (Cowork)
- Her teslimatı dosya olarak üret ve önizle. Önce **3 yön (moodboard/stil) öner**, ben birini seçeyim, sonra tüm sistemi o yönde uygula.
- Küçük, gözden geçirilebilir adımlarla ilerle; her adımda neyi neden yaptığını kısaca açıkla ve önizleme göster.

### Kabul kriterleri
- [ ] Landing ilk ekranda dikkat çekiyor, mobilde kusursuz, net CTA.
- [ ] 8 etkinlik türünün her biri için en az bir çalışan davetiye teması (toplam ≥8), hepsi ortak sistemi paylaşıyor.
- [ ] Renk sistemi psikolojik gerekçeleriyle belgelendi; her tema doğru paletle eşleşti.
- [ ] Tutarlı tasarım sistemi (token + bileşenler) belgelendi.
- [ ] Logo + favicon + OG + sosyal medya şablonları teslim edildi.
- [ ] Türkçe kopya akıcı ve duygusal; erişilebilirlik ve performans gözetildi.
- [ ] Davetiye şablonları veriyle beslenebilir (yapı/içerik ayrık).

İlk olarak: 3 stil yönü öner (her biri için kısa moodboard + 1 hero eskizi). Seçimimi bekle, sonra tüm sistemi uygula.

## PROMPT SONU ⬆️

---

### Not (sana)
- Cowork'te önce 3 yön önerisi isteyip birini seçmen, tutarlı bir sonuç verir.
- Çıkan tasarımları bu repodaki dosyaların üstüne uygulatabilir ya da ayrı `design/` klasöründe toplatabilirsin; sonra Cursor backend'i bu tasarımı tüketir.
