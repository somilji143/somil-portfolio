// =====================================================
// Somil Srivastava — Premium Portfolio Script
// =====================================================

document.addEventListener('DOMContentLoaded', () => {

  // ===== 1. PARTICLE CANVAS BACKGROUND =====
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -9999, y: -9999 };
  const PARTICLE_COUNT = 100;
  const CONNECT_DIST = 140;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 1.8 + 0.4;
      this.baseOpacity = Math.random() * 0.4 + 0.1;
      this.opacity = this.baseOpacity;
      const colors = ['0, 229, 255', '124, 77, 255', '224, 64, 251', '68, 138, 255'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulseOffset = Math.random() * Math.PI * 2;
    }

    update(time) {
      this.x += this.vx;
      this.y += this.vy;

      // Pulse opacity
      this.opacity = this.baseOpacity + Math.sin(time * this.pulseSpeed + this.pulseOffset) * 0.15;

      // Wrap around
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.y < -10) this.y = canvas.height + 10;
      if (this.y > canvas.height + 10) this.y = -10;

      // Mouse interaction
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150;
        this.x += dx * force * 0.03;
        this.y += dy * force * 0.03;
        this.opacity = Math.min(this.opacity + force * 0.3, 0.8);
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(PARTICLE_COUNT, Math.floor(canvas.width * canvas.height / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECT_DIST) {
          const opacity = (1 - dist / CONNECT_DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);

          const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
          gradient.addColorStop(0, `rgba(${particles[i].color}, ${opacity})`);
          gradient.addColorStop(1, `rgba(${particles[j].color}, ${opacity})`);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  let animTime = 0;
  function animateParticles() {
    animTime++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update(animTime);
      p.draw();
    });
    drawConnections();
    requestAnimationFrame(animateParticles);
  }

  resizeCanvas();
  initParticles();
  animateParticles();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeCanvas();
      initParticles();
    }, 200);
  });

  // ===== 2. MOUSE GLOW EFFECT =====
  const mouseGlow = document.getElementById('mouse-glow');
  let glowX = 0, glowY = 0, targetGlowX = 0, targetGlowY = 0;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    targetGlowX = e.clientX;
    targetGlowY = e.clientY;
    mouseGlow.style.opacity = '1';
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
    mouseGlow.style.opacity = '0';
  });

  function animateGlow() {
    glowX += (targetGlowX - glowX) * 0.08;
    glowY += (targetGlowY - glowY) * 0.08;
    mouseGlow.style.left = glowX + 'px';
    mouseGlow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  // ===== 3. SCROLL PROGRESS BAR =====
  const scrollProgress = document.getElementById('scroll-progress');

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  }

  // ===== 4. TYPING EFFECT =====
  const typedEl = document.getElementById('typed-text');
  const phrases = [
    'Full-Stack Java Developer',
    'Marketplace Entrepreneur',
    'Turning Code into Commerce',
    'Building Digital Platforms',
    'MCA @ Amity University'
  ];
  let phraseIdx = 0, charIdx = 0, isDeleting = false, typeSpeed = 80;

  function typeWriter() {
    const current = phrases[phraseIdx];

    if (isDeleting) {
      typedEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      typeSpeed = 35;
    } else {
      typedEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      typeSpeed = 70 + Math.random() * 30;
    }

    if (!isDeleting && charIdx === current.length) {
      typeSpeed = 2500;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      typeSpeed = 500;
    }

    setTimeout(typeWriter, typeSpeed);
  }

  setTimeout(typeWriter, 800);

  // ===== 5. NAVBAR =====
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateNav() {
    // Scroll class
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    // Active link
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 150;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // ===== 6. BACK TO TOP =====
  const backToTop = document.getElementById('back-to-top');

  function updateBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Combined scroll handler
  window.addEventListener('scroll', () => {
    updateScrollProgress();
    updateNav();
    updateBackToTop();
  }, { passive: true });

  // ===== 7. MOBILE NAV TOGGLE =====
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-links');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navMenu.classList.remove('open');
    });
  });

  // ===== 8. SCROLL REVEAL (IntersectionObserver) =====
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // ===== 9. SKILL BARS ANIMATION =====
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        requestAnimationFrame(() => {
          bar.style.width = width + '%';
          bar.classList.add('animated');
        });
        skillObserver.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => skillObserver.observe(bar));

  // ===== 10. COUNTER ANIMATION =====
  const counters = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'));
        let count = 0;
        const duration = 1800;
        const steps = 60;
        const increment = target / steps;
        let step = 0;

        function easeOutCubic(t) {
          return 1 - Math.pow(1 - t, 3);
        }

        const timer = setInterval(() => {
          step++;
          const progress = easeOutCubic(step / steps);
          count = Math.round(target * progress);

          if (step >= steps) {
            count = target;
            clearInterval(timer);
          }
          el.textContent = count + '+';
        }, duration / steps);

        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  // ===== 11. SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ===== 12. 3D TILT ON PROJECT CARDS =====
  const projectCards = document.querySelectorAll('.project-item');

  projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * 6;
      const rotateY = ((centerX - x) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });

  // ===== 13. MAGNETIC BUTTONS =====
  const magneticBtns = document.querySelectorAll('.btn');

  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-3px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });

  // ===== 14. TECH CHIP RANDOM GLOW =====
  const techChips = document.querySelectorAll('.tech-chip');
  const chipColors = ['#00e5ff', '#7c4dff', '#e040fb', '#00e676', '#448aff', '#ff6d00'];

  techChips.forEach(chip => {
    chip.addEventListener('mouseenter', () => {
      const color = chipColors[Math.floor(Math.random() * chipColors.length)];
      chip.style.borderColor = color;
      chip.style.color = color;
      chip.style.boxShadow = `0 0 20px ${color}33, 0 8px 24px ${color}1a`;
    });

    chip.addEventListener('mouseleave', () => {
      chip.style.borderColor = '';
      chip.style.color = '';
      chip.style.boxShadow = '';
    });
  });

  // ===== 15. PARALLAX FLOATING SHAPES =====
  const shapes = document.querySelectorAll('.shape');

  window.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;

    shapes.forEach((shape, i) => {
      const depth = (i + 1) * 8;
      shape.style.transform += ` translate(${mx * depth}px, ${my * depth}px)`;
    });
  });

  // ===== 16. ORBIT ICON TOOLTIPS =====
  const orbitIcons = document.querySelectorAll('.orbit-icon');
  orbitIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.style.transform = 'scale(1.2) rotate(10deg)';
      icon.style.boxShadow = '0 12px 36px rgba(0, 229, 255, 0.25)';
    });
    icon.addEventListener('mouseleave', () => {
      icon.style.transform = '';
      icon.style.boxShadow = '';
    });
  });

});
