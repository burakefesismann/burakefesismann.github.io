# Kişisel site — blueprint (pafta) teması

Saf HTML + CSS + vanilla JS ile kurulmuş, tek koyu temalı statik kişisel site.
Build adımı yok; GitHub Pages'te doğrudan çalışır. Tasarım dili: teknik çizim /
"blueprint" (ızgara zemin, antet, ölçü çizgileri, köşe baskı işaretleri, CAD artı imleç).
Tek sıcak vurgu: bakır.

## Dosya yapısı

```
index.html          ana sayfa (hero · hakkımda · ne yapıyorum · iletişim · marka şeridi)
uygulamalar.html    hesap araçları (modüller)
css/styles.css      tüm tasarım sistemi (tek dosya, iki sayfa)
js/main.js          ortak davranış (artı imleç, marka şeridi kopyası)
js/tools.js         uygulamalar sayfasındaki hesap araçları
assets/             favicon vs.
.nojekyll           GitHub Pages'in Jekyll'a sokmasını engeller (boş dosya)
```

## Yerel önizleme

```bash
python -m http.server 8000
# tarayıcı: http://localhost:8000
```
veya VS Code "Live Server" eklentisi.

## Doldurulacak yerler (placeholder)

Tüm placeholder'lar `[...]` ile yazıldı ve HTML içinde `DEĞİŞTİR` yorumlarıyla işaretlendi.
Aramak için editörde `[` ya da `DEĞİŞTİR` aratman yeterli:

- `[Ad Soyad]` — adın (başlık, hero, antet, footer, `<title>`)
- `[as]` — header'daki kısa mono logo
- hakkımda metni (§ 01)
- ne yapıyorum maddeleri (§ 02)
- `[github-kullanici-adi]`, `[linkedin-profil]`, `[e-posta-adresi]` — iletişim (§ 03)

## GitHub Pages yayını

İki seçenek var; sana uyanı seç:

**Seçenek A — kişisel site (önerilen):**
Repo adı `KULLANICIADI.github.io` olur, adres `https://KULLANICIADI.github.io`.

```bash
git init
git add .
git commit -m "ilk sürüm: blueprint kişisel site"
git branch -M main
git remote add origin https://github.com/KULLANICIADI/KULLANICIADI.github.io.git
git push -u origin main
```
Ardından: GitHub → repo → **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `root`**.

**Seçenek B — proje sitesi:**
Herhangi bir repo (`repo-adi`), adres `https://KULLANICIADI.github.io/repo-adi/`.
Aynı adımlar; remote'u kendi repo adınla kur. Tüm yollar göreli (relative) olduğu için
alt dizinde de sorunsuz çalışır.

## Erişilebilirlik / performans

- Tamamen responsive, mobil öncelikli.
- `prefers-reduced-motion: reduce` ile tüm animasyonlar kapanır (içerik görünür kalır).
- Harici JS kütüphanesi yok; sadece Google Fonts `<link>`.
- Anlamlı `aria` etiketleri, klavye ile gezilebilir, bakır odak halkası.
