/* ============================================================
   Cards Diary – JavaScript
   Handles: Canvas (sparkles + hearts), Navbar, Scroll animations,
            Testimonial slider, Mobile nav
   ============================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. HERO CANVAS – Sparkles + Floating Hearts
  ───────────────────────────────────────── */
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');

  const PINK = '#F8C8DC';
  const RED = '#8B0000';
  const WHITE = '#FFFFFF';

  let W, H;
  const particles = [];
  const hearts = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  /* --- Sparkle particle --- */
  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 2.4 + 0.4;
      this.vy = -(Math.random() * 0.5 + 0.2);
      this.vx = (Math.random() - 0.5) * 0.3;
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.6 + 0.2;
      this.fade = Math.random() > 0.5 ? 1 : -1;
      this.fadeSpeed = Math.random() * 0.012 + 0.005;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.alpha += this.fadeSpeed * this.fade;

      if (this.alpha >= this.maxAlpha) { this.fade = -1; }
      if (this.alpha <= 0) { this.reset(); }
      if (this.y < -10) { this.y = H + 10; }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.fillStyle = WHITE;
      ctx.shadowColor = WHITE;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /* --- Heart outline --- */
  class Heart {
    constructor() { this.reset(); }

    reset() {
      this.x = Math.random() * W;
      this.y = H + 60;
      this.size = Math.random() * 28 + 10;
      this.speed = Math.random() * 0.6 + 0.15;
      this.alpha = Math.random() * 0.18 + 0.04;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.rot = (Math.random() - 0.5) * 0.015;
      this.angle = 0;
    }

    heartPath(cx, cy, s) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.bezierCurveTo(cx, cy - s * 0.3, cx - s * 0.6, cy - s * 0.7, cx - s * 0.6, cy - s * 0.35);
      ctx.bezierCurveTo(cx - s * 0.6, cy - s * 0.8, cx, cy - s * 0.9, cx, cy - s * 0.55);
      ctx.bezierCurveTo(cx, cy - s * 0.9, cx + s * 0.6, cy - s * 0.8, cx + s * 0.6, cy - s * 0.35);
      ctx.bezierCurveTo(cx + s * 0.6, cy - s * 0.7, cx, cy - s * 0.3, cx, cy);
    }

    update() {
      this.y -= this.speed;
      this.x += this.vx;
      this.angle += this.rot;
      if (this.y < -80) this.reset();
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      this.heartPath(0, 0, this.size);
      ctx.strokeStyle = RED;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    }
  }

  /* Initialise */
  for (let i = 0; i < 90; i++) {
    const p = new Particle();
    p.y = Math.random() * H;
    p.alpha = Math.random() * p.maxAlpha;
    particles.push(p);
  }

  for (let i = 0; i < 22; i++) {
    const h = new Heart();
    h.y = Math.random() * H;
    hearts.push(h);
  }

  // Mouse interaction
  let mouse = { x: undefined, y: undefined };
  let lastSpawn = 0;

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;

    // Spawn new hearts near mouse periodically
    const now = Date.now();
    if (now - lastSpawn > 100) {
      const h = new Heart();
      h.x = mouse.x + (Math.random() * 40 - 20);
      h.y = mouse.y + (Math.random() * 40 - 20);
      h.size = Math.random() * 15 + 10;
      h.alpha = Math.random() * 0.4 + 0.2; // Brighter when spawned by mouse
      hearts.push(h);
      lastSpawn = now;

      // Keep array size manageable
      if (hearts.length > 50) {
        // Remove oldest heart that wasn't just spawned
        hearts.splice(0, 1);
      }
    }
  });

  window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
  });

  /* Animation loop */
  function animate() {
    ctx.clearRect(0, 0, W, H);

    // Update and draw particles
    particles.forEach(p => { p.update(); p.draw(); });

    // Update and draw hearts
    hearts.forEach(h => {
      // Gentle attraction to mouse if nearby
      if (mouse.x && mouse.y) {
        const dx = mouse.x - h.x;
        const dy = mouse.y - h.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          h.x += dx * 0.002;
          h.y += dy * 0.002;
        }
      }
      h.update();
      h.draw();
    });

    requestAnimationFrame(animate);
  }
  animate();


  /* ─────────────────────────────────────────
     2. NAVBAR SCROLL BEHAVIOUR
  ───────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ─────────────────────────────────────────
     2b. SMOOTH SCROLL FOR ANCHOR LINKS
  ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href').substring(1);
      
      // FAQ and Empty Anchors handled elsewhere/differently
      if (!targetId || targetId === 'faq') return;
      
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        e.preventDefault();
        
        // Calculate header offset
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  });


  /* ─────────────────────────────────────────
     3. MOBILE NAV TOGGLE
  ───────────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close nav on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });


  /* ─────────────────────────────────────────
     4. SCROLL REVEAL (fade-up)
  ───────────────────────────────────────── */
  const fadeEls = document.querySelectorAll('.fade-up');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  fadeEls.forEach(el => revealObserver.observe(el));


  /* ─────────────────────────────────────────
     5. SMOOTH HERO BUTTON PULSE (Subtle glow)
  ───────────────────────────────────────── */
  const heroBtn = document.getElementById('heroBtn');
  if (heroBtn) {
    setInterval(() => {
      heroBtn.style.boxShadow = '0 0 30px rgba(139,0,0,0.45), 0 4px 20px rgba(139,0,0,0.25)';
      setTimeout(() => {
        heroBtn.style.boxShadow = '0 4px 20px rgba(139,0,0,0.25)';
      }, 900);
    }, 2200);
  }

  /* ─────────────────────────────────────────
     6. COLLECTION MODAL FUNCTIONALITY
  ───────────────────────────────────────── */
  const collectionData = {
    Wedding: [
      { id: 'indian', title: 'Indian Traditional', icon: '<path d="M24 10C24 10 32 18 24 30 C16 18 24 10 24 10 Z M24 30C24 30 38 32 38 20 C38 20 24 26 24 30 Z M24 30C24 30 10 32 10 20 C10 20 24 26 24 30 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />' },
      { id: 'telangana', title: 'Classical Telangana', icon: '<path d="M14 40V16 M18 40V16 M14 16C14 12 18 12 18 16 M16 16V8 M16 8L14 10 M16 8L18 10 M30 40V16 M34 40V16 M30 16C30 12 34 12 34 16 M32 16V8 M32 8L30 10 M32 8L34 10 M18 28C18 18 30 18 30 28 M18 24H30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' },
      { id: 'western', title: 'Modern Western', icon: '<path d="M24 8L24 16 M21 16H27 M23 16L18 40 M25 16L30 40 M16 40H32 M21 28H27 M19 40 C19 34 29 34 29 40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' }
    ],
    Birthday: [
      { id: 'kids', title: 'Kids & Toddlers', icon: '<circle cx="20" cy="18" r="6" stroke="currentColor" stroke-width="1.5"/><circle cx="28" cy="14" r="5" stroke="currentColor" stroke-width="1.5"/><path d="M20 24 Q24 32 24 40 M28 19 Q26 28 24 40" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' },
      { id: 'teens', title: 'Teens & Young Adults', icon: '<path d="M14 28V20 C14 12 34 12 34 20V28 M14 24H18V34H14Z M34 24H30V34H34Z" stroke="currentColor" stroke-width="1.5" />' },
      { id: 'milestone', title: 'Milestone Events', icon: '<path d="M24 10 L26 20 L36 22 L26 24 L24 34 L22 24 L12 22 L22 20 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' }
    ],
    Anniversary: [
      { id: 'silver', title: 'Silver Jubilee (25th)', icon: '<path d="M18 16 A6 6 0 0 1 30 16 C30 22 24 28 24 28 C24 28 18 22 18 16 Z M26 22 A6 6 0 0 1 38 22 C38 28 32 34 32 34 C32 34 26 28 26 22 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' },
      { id: 'golden', title: 'Golden Jubilee (50th)', icon: '<circle cx="20" cy="24" r="8" stroke="currentColor" stroke-width="1.5"/><circle cx="28" cy="24" r="8" stroke="currentColor" stroke-width="1.5"/>' },
      { id: 'romantic', title: 'Romantic Getaways', icon: '<path d="M12 26 L36 26 M28 18 L36 26 L28 34 M30 26 L24 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' }
    ],
    BabyShower: [
      { id: 'woodland', title: 'Woodland Creatures', icon: '<path d="M16 16 L18 24 L30 24 L32 16 M24 34 A6 6 0 1 1 24 22 A6 6 0 1 1 24 34 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' },
      { id: 'pastel', title: 'Soft Pastels', icon: '<path d="M16 28 A4 4 0 1 1 20 24 A6 6 0 1 1 30 24 A4 4 0 1 1 30 32 H16 A4 4 0 1 1 16 28 Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' }
    ]
  };

  const modalOverlay = document.getElementById('collectionModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalTitle');
  const modalOptionsGrid = document.getElementById('modalOptionsGrid');
  const openDialogBtns = document.querySelectorAll('.open-dialog-btn');

  function openModal(collectionKey) {
    if (!collectionData[collectionKey]) return;

    // Update Title
    modalTitle.textContent = collectionKey.replace(/([A-Z])/g, ' $1').trim() + ' Styles';

    // Build grid options
    modalOptionsGrid.innerHTML = '';
    const styles = collectionData[collectionKey];

    styles.forEach(style => {
      const card = document.createElement('div');
      card.className = 'modal-option-card';
      const iconSvgPath = style.icon || '';
      card.innerHTML = `
        <div class="inv-card-icon" style="width: 48px; height: 48px; margin-bottom: 0px; color: var(--red);">
          <svg viewBox="0 0 48 48" fill="none">
            ${iconSvgPath}
          </svg>
        </div>
        <div class="modal-option-title">${style.title}</div>
      `;
      // Navigate to the dynamic collection page
      card.addEventListener('click', () => {
        window.location.href = `collection.html?category=${collectionKey}&style=${style.id}&title=${encodeURIComponent(style.title)}`;
      });
      modalOptionsGrid.appendChild(card);
    });

    // Show modal
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  openDialogBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const collection = btn.getAttribute('data-collection');
      openModal(collection);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // Escape key to close collection modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  /* ─────────────────────────────────────────
     7. FAQ MODAL FUNCTIONALITY
  ───────────────────────────────────────── */
  const faqOverlay = document.getElementById('faqModal');
  const faqCloseBtn = document.getElementById('faqCloseBtn');
  const faqLinks = document.querySelectorAll('a[href="#faq"]');

  function openFaqModal() {
    if (faqOverlay) {
      faqOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeFaqModal() {
    if (faqOverlay) {
      faqOverlay.classList.remove('active');
      document.body.style.overflow = '';
      
      // Reset details elements state on close
      const faqs = faqOverlay.querySelectorAll('details');
      faqs.forEach(faq => faq.removeAttribute('open'));
    }
  }

  // Use document delegation so nav and footer links both work
  document.body.addEventListener('click', (e) => {
    const faqAnchor = e.target.closest('a[href="#faq"]');
    if (faqAnchor) {
      e.preventDefault();
      openFaqModal();
      
      // If inside mobile nav, close mobile nav too
      if (navLinks.classList.contains('open')) {
          navLinks.classList.remove('open');
      }
    }
  });

  if (faqCloseBtn) {
    faqCloseBtn.addEventListener('click', closeFaqModal);
  }

  if (faqOverlay) {
    faqOverlay.addEventListener('click', (e) => {
      if (e.target === faqOverlay) {
        closeFaqModal();
      }
    });
  }

  // Escape key to close FAQ modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && faqOverlay && faqOverlay.classList.contains('active')) {
      closeFaqModal();
    }
  });

})();
