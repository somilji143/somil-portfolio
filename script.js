// =====================================================
// Somil Srivastava — Portfolio v3
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const body = document.body;

  // ===== 1. PRELOADER =====
  const preloader = document.getElementById('preloader');
  const preCount = document.getElementById('pre-count');
  const preBarFill = document.getElementById('pre-bar-fill');

  function finishLoading() {
    body.classList.remove('is-loading');
    body.classList.add('loaded');
    setTimeout(() => preloader.remove(), 1000);
  }

  if (reducedMotion) {
    finishLoading();
  } else {
    const duration = 1500;
    const start = performance.now();

    (function countUp(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const pct = Math.round(eased * 100);
      preCount.textContent = pct;
      preBarFill.style.width = pct + '%';
      if (t < 1) {
        requestAnimationFrame(countUp);
      } else {
        setTimeout(finishLoading, 200);
      }
    })(start);
  }

  // ===== 2. NAV / PROGRESS / SECTION INDICATOR =====
  const nav = document.getElementById('nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const progress = document.getElementById('progress');
  const siCurrent = document.getElementById('si-current');
  const siFill = document.getElementById('si-fill');
  const sectionIds = ['about', 'work', 'skills', 'journey', 'contact'];

  let lastScrollY = window.scrollY;
  let marqueeSkew = 0;

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = docHeight > 0 ? y / docHeight : 0;
    progress.style.width = pageProgress * 100 + '%';
    siFill.style.height = pageProgress * 100 + '%';

    let current = '';
    sections.forEach(s => {
      if (y >= s.offsetTop - 220) current = s.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === current);
    });

    const idx = sectionIds.indexOf(current) + 1;
    siCurrent.textContent = String(idx).padStart(2, '0');

    // Marquee skew from scroll velocity
    if (!reducedMotion) {
      const velocity = y - lastScrollY;
      marqueeSkew = Math.max(-10, Math.min(10, velocity * 0.35));
    }
    lastScrollY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Marquee skew decay loop
  const marquees = document.querySelectorAll('.marquee');
  if (!reducedMotion && marquees.length) {
    (function decaySkew() {
      marqueeSkew *= 0.88;
      const s = Math.abs(marqueeSkew) < 0.05 ? 0 : marqueeSkew;
      marquees.forEach(m => { m.style.transform = `skewX(${s}deg)`; });
      requestAnimationFrame(decaySkew);
    })();
  }

  // ===== 3. MOBILE MENU =====
  const menuBtn = document.getElementById('menu-btn');
  const navLinksEl = document.getElementById('nav-links');

  menuBtn.addEventListener('click', () => {
    const open = navLinksEl.classList.toggle('open');
    menuBtn.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
  });

  navLinks.forEach(link => link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    menuBtn.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }));

  // ===== 4. SMOOTH ANCHOR SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ===== 5. SCROLL REVEAL =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ===== 6. SCRAMBLE / DECODE EFFECT =====
  const scrambleChars = '#@$%&*+=<>/\\{}[]01';

  function scramble(el) {
    const finalText = el.dataset.text;
    const len = finalText.length;
    let frame = 0;
    const totalFrames = Math.max(24, len * 1.6);

    (function step() {
      frame++;
      const revealCount = Math.floor((frame / totalFrames) * len);
      let out = '';
      for (let i = 0; i < len; i++) {
        if (i < revealCount || finalText[i] === ' ') {
          out += finalText[i];
        } else {
          out += scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }
      }
      el.textContent = out;
      if (revealCount < len) requestAnimationFrame(step);
      else el.textContent = finalText;
    })();
  }

  if (!reducedMotion) {
    const scrambleObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          scramble(entry.target);
          scrambleObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    document.querySelectorAll('.scramble').forEach(el => scrambleObserver.observe(el));
  }

  // ===== 7. COUNT-UP STATS =====
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const duration = 1600;
      const start = performance.now();

      (function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(tick);
      })(start);

      counterObserver.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.hstat-num').forEach(c => counterObserver.observe(c));

  // ===== 8. WORD ROTATOR =====
  const rotator = document.getElementById('word-rotator');
  if (rotator && !reducedMotion) {
    const words = rotator.querySelectorAll('.wr-word');
    let idx = 0;
    setInterval(() => {
      const current = words[idx];
      idx = (idx + 1) % words.length;
      const next = words[idx];
      current.classList.remove('is-active');
      current.classList.add('is-leaving');
      next.classList.remove('is-leaving');
      next.classList.add('is-active');
      setTimeout(() => current.classList.remove('is-leaving'), 650);
    }, 2800);
  }

  // ===== 9. CUSTOM CURSOR (dot + trailing ring) =====
  const ring = document.getElementById('cursor-ring');
  const dot = document.getElementById('cursor-dot');

  if (finePointer && !reducedMotion) {
    let rx = -100, ry = -100, tx = -100, ty = -100;
    let visible = false;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX;
      ty = e.clientY;
      dot.style.left = tx + 'px';
      dot.style.top = ty + 'px';
      if (!visible) {
        ring.style.opacity = '1';
        dot.style.opacity = '1';
        visible = true;
      }
    });

    document.addEventListener('mouseleave', () => {
      ring.style.opacity = '0';
      dot.style.opacity = '0';
      visible = false;
    });

    (function animateRing() {
      rx += (tx - rx) * 0.16;
      ry += (ty - ry) * 0.16;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('a, button, .work-row, .fg-text').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('is-active');
        dot.classList.add('is-active');
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('is-active');
        dot.classList.remove('is-active');
      });
    });
  }

  // ===== 10. WORK ROW PREVIEW CARD =====
  const preview = document.getElementById('work-preview');
  const wpIdx = document.getElementById('wp-idx');
  const wpCta = preview ? preview.querySelector('.wp-cta') : null;
  const workRows = document.querySelectorAll('.work-row');

  if (preview && finePointer && !reducedMotion) {
    let px = 0, py = 0, ptx = 0, pty = 0;
    let previewActive = false;

    workRows.forEach(row => {
      row.addEventListener('mouseenter', () => {
        wpIdx.textContent = row.dataset.idx;
        wpCta.textContent = row.dataset.label;
        preview.classList.add('is-visible');
        previewActive = true;
      });
      row.addEventListener('mouseleave', () => {
        preview.classList.remove('is-visible');
        previewActive = false;
      });
      row.addEventListener('mousemove', (e) => {
        ptx = e.clientX + 130;
        pty = e.clientY - 20;
      });
    });

    (function animatePreview() {
      px += (ptx - px) * 0.12;
      py += (pty - py) * 0.12;
      preview.style.left = px + 'px';
      preview.style.top = py + 'px';
      requestAnimationFrame(animatePreview);
    })();
  }

  // ===== 11. MAGNETIC ELEMENTS =====
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  // ===== 12. PORTRAIT TILT + SCROLL PARALLAX =====
  const portrait = document.getElementById('portrait');
  const heroVisual = document.querySelector('.hero-visual');

  if (portrait && finePointer && !reducedMotion) {
    portrait.addEventListener('mousemove', (e) => {
      const rect = portrait.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      portrait.style.transform =
        `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
    });
    portrait.addEventListener('mouseleave', () => { portrait.style.transform = ''; });
  }

  if (heroVisual && !reducedMotion) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroVisual.style.transform = `translateY(${y * 0.1}px)`;
      }
    }, { passive: true });
  }

  // ===== 13. LOCAL TIME (Asia/Kolkata) =====
  const timeEl = document.getElementById('local-time');

  function updateTime() {
    timeEl.textContent = new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true, timeZone: 'Asia/Kolkata'
    }).format(new Date());
  }

  updateTime();
  setInterval(updateTime, 1000);

  // ===== 14. BACK TO TOP =====
  document.getElementById('to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

});
