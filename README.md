# beer-events-rss

Olutkerhon yksinkertainen blogi: markdown-postaukset kansiossa `posts/`, käännetään
staattiseksi sivustoksi ja RSS-syötteeksi, julkaistaan GitHub Pagesissa.

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

## Julkaisu

Pushaa `main`-haaraan → `.github/workflows/deploy.yml` rakentaa ja deployaa
sivuston GitHub Pagesiin.

**Kerran-asetus:** repon asetuksista **Settings → Pages → Source: GitHub Actions**.

Julkaistu sivusto: `https://<owner>.github.io/beer-events-rss/`
RSS-syöte: `https://<owner>.github.io/beer-events-rss/rss.xml`

## Rakenne

```
posts/              Markdown-postaukset (sisältö)
public/             Staattiset tiedostot (kopioidaan dist/ juureen)
src/
  build.ts          Build-skripti
  templates/        HTML-pohjat ({{placeholder}}-merkinnöillä)
.github/workflows/
  deploy.yml        GitHub Pages -deploy
dist/               Build-tuloste (ei versionhallinnassa)
```
