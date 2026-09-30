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
- STRIPE_SECRET_KEY és STRIPE_WEBHOOK_SECRET: kizárólag Stripe sandbox tesztkulcs és sandbox webhook. Az alkalmazás elutasítja az éles kulcsokat és éles webhook-eseményeket. A kulcsok nem részei a csomagnak.
- OPENAI_API_KEY, opcionálisan OPENAI_MODEL: csak az AI-ellenőrzéshez. A CV gombnyomáskor továbbítódik.
- DEMO_MODE=false: éles környezetben.

## Javítások
A CHANGES.md részletezi a megjelenési és működési javításokat. A generált portrék nincsenek a projektben. A saját fotó feltöltése megmaradt. A public és fonts mappákat teljes egészükben töltsd fel a gyökérben lévő futtatási fájlokkal együtt; a Dockerfile a color-utils.mjs és subscription-policy.mjs fájlokat is használja.

## Ellenőrzés
JavaScript-szintaxis; öt képernyőszélesség; e-mail ellenőrzés; nagyított CV-előnézet; 18 példa PDF-exportja és hosszú többoldalas próba; jogosulatlan PDF-export elutasítása. A PDF önálló szöveges dokumentum, tördelése eltérhet a böngészős előnézettől.

## Élesítés előtt még szükséges
1. Az üzemeltető nyilvános címe és a létrejövő vállalkozás adatai. A terms.html és privacy.html tervezetek: hiányzó adatokat és tisztázandó pontokat jelölnek, nem kész jogi dokumentumok.
2. A tényleges adatfeldolgozók, adatmegőrzési idők és adatkezelési feltételek véglegesítése.
3. Stripe tesztkörnyezetben teljes vásárlás, webhook, megújulás és lemondás ellenőrzése. A fiók Megújulás leállítása gombja a sandbox előfizetés időszak végi lemondását kéri. A hozzáférés addig megmarad. A reklamáció és visszatérítés külön, ügyfélszolgálati folyamat; nincs automatikus pénzküldés.
4. HTTPS, tartós adatkönyvtár és mentések beállítása.

Üzemeltető: Tamasits Mór. Kapcsolat: chypervitalize@gmail.com. Vállalkozás indítása folyamatban.

A csomag helyi javításokat tartalmaz; a chypervitalize.com publikus verziója automatikusan nem változott.
