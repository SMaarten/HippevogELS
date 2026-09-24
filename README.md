# Hippe vogELS — website & webshop

Handgemaakte juwelen van Els Vernaeve. Een statische site (Jekyll) die gratis draait op **GitHub Pages**,
met een beheerpaneel op `/admin/` om creaties toe te voegen en als **VERKOCHT** te markeren.

## Beheren (voor Els)

1. Ga naar `https://<jouw-site>/admin/`.
2. Klik **Sign In with Token**. De eerste keer maak je via de link in het venster een GitHub-token aan
   (vink de voorgestelde rechten aan, kies een lange geldigheid), en plak het.
3. Kies **Creaties**:
   - **Nieuw juweel:** *New Creatie* → naam, prijs, soort, foto uploaden → *Save*.
   - **Verkocht:** open het juweel → *Status* → **VERKOCHT** → *Save*. Het krijgt een rood SOLD-lint
     en kan niet meer in een mandje.
   - **Filter "Zonder prijs"** toont stukken die nog een prijs nodig hebben (zonder prijs = "Vraag de prijs").
4. Onder **Instellingen** pas je e-mail, IBAN, verzendkosten, teksten en de **Atelier-foto's** aan.

Na opslaan staat de wijziging na ± 1–2 minuten online.

## Hoe bestellen werkt

Klant legt stukken in het mandje → vult naam/adres in → de bestelling wordt gemaild naar Els
(via het e-mailprogramma van de klant, of automatisch via [Formspree](https://formspree.io) als je een
Formspree-ID invult bij Instellingen) → Els bevestigt en de klant betaalt per overschrijving → Els zet het
stuk op VERKOCHT. Omdat elk stuk uniek is, voorkomt deze bevestigingsstap dat twee mensen hetzelfde kopen.

## Technisch

- `_producten/*.md` — één bestand per juweel (front matter: `status`, `prijs`, `foto`, …)
- `_data/winkel.yml` — winkelgegevens · `_data/atelier.yml` — foto's van het maakproces
- `admin/config.yml` — beheerpaneel ([Sveltia CMS](https://github.com/sveltia/sveltia-cms))
- `assets/js/winkel.js` — mandje (localStorage), filters, bestelformulier

Lokaal bekijken: `bundle exec jekyll serve` (of `jekyll serve`) → http://localhost:4000

**Projectsite (`gebruiker.github.io/hippevogels`)**: zet `baseurl: "/hippevogels"` in `_config.yml`.
**Eigen domein** (bv. hippevogels.be): laat `baseurl` leeg, voeg een `CNAME`-bestand toe en pas
`site_url` in `admin/config.yml` aan.
