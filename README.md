# Chypervitalize – javított projekt

## Indítás
Node.js 24 ajánlott (minimum 22.13).

```sh
npm ci
npm start
```

Helyi cím: http://localhost:3000. A szerver alapértelmezésben a data mappába ment; éles tárhelyen tartós DATA_DIR szükséges. A környezeti változókat a tárhely beállításaiban add meg.

## Környezeti változók
- PORT: alapértelmezés 3000.
- DATA_DIR: tartós, írható adatkönyvtár.
- NODE_ENV=production: HTTPS mellett Secure munkamenet-cookie.
- APP_URL=https://chypervitalize.com: fizetési visszatérési cím.
- STRIPE_MODE=test vagy live: alapértelmezésben test. A kulcsoknak, webhookoknak és fizetési objektumoknak egyezniük kell ezzel a móddal. A korábbi tesztvásárlások és tesztkedvezmények éles módban nem biztosítanak hozzáférést vagy kedvezményt; a fiókok és CV-piszkozatok megmaradnak.
- STRIPE_SECRET_KEY és STRIPE_WEBHOOK_SECRET: az adott módhoz tartozó korlátozott Stripe API-kulcs és webhook-aláíró kulcs. Csak a tárhely titkos környezeti változóiba kerülhetnek, forráskódba vagy naplóba nem.
- Éles módban STRIPE_ACCOUNT_ID, STRIPE_PRICE_MONTHLY és STRIPE_PRICE_INTRO is szükséges. Induláskor ellenőrizzük a fiók fizetési jogosultságát és az aktív USD árak összegét/típusát. Hibás konfigurációnál a szerkesztő elérhető marad, de fizetés nem indítható.
- Az éles első heti ajánlat a havi előfizetés 7 napos halasztott indulásából és egy azonnali 2,99 USD-os egyszeri díjból áll; ezt a Checkout munkamenet hozza létre. Az éles katalógus két ára önmagában nem kapcsolja össze ezt a folyamatot.
- A webhook kötelező eseményei: checkout.session.completed, checkout.session.async_payment_succeeded, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.paid és invoice.payment_failed. A célcím APP_URL/api/stripe-webhook.
- OPENAI_API_KEY, opcionálisan OPENAI_MODEL: csak az AI-ellenőrzéshez. A CV gombnyomáskor továbbítódik.
- DEMO_MODE=false: éles környezetben.

## Javítások
A CHANGES.md részletezi a megjelenési és működési javításokat. A generált portrék nincsenek a projektben. A saját fotó feltöltése megmaradt. A public és fonts mappákat teljes egészükben töltsd fel a gyökérben lévő futtatási fájlokkal együtt; a Dockerfile a color-utils.mjs és subscription-policy.mjs fájlokat is használja.

## Ellenőrzés
JavaScript-szintaxis; öt képernyőszélesség; e-mail ellenőrzés; nagyított CV-előnézet; 18 példa PDF-exportja és hosszú többoldalas próba; jogosulatlan PDF-export elutasítása. A PDF önálló szöveges dokumentum, tördelése eltérhet a böngészős előnézettől.

## Élesítés előtt még szükséges
1. Az üzemeltető nyilvános címe és a létrejövő vállalkozás adatai. A terms.html és privacy.html tervezetek: hiányzó adatokat és tisztázandó pontokat jelölnek, nem kész jogi dokumentumok.
2. A tényleges adatfeldolgozók, adatmegőrzési idők és adatkezelési feltételek véglegesítése.
3. Az adott Stripe környezetben a vásárlás, webhook, megújulás és lemondás ellenőrzése. A fiók Megújulás leállítása gombja az előfizetés időszak végi lemondását kéri. A hozzáférés addig megmarad. A reklamáció és visszatérítés külön, ügyfélszolgálati folyamat; nincs automatikus pénzküldés.
4. HTTPS, tartós adatkönyvtár és mentések beállítása.

Üzemeltető: Tamasits Mór. Kapcsolat: chypervitalize@gmail.com. Vállalkozás indítása folyamatban.

A csomag helyi javításokat tartalmaz; a chypervitalize.com publikus verziója automatikusan nem változott.
