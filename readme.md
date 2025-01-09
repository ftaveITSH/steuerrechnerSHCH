# :house: Grundstückgewinnsteuer - Rechner :dollar:
Ein Web-Rechner für die Grundstückgewinnsteuer im Kanton Schaffhausen - [Steuerrechner](https://steuerrechner.sh.ch/grundstueckgewinn/) / [Steuerrechner Test](https://steuerrechner-test.sh.ch)

![](./docs/steuerrechner.png)

# :racing_car: Funktion
Der Steuerrechner führt alle Berechnungen zur Steuer auf Client-Seite (über Javascript) aus! - kein Backend o.ä
>[!Important]
>Serverseiteiger Code wird nicht benötigt, da die Berechnungsgrundlagen öffentlich dargelegt werden müssen.

## :globe_with_meridians: Nginx rule
>[!Note]
>Auf dem Plesk wurde für https://steuerrechner.sh.ch/grundstueckgewinn/ eine Exception eingerichtet.

## :abacus: Tarifberechnung
Einerseits diente dieses [Kantonsblatt](./docs/sh-de.pdf) zur berechnung der Tarife, anderseits auch [diese Angaben](https://sh.ch/CMS/get/file/b665cf35-ca62-4439-b485-5a7391cd072d) aus dem Merkblatt, was dieser [Tabelle](https://sh.ch/CMS/get/file/ca0d9d0b-64f9-45fc-9754-a186094ed97e) entspricht.

Die Tarife pro Gemeinde und Konfession für das Formular werden aus [steuerfuesse.json](./steuerfuesse.json) befüllt & berechnet. \
Dieses ist wie folgt aufgebaut:

```json
{
    "2024": [
        {
            "Gemeinde": "Bargen",
            "natPers": "102",
            "jurPers": "102",
            "evangR": "11",
            "roemK": "13",
            "christK": "12.5"
        },
        {
            "Gemeinde": "Beggingen",
            "natPers": "117",
            "jurPers": "95",
            "evangR": "12",
            "roemK": "15",
            "christK": "12.5"
        }
    ],
    "2023": [
        {
            "Gemeinde": "Bargen",
            "natPers": "104",
            "jurPers": "104",
            "evangR": "11",
            "roemK": "13",
            "christK": "12.5"
        },
```
### :microscope: Berechnung & Ranges/Limits 
Bei Formularabschluss wird im Javascript [calculatetax.js](./calculatetax.js) die zu bezahlende Steuer anhand den Gesetzlichen Limiten & den eingegebenen Daten berechnet.

```javascript
    // definieren von Steuerraten
    const ranges = [
        { limit: 2000, rate: 0.02 },
        { limit: 4000, rate: 0.04 },
        { limit: 6000, rate: 0.06 },
        { limit: 8000, rate: 0.08 },
        { limit: 15000, rate: 0.10 },
        { limit: 30000, rate: 0.12 },
        { limit: 45000, rate: 0.14 },
        { limit: 60000, rate: 0.16 },
        { limit: 80000, rate: 0.18 },
        { limit: 100000, rate: 0.20 }
    ];

    // definieren von zusatzgebühren (Abhängig von besitzdauer in monaten)
    const surcharges = [
        { maxMonths: 6, rate: 0.50 },
        { maxMonths: 12, rate: 0.45 },
        { maxMonths: 18, rate: 0.40 },
        { maxMonths: 24, rate: 0.35 },
        { maxMonths: 30, rate: 0.30 },
        { maxMonths: 36, rate: 0.25 },
        { maxMonths: 42, rate: 0.20 },
        { maxMonths: 48, rate: 0.15 },
        { maxMonths: 54, rate: 0.10 },
        { maxMonths: 60, rate: 0.05 }
    ];

    // rabatte abhängig von besitzdauerJahre
    const discounts = [
        { years: 6, rate: 0.05 },
        { years: 7, rate: 0.10 },
        { years: 8, rate: 0.15 },
        { years: 9, rate: 0.20 },
        { years: 10, rate: 0.25 },
        { years: 11, rate: 0.30 },
        { years: 12, rate: 0.35 },
        { years: 13, rate: 0.40 },
        { years: 14, rate: 0.45 },
        { years: 15, rate: 0.50 },
        { years: 16, rate: 0.55 },
        { years: 17, rate: 0.60 }
    ];
```

## :paintbrush: Styling
Styling wird grösstenteils mit Bootstrap geregelt.
Eingebunden sind folgende JS & Css Files:

<ul>
<li>

```HTML
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
```

</li>
<li>

```HTML
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
    crossorigin="anonymous"></script>
```
</li>
<li>

```HTML
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
    integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
```
</li>
<li>

```HTML
<script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
    integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
    crossorigin="anonymous"></script>
```
</li>
<li>

```HTML
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"
    integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
    crossorigin="anonymous"></script>
```
</li>
<li>

```HTML
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js"
    integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
    crossorigin="anonymous"></script> 
```
</li>
</ul>

### :ribbon: Styles.css

Einzig der overflow und wenige attribute werden manuell mit der Datei [styles.css](styles.css) gesteuert:

```css
body{
    margin-top: 10vh;
    margin-bottom: 10vh;
    margin-left: 2vw;
    margin-right: 2vw;
    overflow-x: hidden;
}

img{
    width: 200px;
    margin-bottom: 10px;
}

#custombutton{
    text-align: center;
}
.labelcustom, #txtefftax{
    font-weight: bold;
}

#zivilstand{
    display: flex;
    justify-content: space-around;
}

hr {
    margin: 1rem 0;
    color: inherit;
    background-color: currentColor;
    opacity: 0.25;
}

```

## Adding new data to steuerfuesst.json
Data for 2025 was recieved in an excel file like this:
| Gemeinde       | Kanton NP            % | Kanton JP            % | Gemeinde       NP % | Gemeinde       JP % | evang.ref.    % | röm.-kath.     % | chr.-kath.<br>     % |
| -------------- | ---------------------- | ---------------------- | ------------------- | ------------------- | --------------- | ---------------- | -------------------- |
| Bargen         | 79                     | 98                     | 102                 | 102                 | 12              | 13               | 12.5                 |
| Beggingen      | 79                     | 98                     | 117                 | 95                  | 12              | 14               | 12.5                 |
| Beringen       | 79                     | 98                     | 91                  | 91                  | B12/G10         | 14               | 12.5                 |
| Buch           | 79                     | 98                     | 96                  | 96                  | 12              | 15               | 12.5                 |
| Buchberg       | 79                     | 98                     | 59                  | 47                  | 11              | 14               | 12.5                 |
| Büttenhardt    | 79                     | 98                     | 85                  | 85                  | 11              | 13               | 12.5                 |
| Dörflingen     | 79                     | 98                     | 88                  | 88                  | 12              | 13               | 12.5                 |
| Gächlingen     | 79                     | 98                     | 115                 | 115                 | 13              | 14               | 12.5                 |
| Hallau         | 79                     | 98                     | 112                 | 112                 | 10              | 14               | 12.5                 |
| Hemishofen     | 79                     | 98                     | 89                  | 89                  | 11.5            | 13               | 12.5                 |
| Löhningen      | 79                     | 98                     | 93                  | 93                  | 10              | 14               | 12.5                 |
| Lohn           | 79                     | 98                     | 98                  | 98                  | 11              | 13               | 12.5                 |
| Merishausen    | 79                     | 98                     | 110                 | 102                 | 12              | 13               | 12.5                 |
| Neuhausen      | 79                     | 98                     | 83                  | 93                  | 14              | 14               | 12.5                 |
| Neunkirch      | 79                     | 98                     | 99                  | 89                  | 11              | 14               | 12.5                 |
| Oberhallau     | 79                     | 98                     | 117                 | 117                 | 12              | 14               | 12.5                 |
| Ramsen         | 79                     | 98                     | 95                  | 95                  | 14              | 15               | 12.5                 |
| Rüdlingen      | 79                     | 98                     | 75                  | 70                  | 11              | 14               | 12.5                 |
| Schaffhausen   | 79                     | 98                     | 86                  | 93                  | SH13/H13        | 13               | 12.5                 |
| Schleitheim    | 79                     | 98                     | 115                 | 105                 | 10              | 14               | 12.5                 |
| Siblingen      | 79                     | 98                     | 105                 | 90                  | 12              | 14               | 12.5                 |
| Stein am Rhein | 79                     | 98                     | 95                  | 95                  | St11.5/B12      | 13               | 12.5                 |
| Stetten        | 79                     | 98                     | 61                  | 49                  | 11              | 13               | 12.5                 |
| Thayngen       | 79                     | 98                     | 92                  | 92                  | T10/UR10        | 13               | 12.5                 |
| Trasadingen    | 79                     | 98                     | 112                 | 97                  | 11              | 14               | 12.5                 |
| Wilchingen     | 79                     | 98                     | 112                 | 112                 | W9/O11          | 14               | 12.5                 |

From this, either extract data to json in excel, or use something like [tableconvert.com](https://tableconvert.com/excel-to-json).
Then make sure to regex replace Column names so they match like previous year.
Also split up rows with two "Gemeinden" like this:

| Gemeinde       | Kanton NP            % | Kanton JP            % | Gemeinde       NP % | Gemeinde       JP % | evang.ref.    % | röm.-kath.     % | chr.-kath.<br>     % |
| -------------- | ---------------------- | ---------------------- | ------------------- | ------------------- | --------------- | ---------------- | -------------------- |
| Thayngen | 79  | 98  | 92  | 92  | <b style="background-color:#eb4034;">T10/UR10</b> | 13  | 12.5 |

into this:

``` json 
    ...
        {
            "Gemeinde": "Thayngen",
            "natPers": "92",
            "jurPers": "92",
            "evangR": "10",
            "roemK": "13",
            "christK": "12.5"
        },
        {
            "Gemeinde": "Thayngen (Unterer Reiat)",
            "natPers": "92",
            "jurPers": "92",
            "evangR": "10",
            "roemK": "13",
            "christK": "12.5"
        },
    ...
```

## :desktop_computer: Browser Support
Mit folgenden Browsern wurde bereits getestet:

- Chrome (latest version)
- Firefox (latest version)
- Firefox-Mobile (latest version)
- Microsoft Edge (latest version)
- Opera (latest version)

## :email: Kontakt
### Steuerverwaltung
- [Informatik Steuerverwaltung](informatik.stv@sh.ch)
- [Markus Schwyn](mailto:markus.schwyn@sh.ch)
- [Nina Blanz](mailto:nina.blanz@sh.ch)

### Informatik Schaffhausen
- [Fabio Tavernini](mailto:Fabio.Tavernini@itsh.ch)
- [Lucas Köppli](mailto:Lucas.Koeppli@itsh.ch)
- [Marco Schirru](mailto:marco.schirru@itsh.ch)