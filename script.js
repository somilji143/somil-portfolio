// =====================================================
// Somil Srivastava — Portfolio v4
// GSAP + ScrollTrigger + Lenis + WebGL, with full
// vanilla fallbacks if any library fails to load.
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const body = document.body;

  const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  const useGSAP = hasGSAP && !reducedMotion;
  const useLenis = typeof Lenis !== 'undefined' && !reducedMotion && finePointer;

  if (useGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('gsap-on');
  }

  // ===== LENIS SMOOTH SCROLL =====
  let lenis = null;
  if (useLenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (useGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })(0);
    }
  }

  function scrollToTarget(target, offset = -90) {
    if (lenis) {
      lenis.scrollTo(target, { offset, duration: 1.4 });
    } else {
      const top = (typeof target === 'number')
        ? target
        : target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  }

  // ===== CHARACTER SPLITTER =====
  function splitChars(el) {
    const walk = (node) => {
      [...node.childNodes].forEach(child => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split('').forEach(ch => {
            const s = document.createElement('span');
            s.className = 'char';
            s.textContent = ch === ' ' ? '\u00A0' : ch;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else {
          walk(child);
        }
      });
    };
    walk(el);
    return el.querySelectorAll('.char');
  }

  // ===== GSAP INITIAL STATES + HERO INTRO =====
  let heroIntro = null;

  if (useGSAP) {
    const heroChars = [];
    document.querySelectorAll('.ht-inner').forEach(line => {
      heroChars.push(splitChars(line));
    });

    gsap.set('.hero-eyebrow', { autoAlpha: 0, y: 26 });
    heroChars.forEach(chars => gsap.set(chars, { yPercent: 120 }));
    gsap.set(['.hero-sub', '.hero-actions', '.hero-stats'], { autoAlpha: 0, y: 30 });
    gsap.set('.hero-visual', { autoAlpha: 0, scale: 0.92, y: 24 });
    gsap.set('.hero-scroll', { autoAlpha: 0 });

    heroIntro = gsap.timeline({ paused: true, defaults: { ease: 'power4.out' } });
    heroIntro
      .to('.hero-eyebrow', { autoAlpha: 1, y: 0, duration: 0.8 }, 0)
      .to(heroChars[0], { yPercent: 0, duration: 1.1, stagger: 0.028 }, 0.08)
      .to(heroChars[1], { yPercent: 0, duration: 1.1, stagger: 0.028 }, 0.22)
      .to('.hero-visual', { autoAlpha: 1, scale: 1, y: 0, duration: 1.2, ease: 'power3.out' }, 0.25)
      .to('.hero-sub', { autoAlpha: 1, y: 0, duration: 0.9 }, 0.55)
      .to('.hero-actions', { autoAlpha: 1, y: 0, duration: 0.9 }, 0.68)
      .to('.hero-stats', { autoAlpha: 1, y: 0, duration: 0.9 }, 0.8)
      .to('.hero-scroll', { autoAlpha: 1, duration: 0.8 }, 1.1);
  }

  // ===== PRELOADER =====
  const preloader = document.getElementById('preloader');
  const preCount = document.getElementById('pre-count');
  const preBarFill = document.getElementById('pre-bar-fill');

  function finishLoading() {
    body.classList.remove('is-loading');
    body.classList.add('loaded');
    if (heroIntro) heroIntro.play();
    setTimeout(() => preloader.remove(), 1000);
  }

  if (reducedMotion) {
    finishLoading();
  } else {
    const duration = 1500;
    const start = performance.now();
    (function countUp(now) {
      const t = Math.min((now - start) / duration, 1);
      const pct = Math.round((1 - Math.pow(1 - t, 4)) * 100);
      preCount.textContent = pct;
      preBarFill.style.width = pct + '%';
      if (t < 1) requestAnimationFrame(countUp);
      else setTimeout(finishLoading, 200);
    })(start);
  }

  // ===== NAV / PROGRESS / SECTION INDICATOR =====
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
    sections.forEach(s => { if (y >= s.offsetTop - 220) current = s.id; });
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.section === current));
    siCurrent.textContent = String(sectionIds.indexOf(current) + 1).padStart(2, '0');

    if (!reducedMotion) {
      marqueeSkew = Math.max(-10, Math.min(10, (y - lastScrollY) * 0.35));
    }
    lastScrollY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const marquees = document.querySelectorAll('.marquee');
  if (!reducedMotion && marquees.length) {
    (function decaySkew() {
      marqueeSkew *= 0.88;
      const s = Math.abs(marqueeSkew) < 0.05 ? 0 : marqueeSkew;
      marquees.forEach(m => { m.style.transform = `skewX(${s}deg)`; });
      requestAnimationFrame(decaySkew);
    })();
  }

  // ===== MOBILE MENU =====
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

  // ===== ANCHOR SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target);
    });
  });

  // ===== SCROLL REVEALS =====
  if (useGSAP) {
    // Generic reveal cards/rows — masked title lines ride along
    const reveals = gsap.utils.toArray('.reveal');
    gsap.set(reveals, { autoAlpha: 0, y: 48 });
    // y:0 clears the px offset GSAP parses from the stylesheet's translateY(115%)
    gsap.set('.line-inner', { y: 0, yPercent: 115 });

    ScrollTrigger.batch(reveals, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1, overwrite: true
        });
        batch.forEach(el => {
          const inners = el.querySelectorAll('.line-inner');
          if (inners.length) {
            gsap.to(inners, {
              yPercent: 0, duration: 1.1, ease: 'power4.out', stagger: 0.12, overwrite: true
            });
          }
        });
      }
    });

    // Scrub parallax: hero visual drifts as you scroll away
    gsap.to('.hero-visual', {
      yPercent: 14, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });

    // Footer signature rises in
    gsap.from('.fg-text', {
      yPercent: 60, autoAlpha: 0, ease: 'power2.out',
      scrollTrigger: { trigger: '.footer-giant', start: 'top 96%', end: 'top 60%', scrub: true }
    });
  } else {
    // Vanilla fallback
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  }

  // ===== SCRAMBLE / DECODE =====
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
        out += (i < revealCount || finalText[i] === ' ')
          ? finalText[i]
          : scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
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

  // ===== COUNT-UP STATS =====
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

  // ===== WORD ROTATOR =====
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

  // ===== CUSTOM CURSOR =====
  const ring = document.getElementById('cursor-ring');
  const dot = document.getElementById('cursor-dot');

  if (finePointer && !reducedMotion) {
    let rx = -100, ry = -100, tx = -100, ty = -100;
    let visible = false;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
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

  // ===== WORK ROW PREVIEW =====
  const preview = document.getElementById('work-preview');
  const wpIdx = document.getElementById('wp-idx');
  const wpCta = preview ? preview.querySelector('.wp-cta') : null;

  if (preview && finePointer && !reducedMotion) {
    let px = 0, py = 0, ptx = 0, pty = 0;

    document.querySelectorAll('.work-row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        wpIdx.textContent = row.dataset.idx;
        wpCta.textContent = row.dataset.label;
        preview.classList.add('is-visible');
      });
      row.addEventListener('mouseleave', () => preview.classList.remove('is-visible'));
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

  // ===== MAGNETIC ELEMENTS =====
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.magnetic').forEach(el => {
      if (useGSAP) {
        const qx = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' });
        const qy = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' });
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          qx((e.clientX - rect.left - rect.width / 2) * 0.22);
          qy((e.clientY - rect.top - rect.height / 2) * 0.22);
        });
        el.addEventListener('mouseleave', () => { qx(0); qy(0); });
      } else {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
      }
    });
  }

  // ===== PORTRAIT TILT =====
  const portrait = document.getElementById('portrait');
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

  // Fallback hero parallax when GSAP is unavailable
  if (!useGSAP && !reducedMotion) {
    const heroVisual = document.querySelector('.hero-visual');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroVisual.style.transform = `translateY(${y * 0.1}px)`;
      }
    }, { passive: true });
  }

  // ===== WEBGL SHADER BACKGROUND (hero) =====
  (function initShader() {
    if (reducedMotion) return;
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) return; // graceful: CSS gradients remain

    const vsSource = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform vec2 u_mouse;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = p * 2.05 + vec2(13.7, 7.3);
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_res;
        vec2 p = uv * vec2(u_res.x / u_res.y, 1.0);

        float t = u_time * 0.045;
        vec2 drift = vec2(t * 0.6, -t * 0.35);

        float n = fbm(p * 1.6 + drift + fbm(p * 2.2 - drift) * 0.6);

        // Mouse adds a soft local lift
        vec2 m = u_mouse / u_res;
        m.x *= u_res.x / u_res.y;
        float md = 1.0 - smoothstep(0.0, 0.55, distance(p, m));
        n += md * 0.12;

        // Palette: deep charcoal -> lime glow in sparse pockets
        vec3 base = vec3(0.043, 0.043, 0.051);
        vec3 lime = vec3(0.851, 0.949, 0.310);

        float glow = smoothstep(0.62, 0.95, n);
        vec3 col = base + lime * glow * 0.14;

        // Vignette so edges stay dark
        float vig = smoothstep(1.15, 0.35, distance(uv, vec2(0.5, 0.45)));
        col = mix(base, col, vig);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type, src) {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null;
      return sh;
    }

    const vs = compile(gl.VERTEX_SHADER, vsSource);
    const fs = compile(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    let mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouseX = (e.clientX - r.left) * (canvas.width / r.width);
      mouseY = (r.height - (e.clientY - r.top)) * (canvas.height / r.height);
    });

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr * 0.75));
      canvas.height = Math.max(1, Math.round(r.height * dpr * 0.75));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    // Only render while the hero is on screen
    let heroVisible = true;
    new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
    }).observe(canvas);

    const t0 = performance.now();
    (function frame(now) {
      if (heroVisible) {
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, (now - t0) / 1000);
        gl.uniform2f(uMouse, mouseX, mouseY);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      requestAnimationFrame(frame);
    })(t0);
  })();

  // ===== LOCAL TIME =====
  const timeEl = document.getElementById('local-time');
  function updateTime() {
    timeEl.textContent = new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: true, timeZone: 'Asia/Kolkata'
    }).format(new Date());
  }
  updateTime();
  setInterval(updateTime, 1000);

  // ===== BACK TO TOP =====
  document.getElementById('to-top').addEventListener('click', () => scrollToTarget(0, 0));

});
