# Chypervitalize – üzemeltetői adatok és jogi előkészítés

Előkészítve: 2026. október 2. A dokumentum tervezet, nem vállalkozási bejegyzés vagy igazolás.

## A felhasználó által megadott adatok

- Név: Tamasits Mór.
- Ország: Magyarország.
- Település és irányítószám: 9400 Sopron.
- Nyilvános levelezési cím: Vásárhelyi Pál 12. (korábbi üzenetben megadva).
- Kapcsolati e-mail: chypervitalize@gmail.com.
- Weboldal és márkanév: Chypervitalize, https://chypervitalize.com/.

A levelezési cím nem minősül automatikusan bejegyzett székhelynek. A név mellett az „egyéni vállalkozó” vagy „e.v.” megjelölés a tényleges bejegyzés előtt nem szerepel.

## Bejegyzés után kitöltendő

- Hivatalos vállalkozási forma és bejegyzett név.
- Székhely, nyilvántartási szám, nyilvántartást vezető szerv.
- Adószám, áfastátusz és számlázási adatok.
- Ügyfélszolgálati telefonszám és fogyasztói panaszkezelési rend.
- Illetékes békéltető testület aktuális elérhetősége.

Ezeket tényleges okirat vagy nyilvántartás alapján kell megadni; nem generálhatók fiktív azonosítók.

## Az éles fizetős indulás előtt szükséges

- Végleges árak és adózás, számlázási folyamat ellenőrzése.
- A szerződéskötési lépések, adatjavítási lehetőség, szerződés nyelve és tárolása, fizetési kötelezettség egyértelmű jelzése.
- A szerződés és feltételek ügyfélnek küldött, megőrizhető visszaigazolása. Az üzemeltetőnek érkező Stripe értesítés ezt nem helyettesíti.
- Elkészült az online elállási funkció: azonosító adatok, ellenőrzés, „Elállás megerősítése”, szerveroldali nyilvántartás és letölthető PDF-visszaigazolás. Külön elállási e-mail-értesítő nincs.
- A szolgáltatás korai megkezdésére vonatkozó nyilatkozatok és naplózás ellenőrzése; jogvesztést nem szabad pusztán a vásárláshoz vagy letöltéshez kötni.
- Panaszkezelési határidők, megőrzés és hatósági/békéltető tájékoztatás véglegesítése.
- Railway, Stripe, Gmail, opcionális OpenAI adatfeldolgozói szerepe, megállapodásai, amerikai adattovábbítás garanciái és szolgáltatói megőrzési idők ellenőrzése.
- Fióktörlési, adatkiadási és mentésekből való visszaállítás utáni ismételt törlési eljárás dokumentálása.

## Elkészült fájlok

- `contact.html`: kapcsolat és üzemeltetői adatok.
- `privacy.html`: adatkezelési tervezet a jelenlegi kód és mentési rendszer alapján.
- `terms.html`: szolgáltatási feltételek, megújulás, lemondás, fogyasztói elállás és nyilatkozatminta.

A `legal/` könyvtár a szövegek forrása. A `node legal-pages.mjs` parancs a három oldalt a `public/` könyvtárba másolja; nem írja át az alkalmazást vagy a fizetési beállításokat. A működési és telepítési ellenőrzés eredményét a JOGI-ELALLAS-20261002.md jelentés tartalmazza.

## Ellenőrzött jogszabályok

- https://njt.jog.gov.hu/jogszabaly/2014-45-20-22
- https://njt.jog.gov.hu/jogszabaly/2001-108-00-00
- https://eur-lex.europa.eu/legal-content/HU/TXT/?uri=CELEX:32016R0679
