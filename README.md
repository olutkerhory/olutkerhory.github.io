# beer-events-rss

**Beerss** — olutkerhon yksinkertainen blogi. Markdown-postaukset elävät
kansiossa `posts/`, käännetään staattiseksi sivustoksi ja RSS-syötteeksi,
julkaistaan GitHub Pagesissa.

**Julkaistu sivusto:** <https://olutkerho.github.io/beer-events-rss/>
**RSS-syöte:** <https://olutkerho.github.io/beer-events-rss/rss.xml>

## Miten tämä toimii

```
posts/*.md   ──┐
public/*     ──┤                           ┌── dist/index.html
src/build.ts ──┼─►  npm run build  ──►    ├── dist/posts/<slug>.html
src/templates  ─┘                          ├── dist/rss.xml
                                           └── dist/styles.css (yms. public/:sta)
```

1. **Lähdesisältö** elää kansiossa `posts/` (yksi markdown-tiedosto per postaus,
   YAML-frontmatterilla) ja `public/` (CSS, kuvat, suoraan kopioitavat tiedostot).
2. **Build-skripti** `src/build.ts` (TypeScript, ajetaan `tsx`:llä) lukee postaukset,
   parsii frontmatterin (`gray-matter`), renderöi markdownin HTML:ksi (`marked`),
   sijoittaa sisällön HTML-pohjiin (`src/templates/`) ja kirjoittaa lopputuloksen
   `dist/`-kansioon. RSS-syöte tuotetaan `feed`-kirjastolla.
3. **GitHub Actions** (`.github/workflows/deploy.yml`) ajaa buildin jokaisella
   pushilla `main`-haaraan ja julkaisee `dist/`-kansion GitHub Pagesissa.
   Build-vaihe saa oikean julkisen URL:n env-muuttujasta `SITE_URL`, joka tulee
   `actions/configure-pages`-stepistä — RSS-syötteen `<link>`-tagit ja sivuston
   linkit osoittavat suoraan oikeaan domainiin.

### Tärkeät tiedostot

| Polku | Mitä |
|---|---|
| `posts/` | Markdown-postaukset. Tiedostonimestä tulee URL-slug. |
| `public/` | Staattiset tiedostot (CSS, kuvat). Kopioidaan suoraan `dist/`:in juureen. |
| `src/build.ts` | Build-pipeline (n. 150 riviä). |
| `src/templates/base.html` | Sivun ulkokuori (head, header, footer). |
| `src/templates/index.html` | Etusivun runko, sisältää `{{posts}}`-listamerkin. |
| `src/templates/post.html` | Yksittäisen postauksen runko. |
| `.github/workflows/deploy.yml` | GitHub Pages -deployaus. |
| `dist/` | Build-tuloste. Ei versionhallinnassa. |

## Postauksen lisääminen

Tee uusi `.md`-tiedosto kansioon `posts/`. Käytä tätä frontmatteria:

```yaml
---
title: "Maistelu: Belgialaiset trappistit"
date: 2026-05-20            # pakollinen, julkaisupäivä
description: "Lyhyt kuvaus, näkyy listalla ja RSS-syötteessä."
eventDate: 2026-06-05       # valinnainen, varsinaisen tapahtuman päivä
eventLocation: "Panimo X"   # valinnainen
tags: [maistelu, trappist]  # valinnainen
---

Postauksen sisältö Markdownina.
```

Tiedostonimestä tulee URL-slug (esim. `2026-05-20-trappistit.md` →
`/posts/2026-05-20-trappistit.html`).

## Paikallinen kehitys

```bash
npm install
npm run build       # tuottaa dist/-kansion
npm run serve       # build + python3 http.server porttiin 8000
```

Avaa <http://localhost:8000>. RSS-syöte: <http://localhost:8000/rss.xml>.

Tyypintarkistus: `npm run typecheck`.

## Julkaisu

Pushaa `main`-haaraan → workflow rakentaa ja deployaa sivuston automaattisesti.

**Kerran-asetus:** repon asetuksista **Settings → Pages → Source: GitHub Actions**.

## Käyttöoikeudet ja osallistuminen

Repo on **julkinen lukuoikeuksin** — kuka tahansa voi kloonata, forkata ja
lähettää pull requesteja. **Suora push-oikeus** on rajattu
[olutkerho-organisaation](https://github.com/orgs/olutkerho/people) jäsenille
ja erikseen lisätyille collaborator-tunnuksille.

Jos haluat kirjoitusoikeuden, katso [CONTRIBUTING.md](./CONTRIBUTING.md).
