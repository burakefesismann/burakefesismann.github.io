/* =====================================================================
   main.js — iki sayfada da ortak davranışlar
   · CAD artı imleç (fare koordinatı)
   · marka şeridini kusursuz döndürmek için ikinci kopyayı üret
   not: ızgara/çizilme/belirme animasyonları saf CSS'te.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- CAD artı imleç ---------- */
  var cross = document.querySelector('.crosshair');
  if (cross && !window.matchMedia('(hover:none)').matches) {
    var coord = cross.querySelector('.coord');
    addEventListener('mousemove', function (e) {
      cross.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
      if (coord) coord.textContent = 'x ' + e.clientX + ' · y ' + e.clientY;
      if (!cross.classList.contains('on')) cross.classList.add('on'); // ilk harekette belir
    }, { passive: true });
  }

  /* ---------- marka şeridi: ikinci kopya ----------
     HTML'de tek takım marka var (JS kapalıysa da görünür).
     Burada birebir kopyasını ekliyoruz; track genişliği 2 katına çıkar
     ve CSS translateX(-50%) ile başa kusursuz sarar.
     Kopya aria-hidden -> ekran okuyucu markaları iki kez okumaz. */
  var track = document.querySelector('.marquee__track');
  if (track) {
    var originals = Array.prototype.slice.call(track.children);
    originals.forEach(function (node) {
      var clone = node.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }

  /* ---------- antet'i marka şeridinin ÜSTÜNDE tut ----------
     Sabit (fixed) antet, sayfa sonuna inince marka şeridine binmesin;
     şerit görünüme girdikçe antet yukarı itilip barın hemen üstünde park eder.
     Sadece geniş ekranda (antet fixed iken) çalışır; dar ekranda statik. */
  var antet = document.querySelector('.antet--fixed');
  var marquee = document.querySelector('.marquee');
  if (antet && marquee) {
    var GAP = 24;      // şerit ile antet arası boşluk
    var MIN_BOTTOM = 96; // varsayılan (CSS ile aynı)
    var ticking = false;

    function placeAntet() {
      ticking = false;
      if (getComputedStyle(antet).position !== 'fixed') { antet.style.bottom = ''; return; }
      var mTop = marquee.getBoundingClientRect().top;
      var needed = window.innerHeight - mTop + GAP; // şerit yükseldikçe büyür
      antet.style.bottom = Math.max(MIN_BOTTOM, needed) + 'px';
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(placeAntet); } }

    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    placeAntet();
  }
})();
