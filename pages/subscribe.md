---
title: "Tilaa RSS-syöte"
description: "Näin saat ilmoituksen uusista Beerss-postauksista omaan RSS-lukijaasi."
---

Beerssin **RSS-syöte** kertoo lukijallesi heti kun uusi postaus julkaistaan —
ei sähköposteja, ei seurantaa, ei algoritmeja. Pelkkä syöte otsikoineen ja
sisältöineen.

## Syötteen osoite

Kopioi tämä osoite ja liitä se RSS-lukijaasi:

```
{{feedUrl}}
```

## Suositeltavat RSS-lukijat

Selaimet eivät yleensä enää tue syötteitä suoraan, mutta ilmaisia lukijoita
on tarjolla useita:

- **[Feedly](https://feedly.com/)** — selaimessa ja mobiilissa, ilmainen
  perustaso
- **[Inoreader](https://www.inoreader.com/)** — tehokkaat suodatukset ja
  kategoriat
- **[NetNewsWire](https://netnewswire.com/)** — avoimen lähdekoodin Mac &
  iOS -sovellus
- **[Reeder](https://reederapp.com/)** — kaunis lukija Applen alustoille
- **[Thunderbird](https://www.thunderbird.net/)** — sähköpostiohjelma, joka
  tukee myös RSS-syötteitä

## Miten syöte lisätään?

1. Avaa valitsemasi RSS-lukija
2. Etsi toiminto **Add feed** / **Subscribe** / **Lisää syöte**
3. Liitä ylläoleva osoite
4. Tallenna

Useimmat lukijat tarjoavat myös automaattisen tunnistuksen: kun syötät
pelkän sivuston osoitteen ([{{siteUrl}}]({{siteUrl}})), lukija löytää
syötteen automaattisesti sivun `<link rel="alternate">`-tagin perusteella.

## Mikä RSS oikeastaan on?

RSS (Really Simple Syndication) on yli 20 vuotta vanha avoin standardi
verkkosisällön jakeluun. Yksi tilaus, ei somealustaa välissä, ei mainoksia
— sinun lukijasi noutaa uudet postaukset suoraan tästä sivustosta.
