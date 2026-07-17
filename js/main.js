// JUDICAS — interacciones compartidas
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menú móvil ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const icon = toggle.querySelector('i');
      if (icon) { icon.classList.toggle('fa-bars'); icon.classList.toggle('fa-xmark'); }
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  /* ---------- Sombra de navbar al hacer scroll ---------- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(43,26,16,0.08)' : 'none';
    }, { passive: true });
  }

  /* ---------- Scroll reveal ---------- */
  const revealables = document.querySelectorAll('[data-reveal]');
  if (revealables.length) {
    // Escalonado automático por grupos (mismo padre = mismo stagger)
    const groups = new Map();
    revealables.forEach(el => {
      const parent = el.parentElement;
      const list = groups.get(parent) || [];
      list.push(el);
      groups.set(parent, list);
    });
    groups.forEach(list => {
      list.forEach((el, i) => el.style.setProperty('--reveal-delay', `${Math.min(i * 0.12, 0.5)}s`));
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealables.forEach(el => el.classList.add('visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealables.forEach(el => io.observe(el));
    }
  }

  /* ---------- Parallax sutil en el hero ---------- */
  const heroVisual = document.querySelector('.hero-visual');
  if (heroVisual && !reduceMotion && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const offset = Math.min(window.scrollY * 0.06, 40);
      heroVisual.style.transform = `translateY(${offset}px)`;
    }, { passive: true });
  }

  /* ---------- Galerías de catálogo + Lightbox ---------- */
  const galleries = document.querySelectorAll('.catalogo-gallery');
  if (galleries.length) {
    const lightbox = document.getElementById('lightbox');
    const lbFrame = lightbox ? lightbox.querySelector('.lightbox-images') : null;
    const lbCount = lightbox ? lightbox.querySelector('.lightbox-count') : null;
    const lbDownload = lightbox ? lightbox.querySelector('.lightbox-download') : null;
    let lbImages = [];
    let lbIndex = 0;

    function renderLightbox() {
      if (!lbFrame) return;
      lbFrame.querySelectorAll('img').forEach((img, i) => img.classList.toggle('active', i === lbIndex));
      if (lbCount) lbCount.textContent = `${lbIndex + 1} / ${lbImages.length}`;
    }
    function openLightbox(images, startIndex, pdfHref) {
      if (!lightbox) return;
      lbImages = images;
      lbIndex = startIndex;
      lbFrame.innerHTML = images.map(src => `<img src="${src}" alt="Página del catálogo">`).join('');
      if (lbDownload && pdfHref) lbDownload.href = pdfHref;
      renderLightbox();
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    if (lightbox) {
      lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
      lightbox.querySelector('.lightbox-prev').addEventListener('click', () => { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; renderLightbox(); });
      lightbox.querySelector('.lightbox-next').addEventListener('click', () => { lbIndex = (lbIndex + 1) % lbImages.length; renderLightbox(); });
      document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbImages.length; renderLightbox(); }
        if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; renderLightbox(); }
      });
    }

    galleries.forEach(gallery => {
      const imgs = Array.from(gallery.querySelectorAll('img'));
      const dots = Array.from(gallery.querySelectorAll('.dot'));
      const pdfHref = gallery.dataset.pdf;
      let current = 0;
      let timer = null;

      function show(i) {
        current = (i + imgs.length) % imgs.length;
        imgs.forEach((img, idx) => img.classList.toggle('active', idx === current));
        dots.forEach((d, idx) => d.classList.toggle('active', idx === current));
      }
      function start() {
        if (reduceMotion) return;
        stop();
        timer = setInterval(() => show(current + 1), 3200);
      }
      function stop() { if (timer) clearInterval(timer); }

      show(0);
      start();
      gallery.addEventListener('mouseenter', stop);
      gallery.addEventListener('mouseleave', start);

      dots.forEach((dot, idx) => {
        dot.addEventListener('click', (e) => { e.stopPropagation(); show(idx); });
      });

      gallery.addEventListener('click', () => {
        const srcs = imgs.map(img => img.getAttribute('src'));
        openLightbox(srcs, current, pdfHref);
      });
    });
  }
});
