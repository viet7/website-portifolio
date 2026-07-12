/* Estêvão Souza · portfólio audiovisual
   Motion contido: IntersectionObserver para nav e reveals (sem scroll listeners). */

/* ---- Anos de estrada (calculado, nunca fica desatualizado) ---- */
const yearsEl = document.getElementById('yearsActive');
if (yearsEl) yearsEl.textContent = String(new Date().getFullYear() - 2018);

/* ---- Menu mobile ---- */
const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

menuToggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  mobileMenu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
});
mobileMenu?.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
  })
);

/* ---- Nav: borda ao sair do topo (sentinela + IntersectionObserver) ---- */
const sentinel = document.createElement('div');
sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;';
document.body.prepend(sentinel);
new IntersectionObserver(
  ([e]) => nav.classList.toggle('is-stuck', !e.isIntersecting),
  { threshold: 0 }
).observe(sentinel);

/* ---- Reveals on enter ---- */
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);
reveals.forEach((el) => revealObserver.observe(el));

/* ---- Hover-autoplay nos cards (Trabalhos e Séries) ---- */
(() => {
  const canHover = matchMedia('(hover: hover)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduce) return; // no toque ou reduced-motion: fica só a imagem + lightbox
  document.querySelectorAll('.work, .serie').forEach((card) => {
    const vid = card.querySelector('video.card-vid[data-src]');
    if (!vid) return;
    let loaded = false;
    card.addEventListener('mouseenter', () => {
      if (!loaded) { vid.src = vid.dataset.src; loaded = true; }
      card.classList.add('is-previewing');
      vid.play().catch(() => {});
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('is-previewing');
      vid.pause();
    });
  });
})();

/* ---- Carrossel de séries (scroll-snap horizontal) ---- */
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.series__track');
  const prev = carousel.querySelector('[data-prev]');
  const next = carousel.querySelector('[data-next]');
  if (!track || !prev || !next) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = () => Math.min(track.clientWidth * 0.8, 640);
  const update = () => {
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }));
  track.addEventListener('scroll', update, { passive: true });
  new ResizeObserver(update).observe(track);
  update();
});

/* ---- Coleções das Séries (galerias abertas no lightbox) ----
   seq() monta uma sequência numerada slug-01..slug-N com a mesma legenda. */
const seq = (slug, n, cap) =>
  Array.from({ length: n }, (_, i) => ({
    src: `images/web/${slug}-${String(i + 1).padStart(2, '0')}.jpg`,
    cap,
  }));

const galleries = {
  grutas: [
    { src: 'images/web/gruta-lapinha-01.jpg', cap: 'Gruta da Lapinha, Serra do Cipó' },
    { src: 'images/web/gruta-lapinha-02.jpg', cap: 'Gruta da Lapinha, Serra do Cipó' },
    { src: 'images/web/gruta-lapinha-03.jpg', cap: 'Gruta da Lapinha, Serra do Cipó' },
    { src: 'images/web/gruta-maquine-01.jpg', cap: 'Gruta de Maquiné, Cordisburgo' },
    { src: 'images/web/gruta-maquine-02.jpg', cap: 'Gruta de Maquiné, Cordisburgo' },
    { src: 'images/web/gruta-maquine-03.jpg', cap: 'Gruta de Maquiné, Cordisburgo' },
    { src: 'images/web/gruta-rei-do-mato-01.jpg', cap: 'Gruta Rei do Mato, Sete Lagoas' },
  ],
  montanhas: [
    { src: 'images/web/itatiaia-arco.jpg', cap: 'Parque Nacional do Itatiaia' },
    { src: 'images/web/itatiaia-trilha.jpg', cap: 'Parque Nacional do Itatiaia' },
    { src: 'images/web/itatiaia-pico.jpg', cap: 'Parque Nacional do Itatiaia' },
    { src: 'images/web/itatiaia-vale.jpg', cap: 'Parque Nacional do Itatiaia' },
    { src: 'images/web/insbruck-pico.jpg', cap: 'Alpes, Innsbruck' },
    { src: 'images/web/insbruck-cume.jpg', cap: 'Alpes, Innsbruck' },
    { src: 'images/web/dolomitas-01.jpg', cap: 'Dolomitas, Itália' },
    { src: 'images/web/dolomitas-02.jpg', cap: 'Dolomitas, Itália' },
    { src: 'images/web/dolomitas-03.jpg', cap: 'Dolomitas, Itália' },
    { src: 'images/web/dolomitas-04.jpg', cap: 'Dolomitas, Itália' },
    { src: 'images/web/dolomitas-05.jpg', cap: 'Dolomitas, Itália' },
  ],
  fortezza: seq('fortezza', 25, 'Forte di Fortezza, Itália'),
  insbruck: seq('insbruck', 11, 'Innsbruck, Áustria'),
  milao: seq('milao', 13, 'Milão, Itália'),
  munique: seq('munique', 22, 'Munique, Alemanha'),
  veneza: seq('veneza', 14, 'Veneza, Itália'),
};

/* ---- Lightbox (imagem única ou galeria navegável) ---- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox?.querySelector('.lightbox__img');
const lightboxCap = lightbox?.querySelector('.lightbox__cap');
const lightboxPrev = lightbox?.querySelector('.lightbox__prev');
const lightboxNext = lightbox?.querySelector('.lightbox__next');
const lightboxCounter = lightbox?.querySelector('.lightbox__counter');
let lastFocused = null;
let lbItems = [];
let lbIndex = 0;

function renderLightbox() {
  const item = lbItems[lbIndex];
  if (!item) return;
  lightboxImg.src = item.src;
  lightboxImg.alt = item.alt || item.cap || '';
  lightboxCap.textContent = item.cap || '';
  const multi = lbItems.length > 1;
  lightboxPrev.hidden = !multi;
  lightboxNext.hidden = !multi;
  lightboxCounter.textContent = multi ? `${lbIndex + 1} / ${lbItems.length}` : '';
  // pré-carrega as vizinhas para navegação instantânea
  if (multi) {
    [1, -1].forEach((dir) => {
      const neighbor = lbItems[(lbIndex + dir + lbItems.length) % lbItems.length];
      new Image().src = neighbor.src;
    });
  }
}
function openLightbox(items, startIndex) {
  if (!lightbox || !items.length) return;
  lastFocused = document.activeElement;
  lbItems = items;
  lbIndex = startIndex || 0;
  renderLightbox();
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  document.querySelectorAll('video.card-vid').forEach((v) => v.pause());
  lightbox.querySelector('.lightbox__close')?.focus();
}
function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  lightboxImg.removeAttribute('src'); // src='' dispararia request espúrio em alguns browsers
  lbItems = [];
  document.body.style.overflow = '';
  lastFocused?.focus();
}
function stepLightbox(dir) {
  if (lbItems.length < 2) return;
  lbIndex = (lbIndex + dir + lbItems.length) % lbItems.length;
  renderLightbox();
}

// imagens únicas (Trabalhos, Frames)
document.querySelectorAll('[data-full]').forEach((el) => {
  el.addEventListener('click', () => {
    const img = el.querySelector('img');
    openLightbox([{ src: el.dataset.full, cap: el.dataset.cap, alt: img?.alt }], 0);
  });
});
// galerias temáticas (Séries) — a contagem de fotos vem do próprio objeto
// galleries, para o HTML nunca ficar defasado ao adicionar/remover fotos
document.querySelectorAll('[data-gallery]').forEach((el) => {
  const set = galleries[el.dataset.gallery];
  if (!set) return;
  const count = el.querySelector('.serie__count');
  if (count) count.textContent = `${set.length} fotos`;
  el.addEventListener('click', () => openLightbox(set, 0));
});

lightboxPrev?.addEventListener('click', () => stepLightbox(-1));
lightboxNext?.addEventListener('click', () => stepLightbox(1));
lightbox?.querySelector('.lightbox__close')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (lightbox?.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  else if (e.key === 'ArrowLeft') stepLightbox(-1);
  else if (e.key === 'ArrowRight') stepLightbox(1);
});
// trap de foco: só os botões visíveis do diálogo recebem Tab
lightbox?.addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return;
  const focusables = [...lightbox.querySelectorAll('button')].filter((b) => !b.hidden);
  if (!focusables.length) return;
  e.preventDefault();
  const i = focusables.indexOf(document.activeElement);
  const nextI = i === -1
    ? (e.shiftKey ? focusables.length - 1 : 0) // foco fora dos botões: entra pela ponta certa
    : (i + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length;
  focusables[nextI].focus();
});

/* ---- Dissuasão de download das fotos: bloqueia o menu "Salvar imagem"
   sobre mídia e no lightbox. Não é proteção real (print e DevTools sempre
   funcionam) — para isso, marca d'água ou servir resolução menor. ---- */
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('img, video, .lightbox')) e.preventDefault();
});

/* ---- Links de rede social ainda sem URL definida: não navegar ---- */
document.querySelectorAll('[data-placeholder]').forEach((a) => {
  a.addEventListener('click', (e) => e.preventDefault());
});

/* ---- Copiar e-mail (fallback: mailto só abre com cliente configurado) ---- */
document.querySelectorAll('[data-copy-email]').forEach((btn) => {
  const status = btn.closest('.contact__inner')?.querySelector('.copy-btn__status');
  let resetTimer;
  btn.addEventListener('click', async () => {
    const email = btn.dataset.copyEmail;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      if (status) status.textContent = 'Não foi possível copiar automaticamente.';
      return;
    }
    btn.classList.add('is-copied');
    btn.setAttribute('aria-label', 'E-mail copiado');
    if (status) status.textContent = 'E-mail copiado para a área de transferência.';
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      btn.classList.remove('is-copied');
      btn.setAttribute('aria-label', 'Copiar e-mail');
    }, 2200);
  });
});

/* ---- Player do reel (click to play, carrega só no clique) ---- */
document.querySelectorAll('[data-player]').forEach((frame) => {
  const video = frame.querySelector('video');
  const btn = frame.querySelector('.play');
  btn?.addEventListener('click', () => {
    frame.classList.add('is-playing');
    video.setAttribute('controls', '');
    // o atributo muted existe só para permitir preload silencioso;
    // quando a pessoa aperta play, o reel toca com som
    video.muted = false;
    video.play().catch(() => {});
  });
});

/* ---- Reduced motion: vídeo de fundo não toca sozinho ---- */
if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('video[autoplay]').forEach((v) => {
    v.removeAttribute('autoplay');
    v.pause();
  });
}
