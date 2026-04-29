# TLE Software eFBL Entegrasyonlu TMS Mikrositesi

Bu repo, TLE Software'in eFBL entegrasyonlu TMS cozumunu tanitmak ve eFBL arayisinda olan lojistik sirketlerinden lead toplamak icin hazirlanan mikro siteyi icerir.

Site; FIATA eFBL Practical Guide temel alinarak, karar vericiler ve operasyon ekipleri icin sade bir bilgilendirme akisi sunar. Konumlandirma, TLE Software'in eFBL entegrasyonunu tamamlayan dunyadaki 8. sirket olmasi ve eFBL destekli TMS yetkinligi uzerine kuruludur.

## Canli Site

GitHub Pages aktiflestirildiginde site su adresten goruntulenebilir:

```text
https://wurgun.github.io/efbl/
```

## Icerik

- eFBL nedir?
- eFBL entegrasyonlu TMS deger onerisi
- Lojistik sirketleri icin operasyonel faydalar
- Hukuki esdegerlik ve kontrol modeli
- FIATA Digital Identity sureci
- eFBL gecis yol haritasi
- TMS, operasyon, yonetim ve IT ekiplerine gore bilgilendirme
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

## eFBL RAG Asistani

Projede PDF kaynakli bir chatbot altyapisi bulunur. Chatbot, FIATA eFBL rehberinden uretilen `data/efbl-index.json` dosyasini kullanir ve `/api/chat` endpoint'i uzerinden yanit verir.

Kurulum:

```powershell
npm install
Copy-Item .env.example .env
```

`.env` dosyasinda `OPENAI_API_KEY` degerini tanimlayin.

PDF indeksini uretmek icin:

```powershell
npm run build:index
```

Gecerli OpenAI API anahtari varsa indeks embedding'lerle uretilir. Anahtar yoksa ya da gecersizse metin parcalari yine yazilir, ancak arama kalitesi semantik embedding aramasina gore daha sinirli olur.

Yerelde serverless API ile denemek icin:

```powershell
npm start
```

Not: GitHub Pages yalnizca statik dosya yayinladigi icin `/api/chat` endpoint'ini calistirmaz. Chatbotun calismasi icin Vercel, Netlify Functions veya benzeri serverless destekli bir ortam kullanilmalidir.

## GitHub Pages Yayini

GitHub Pages ile yayinlamak icin:

1. Repository sayfasinda `Settings` bolumune girin.
2. Sol menuden `Pages` sayfasini acin.
3. `Source` olarak `Deploy from a branch` secin.
4. Branch olarak `main`, folder olarak `/ (root)` secin.
5. Kaydedin.

Birkac dakika icinde site yayina alinir.

## Kaynaklar

- TLE Software: https://tlesoftware.com/
- FIATA eFBL Practical Guide: https://fiata.cdn.prismic.io/fiata/acu4XJGXnQHGZIQ0_eFBLguide_final.pdf
