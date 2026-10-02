# Online elállási kérelmek

A `/withdrawal.html` nyilvános, bejelentkezés nélkül használható űrlap. Az adatok ellenőrzése után az „Elállás megerősítése” küldi el a nyilatkozatot. A szerver SQLite-adatbázisba menti a kérelmet, a teljes szöveget és a pontos UTC-időpontot. Azonos beküldési kulccsal az újrapróbálás ugyanazt a kérelmet adja vissza. Az eredeti időpont és tartalom nem változik.

Az átvételi visszaigazolás azonnal megjelenik, és PDF-ként letölthető. Ez külön e-mailt nem küld. A letöltési hivatkozásban nincs titkos kulcs: a szerver HttpOnly, SameSite=Strict, éles környezetben Secure sütivel ellenőrzi a hozzáférést. A süti egy óráig él, csak a visszaigazolási útvonalon használható. A beküldési kulcs az adott lap sessionStorage tárhelyén marad az újrapróbáláshoz. Más böngésző vagy jogosulatlan kérés nem kapja meg a PDF-et.

## Üzemeltetői ügyintézés

1. Nyisd meg a `/withdrawals-admin.html` oldalt HTTPS-en.
2. Add meg a `WITHDRAWAL_ADMIN_TOKEN` kezelőkulcsot. A kulcsot a böngésző nem menti el. A helyi biztonsági példány a Gitből kizárt `tmp/railway-migration/withdrawal-admin-key.txt` fájlban található. Ne küldd ügyfeleknek és ne tedd GitHubra.
3. Ellenőrizd rendszeresen, legalább naponta az új kérelmeket. Jelenleg nincs automatikus értesítő e-mail az új elállásokról. Legfeljebb a legutóbbi 200 ügy látható; nagyobb forgalomnál teljes ügyirat-export vagy lapozott ügykezelő szükséges.
4. Az eredeti nyilatkozatot ne módosítsd. A feldolgozási állapot „Új”, „Feldolgozás alatt” vagy „Lezárt” lehet.
5. Azonosítsd az érintett vásárlást. Pénzügyi vagy fiókmódosítás előtt ellenőrizd a kérő jogosultságát; a beküldés nem bizonyítja az e-mail-cím tulajdonjogát. Ne kérj indokolást a jogszabály szerinti elálláshoz.
6. A Stripe-előfizetés és a visszatérítés rendezése külön művelet. A kezelőfelület állapotváltása nem indítja el ezeket. Az ügyfélnek a tényleges ügyintézés eredményéről a megadott címre válaszolj.

Az elállási kérelem naplója a rendes SQLite-mentés része. A lezárt ügyiratok ötéves megőrzését és törlését az üzemeltető kezeli; automatikus ügyirattörlés nincs. Folyamatban lévő jogvita és kötelező megőrzés esetén a szükséges iratokat tovább kell megőrizni. A visszaállított mentésen ismét érvényesíteni kell a korábban elvégzett adat- és fióktörléseket.

Teszt: `node ops/verify-withdrawal.mjs`. A teszt új helyi adatbázist használ, nem hoz létre fizetést vagy éles visszatérítést.

## Jogi határ

Az online elállás követelményeinek alapja a 45/2014. (II. 26.) Korm. rendelet 22. §-a. A visszaigazolás ebben a megvalósításban megőrizhető PDF-fájl, nem e-mail. A teljes éles szerződéskötési folyamat, adózás, számlázás és a tárhelyszolgáltató adatfeldolgozói megállapodása külön véglegesítést igényel; a működési teszt nem jogi megfelelőségi tanúsítvány.
