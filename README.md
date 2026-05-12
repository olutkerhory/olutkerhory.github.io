# olutkerhory.github.io

**Beerss** — olutkerhon yksinkertainen blogi. Markdown-postaukset ja
-staattiset sivut käännetään staattiseksi sivustoksi ja RSS-syötteeksi,
julkaistaan GitHub Pagesissa.

**Julkaistu sivusto:** <https://olutkerhory.github.io/>
**RSS-syöte:** <https://olutkerhory.github.io/rss.xml>
**Tilaus-ohje:** <https://olutkerhory.github.io/subscribe.html>

## Miten tämä toimii

```
posts/*.md   ──┐                              ┌── dist/index.html
pages/*.md   ──┤                              ├── dist/posts/<slug>.html
public/*     ──┼──►  npm run build  ──►       ├── dist/<page-slug>.html
src/build.ts ──┤                              ├── dist/rss.xml
src/templates  ┘                              └── dist/styles.css (yms. public/:sta)
```

Sisällöllä on kaksi muotoa:

- **Postaukset** (`posts/`) — aikaleimattuja, ilmestyvät etusivun listalla ja
  RSS-syötteessä. Käytä näitä tapahtumakutsuihin, maistelumuistiinpanoihin
  ja muihin "uutisiin".
- **Sivut** (`pages/`) — pysyvää sisältöä (esim. tilaus-ohje, tietoja),
  ei aikaleimaa, **ei** mukana etusivulla eikä RSS-syötteessä. Linkitä
  navigaatiosta tai muista sivuista.

Pipeline:

1. **Lähdesisältö** elää kansioissa `posts/`, `pages/` (markdown-tiedostot
   YAML-frontmatterilla) ja `public/` (CSS, kuvat, suoraan kopioitavat
   tiedostot).
2. **Build-skripti** `src/build.ts` (TypeScript, ajetaan `tsx`:llä) lukee
   sisällön, parsii frontmatterin (`gray-matter`), renderöi markdownin
   HTML:ksi (`marked`), sijoittaa sisällön HTML-pohjiin (`src/templates/`)
   ja kirjoittaa lopputuloksen `dist/`-kansioon. RSS-syöte (vain postauksista)
   tuotetaan `feed`-kirjastolla.
3. **GitHub Actions** (`.github/workflows/deploy.yml`) ajaa buildin jokaisella
   pushilla `main`-haaraan ja julkaisee `dist/`-kansion GitHub Pagesissa.
   Build-vaihe saa oikean julkisen URL:n env-muuttujasta `SITE_URL`, joka tulee
   `actions/configure-pages`-stepistä — RSS-syötteen `<link>`-tagit ja sivuston
   linkit osoittavat suoraan oikeaan domainiin.

### Tärkeät tiedostot

| Polku | Mitä |
|---|---|
| `posts/` | Aikaleimatut postaukset. Tiedostonimestä tulee URL-slug. Päätyvät RSS-syötteeseen. |
| `pages/` | Pysyvät sivut (esim. `subscribe.md`). Eivät päädy etusivun listalle eivätkä RSS-syötteeseen. |
| `public/` | Staattiset tiedostot (CSS, kuvat). Kopioidaan suoraan `dist/`:in juureen. |
| `src/build.ts` | Build-pipeline (n. 200 riviä). |
| `src/templates/base.html` | Sivun ulkokuori (head, header, footer). |
| `src/templates/index.html` | Etusivun runko, sisältää `{{posts}}`-listamerkin. |
| `src/templates/post.html` | Yksittäisen postauksen runko. |
| `src/templates/page.html` | Yksittäisen pysyvän sivun runko. |
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

## Pysyvän sivun lisääminen

Tee uusi `.md`-tiedosto kansioon `pages/`. Frontmatter on minimaalinen:

```yaml
---
title: "Tietoja"
description: "Yhteenveto sivun sisällöstä (käytetään `<title>`/SEO:hon)."
---

Sivun sisältö Markdownina.
```

Tiedostonimestä tulee URL-slug suoraan juuressa
(esim. `pages/tietoja.md` → `/tietoja.html`).

**Sivuston ja syötteen URL placeholderit:** sivujen markdownissa voi käyttää
seuraavia placeholdereita, jotka korvataan build-vaiheessa oikeilla
URL-osoitteilla:

| Placeholder | Korvataan |
|---|---|
| `{{siteUrl}}` | Sivuston juuri (esim. `https://olutkerho.github.io/beer-events-rss/`) |
| `{{feedUrl}}` | RSS-syötteen täysi URL (esim. `https://olutkerho.github.io/beer-events-rss/rss.xml`) |

Tämä on hyödyllistä mm. koodilohkoissa joihin halutaan näyttää linkin
osoite kokonaisuudessaan. Postauksissa placeholderit **eivät** ole käytössä
— ne ovat vain sivuille (`pages/`).

Jos haluat sivun näkyvän navigaatiossa, lisää linkki tiedostoon
`src/templates/base.html` (`<nav>`-lohkoon).

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
[olutkerhory-organisaation](https://github.com/orgs/olutkerhory/people) jäsenille
ja erikseen lisätyille collaborator-tunnuksille.

Jos haluat kirjoitusoikeuden, katso [CONTRIBUTING.md](./CONTRIBUTING.md).
