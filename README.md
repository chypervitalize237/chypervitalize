# Chyper Vitalize

Működő, Railwayre előkészített CV-készítő első változat. Csontszínű felület, visszafogott világoszöld gombok, fotó nélküli alapértelmezett CV, opcionális fotó, nyolc teljes felületi nyelv: magyar, angol, német, francia, spanyol, olasz, portugál, holland.

## Indítás

Node.js 24 szükséges.

```sh
npm ci
npm start
```

Megnyitás: http://localhost:3000

## Ami működik

- Nyelvenként lefordított teljes oldal, mezők, példák, súgók és motiváló szövegek.
- Külön felületi és CV-nyelv. A CV-címek lefordulnak, a beírt tartalmat nem fordítja át automatikusan.
- Tíz szerkeszthető szakasz, ismételhető tapasztalatok, tanulmányok, projektek, eredmények, önkéntesség és képzések.
- Élő előnézet, automatikus eszközmentés. Bejelentkezve szerveroldali mentés SQLite adatbázisba.
- E-mail/jelszó regisztráció, scrypt jelszóhash, HttpOnly munkamenet-cookie, belépési kísérletek korlátozása.
- Meglévő fiók-CV és helyi CV esetén választás, nincs csendes felülírás.
- Hiányzó alapadatok ellenőrzése. Valódi AI-ellenőrzés, ha OPENAI_API_KEY be van állítva; a CV az AI-szolgáltatónak csak gombnyomásra kerül továbbításra.
- Próbafizetés és időkorlátos demohozzáférés. Egy nap 7.49 USD, egy hét 12.49 USD, egy hónap 14.99 USD. A havi az alapértelmezett.
- Helyi, rögzített bemutatóárak: EUR 6.99 / 11.49 / 13.99; HUF 2690 / 4490 / 5390. Ezek nem élő devizaátváltások; élesítés előtt véglegesítendők.
- Szöveges, kijelölhető, kereshető, többoldalas PDF, beágyazott Unicode betűkészlettel, szerveroldali hozzáférés-ellenőrzéssel. Nem képernyőkép-PDF.
- Havi demohozzáférésnél személyes meghívólink és a meghívó azonosítójának megőrzése regisztrációnál.

## Tudatosan még nem éles

NINCS valódi Stripe-terhelés, ismétlődő számlázás, e-mail-számla, lemondható éles előfizetés vagy meghívási jutalomjóváírás. A felületen minden próbafizetés egyértelműen meg van jelölve. A napi/heti csomag ebben a verzióban nem újul meg; a havi megújuló csomag felülete előkészítve, de demo esetén nem újul meg ténylegesen.

A felhasználó kérésére az éles fizetés bekötése későbbi lépés. Éles indulás előtt szükséges: Stripe Checkout + aláírás-ellenőrzött, idempotens webhookok, ár-/pénznem-azonosítók, Customer Portal lemondás, sikeres fizetés alapján kiadott jogosultság, Stripe számlázási e-mail beállítás, e-mail-hitelesítés és jelszó-visszaállítás, ellenőrzött meghívási jutalom és önmeghívás-védelem, adatkezelési tájékoztató és felhasználási feltételek. A régi ügyfél- és Stripe-azonosítók migrációját külön meg kell tervezni. Ne indíts valódi ügyfeleket demo módban.

Az ATS-barát felépítés nem jelent minden ATS-re érvényes garanciát. A PDF és a webes élő előnézet tördelése eltérhet, mivel a PDF külön, szöveges dokumentumként készül.

## Railway és GitHub

1. A csomag tartalmát töltsd fel a `chypervitalize237/chypervitalize` repó gyökerébe. A README lecserélhető erre. A node_modules, data és .env soha ne kerüljenek GitHubra.
2. A meglévő Railway-fiókban új, elkülönített szolgáltatáshoz kapcsolódjon a repó. A régi szolgáltatást és domaint egyelőre hagyd változatlanul.
3. A Dockerfile automatikusan építhető. Node 24, npm start.
4. Adj Railway Volume-ot `/data` csatolási ponttal, és `DATA_DIR=/data` változót. Egyetlen replika: SQLite nem megosztott adatbázis. Volume nélkül a fiókok és CV-k új telepítéskor elveszhetnek.
5. `DEMO_MODE=true` a teszteléshez. `NODE_ENV=production` a Dockerfile-ban megadva, így a session-cookie HTTPS-en működik. Railway adja a PORT-ot.
6. Előbb az ideiglenes Railway-címen próbáld ki. A chypervitalize.com átirányítása csak a teljes éles fizetési és adatátviteli teszt után következzen.

A futó szerver a szükséges környezeti változókat közvetlenül a környezetből olvassa, nem tölt be .env fájlt automatikusan. Helyi konfigurációhoz használható `node --env-file=.env server.mjs`.

## Árazás és további nyelvek

A felületi szövegek és a locale→currency mapping a public/i18n.js fájlban található. Nyelvből nem állapítható meg biztosan az ország; most a kérésnek megfelelő egyszerű nyelv/pénznem párosítást alkalmazzuk. Éles számlázáskor a kiválasztott pénznemet és az adózási országot külön kell megerősíteni.

## Biztonsági és üzemeltetési határok

Ez ellenőrzött fejlesztési változat, nem kész előfizetéses üzleti rendszer. Az adatbázis biztonsági mentése, adatmegőrzés, fióktörlés, monitoring és AI-használati kvóták még az éles indulás előtti feladatok. A demoadatok nem kerülnek a szállított ZIP-be. Jelszót/API-kulcsot ne küldj chatbe és ne tölts GitHubra.
