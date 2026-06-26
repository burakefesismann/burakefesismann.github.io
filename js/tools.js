/* =====================================================================
   tools.js — uygulamalar sayfasındaki hesap araçları
   her modül kendi init fonksiyonunda; ilgili öğe yoksa sessizce çıkar,
   böylece sayfadan bağımsız çalışır. Tüm sayılar tr-TR biçiminde.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- ortak yardımcılar ---------- */

  // para: 2 ondalığa yuvarla, tam sayıysa ondalık gösterme (brief referansı)
  const money = n => {
    const r = Math.round(n * 100) / 100;
    return r.toLocaleString('tr-TR', { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 });
  };
  // yüzde
  const pct = n =>
    '%' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  // çarpan (1 + oran) — küsüratıyla, virgülden sonra maks 6 hane (sondaki sıfırlar atılır)
  const fac = n =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  // serbest sayı (ondalık opsiyonu)
  const num = (n, d = 2) =>
    n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: d });
  // input -> negatif olmayan sayı
  const numOf = el => Math.max(0, parseFloat(el && el.value) || 0);
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.prototype.slice.call(r.querySelectorAll(s));

  /* =====================================================================
     MODÜL 01 — Nakliyeyi fiyata yedir  (TAM)
     ara_toplam = Σ fiyat
     oran = yedirilecek / ara_toplam
     yeni_fiyat = fiyat × (1 + oran)
     yuvarlama: her satır 2 ondalık; kalan kuruş farkı son dolu satıra yedirilir
     (largest-remainder mantığı) -> yeni_toplam = ara_toplam + yedirilecek (tam).
     ===================================================================== */
  function initMod01() {
    const list = $('#lineList');
    if (!list) return;

    // başlangıç: tek kalem (kullanıcı satır ekle ile çoğaltır)
    const SEED = [
      ['kalem 1', 10000]
    ];

    function makeRow(name, price) {
      const row = document.createElement('div');
      row.className = 'line';
      row.setAttribute('role', 'row');
      row.innerHTML =
        '<input type="text" class="pname" value="" aria-label="kalem adı">' +
        '<input type="number" class="price" value="" min="0" step="0.01" inputmode="decimal" aria-label="fiyat">' +
        '<span class="new" role="cell">—</span>' +
        '<button class="rm" type="button" aria-label="satırı sil">×</button>';
      row.querySelector('.pname').value = name;
      row.querySelector('.price').value = price;
      row.querySelector('.rm').addEventListener('click', () => {
        if ($$('.line', list).length > 1) { row.remove(); recalc(); }
      });
      return row;
    }

    function recalc() {
      const rows   = $$('.line', list);
      const prices = rows.map(r => numOf(r.querySelector('.price')));
      const subtotal = prices.reduce((a, b) => a + b, 0);
      const extra = numOf($('#extra'));
      const rate  = subtotal > 0 ? extra / subtotal : 0;
      const target = subtotal + extra;

      // satır bazında 2 ondalığa yuvarla
      const news = prices.map(p => Math.round(p * (1 + rate) * 100) / 100);

      // yuvarlama kayması -> kalanı son dolu satıra yedir
      if (subtotal > 0) {
        const sum  = news.reduce((a, b) => a + b, 0);
        const diff = Math.round((target - sum) * 100) / 100;
        if (diff !== 0) {
          for (let i = news.length - 1; i >= 0; i--) {
            if (prices[i] > 0) { news[i] = Math.round((news[i] + diff) * 100) / 100; break; }
          }
        }
      }

      rows.forEach((row, i) => {
        row.querySelector('.new').textContent = subtotal > 0 ? money(news[i]) + ' ₺' : '—';
      });
      $('#rate').textContent     = subtotal > 0 ? '× ' + fac(1 + rate) : '—';
      const rsub = $('#rateSub');
      if (rsub) rsub.textContent = subtotal > 0
        ? 'her fiyatı bununla çarp · +' + pct(rate * 100)
        : 'her fiyatı bununla çarp';
      $('#subtotal').textContent = money(subtotal) + ' ₺';
      $('#total').textContent    = money(target) + ' ₺';
      $('#delta').textContent    = '+' + money(extra) + ' ₺';
    }

    // satırları kur
    SEED.forEach(([n, p]) => list.appendChild(makeRow(n, p)));

    // olaylar: herhangi bir fiyat/tutar değişince anında yeniden hesapla
    list.addEventListener('input', e => { if (e.target.classList.contains('price')) recalc(); });
    $('#extra').addEventListener('input', recalc);
    $('#addLine').addEventListener('click', () => {
      const n = $$('.line', list).length + 1;
      list.appendChild(makeRow('kalem ' + n, 0));
      recalc();
      const last = $$('.line .pname', list).pop();
      if (last) last.focus();
    });

    recalc();
  }

  /* =====================================================================
     MODÜL 02 — KDV  (ekle: net→brüt · ayır: brüt→net)
     ===================================================================== */
  function initKdv() {
    const root = $('#mod02');
    if (!root) return;
    let mode = 'ekle';

    function calc() {
      const t = numOf($('#kdvTutar'));
      const o = numOf($('#kdvOran')) / 100;
      let vergi, sonuc, label;
      if (mode === 'ekle') {          // net -> brüt
        vergi = t * o;  sonuc = t + vergi;  label = 'brüt (KDV dahil)';
      } else {                        // brüt -> net
        const net = o > -1 ? t / (1 + o) : 0;
        vergi = t - net; sonuc = net;       label = 'net (KDV hariç)';
      }
      $('#kdvSonucLabel').textContent = label;
      $('#kdvSonuc').textContent = money(sonuc) + ' ₺';
      $('#kdvVergi').textContent = money(vergi) + ' ₺';
    }

    $$('[data-kdv]', root).forEach(btn => btn.addEventListener('click', () => {
      mode = btn.getAttribute('data-kdv');
      $$('[data-kdv]', root).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      calc();
    }));
    root.addEventListener('input', calc);
    calc();
  }

  /* =====================================================================
     MODÜL 03 — Zincirleme iskonto
     net = liste × Π(1 - d/100) ; toplam indirim = 1 - net/liste
     ===================================================================== */
  function initIskonto() {
    const root = $('#mod03');
    if (!root) return;

    function calc() {
      const liste = numOf($('#iskListe'));
      const ds = ($('#iskler').value || '')
        .split(/[,;\s]+/).map(s => parseFloat(s.replace(',', '.')))
        .filter(v => !isNaN(v) && v >= 0);
      let net = liste;
      ds.forEach(d => { net *= (1 - d / 100); });
      if (net < 0) net = 0;
      const indirim = liste > 0 ? (1 - net / liste) * 100 : 0;
      $('#iskNet').textContent  = money(net) + ' ₺';
      $('#iskOran').textContent = pct(indirim);
    }
    root.addEventListener('input', calc);
    calc();
  }

  /* =====================================================================
     MODÜL 04 — Fiyatlandırma
     markup (üzerine ekle): satış = maliyet × (1 + o)
     margin (kâr marjı):    satış = maliyet / (1 - o)
     ===================================================================== */
  function initMarj() {
    const root = $('#mod04');
    if (!root) return;
    let mode = 'markup';

    function calc() {
      const m = numOf($('#marMaliyet'));
      const o = numOf($('#marOran')) / 100;
      let satis;
      if (mode === 'markup') satis = m * (1 + o);
      else                   satis = o < 1 ? m / (1 - o) : 0;   // margin (oran<100)
      const kar = satis - m;
      const effMarkup = m > 0 ? (kar / m) * 100 : 0;
      const effMargin = satis > 0 ? (kar / satis) * 100 : 0;
      $('#marFiyat').textContent = money(satis) + ' ₺';
      $('#marKar').textContent   = money(kar) + ' ₺';
      $('#marNot').textContent =
        'üzerine ekleme ' + pct(effMarkup) + ' · kâr marjı ' + pct(effMargin);
    }

    $$('[data-mar]', root).forEach(btn => btn.addEventListener('click', () => {
      mode = btn.getAttribute('data-mar');
      $$('[data-mar]', root).forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      calc();
    }));
    root.addEventListener('input', calc);
    calc();
  }

  /* =====================================================================
     MODÜL 05 — Birim çevirici (3 bağımsız çevirim)
     a) adet ↔ koli ↔ palet   b) m² ↔ kutu   c) kg ↔ ton
     ===================================================================== */
  function initCevir() {
    const root = $('#mod05');
    if (!root) return;

    function calc() {
      // a) adet -> koli / palet
      const koliAdet  = Math.max(1, numOf($('#cvKoliAdet')));
      const paletKoli = Math.max(1, numOf($('#cvPaletKoli')));
      const adet = numOf($('#cvAdet'));
      const koli  = adet / koliAdet;
      const palet = adet / (koliAdet * paletKoli);
      $('#cvKoli').textContent = num(koli, 2) + ' koli · ' + num(palet, 2) + ' palet';

      // b) m² -> kutu (gereken = yukarı yuvarla)
      const kutuM2 = numOf($('#cvKutuM2'));
      const alan = numOf($('#cvAlan'));
      const kutu = kutuM2 > 0 ? alan / kutuM2 : 0;
      $('#cvKutu').textContent =
        kutuM2 > 0 ? num(kutu, 2) + ' kutu · ' + Math.ceil(kutu) + ' al' : '—';

      // c) kg -> ton
      const kg = numOf($('#cvKg'));
      $('#cvTon').textContent = num(kg / 1000, 3) + ' ton';
    }
    root.addEventListener('input', calc);
    calc();
  }

  /* ---------- başlat ---------- */
  [initMod01, initKdv, initIskonto, initMarj, initCevir].forEach(fn => {
    try { fn(); } catch (e) { /* bir modül bağımsız; biri patlarsa diğerleri çalışsın */ }
  });
})();
