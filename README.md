# UTIKAD eFBL Bilgilendirme Mikrositesi

Bu repo, UTIKAD uyelerini elektronik FIATA Multimodal Bill of Lading (eFBL) hakkinda bilgilendirmek icin hazirlanan statik mikro siteyi icerir.

Site; FIATA eFBL Practical Guide temel alinarak, uyeler icin daha sade ve uygulanabilir bir bilgilendirme akisi olarak duzenlenmistir.

## Canli Site

GitHub Pages aktiflestirildiginde site su adresten goruntulenebilir:

```text
https://wurgun.github.io/efbl/
```

## Icerik

- eFBL nedir?
- Uyeler icin operasyonel faydalar
- Hukuki esdegerlik ve kontrol modeli
- FIATA Digital Identity sureci
- eFBL kullanim yol haritasi
- Paydaslara gore bilgilendirme
- Hazirlik kontrol listesi
- Dogrulama ve sigorta modeli
- Sik sorulan sorular

## Dosya Yapisi

```text
.
|-- index.html
|-- styles.css
|-- script.js
|-- .gitlab-ci.yml
`-- README.md
```

## Lokal Goruntuleme

Bu proje herhangi bir build adimi gerektirmez. `index.html` dosyasi dogrudan tarayicida acilabilir.

## GitHub Pages Yayini

GitHub Pages ile yayinlamak icin:

1. Repository sayfasinda `Settings` bolumune girin.
2. Sol menuden `Pages` sayfasini acin.
3. `Source` olarak `Deploy from a branch` secin.
4. Branch olarak `main`, folder olarak `/ (root)` secin.
5. Kaydedin.

Birkac dakika icinde site yayina alinir.

## Kaynaklar

- UTIKAD: https://www.utikad.org.tr/
- FIATA eFBL Practical Guide: https://fiata.cdn.prismic.io/fiata/acu4XJGXnQHGZIQ0_eFBLguide_final.pdf
