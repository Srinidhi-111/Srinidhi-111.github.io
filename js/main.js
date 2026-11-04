/* ==========================================================
   Srinidhi R · Portfolio · main.js
   1. The animated night sky in the hero
   2. The typing titles under your name
   3. Header, menu and active-link highlighting
   4. Sections fading in as you scroll
   5. The contact form
   ========================================================== */

document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----------------------------------------------------------
   1. NIGHT SKY
   Three things are drawn on the canvas, over and over:
   - far stars: many tiny stars that twinkle
   - constellation stars: brighter stars that wander a little,
     joined by lines that slowly "breathe" (fade dim and bright)
   - shooting stars that streak across now and then
   Stars near your mouse light up blue and connect to it.
   ---------------------------------------------------------- */
(function sky() {
  const canvas = document.getElementById('sky');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const ACCENT = [127, 211, 255];   // same blue as --accent in style.css
  const LINK_DISTANCE = 190;        // stars closer than this get a line
  const MOUSE_RADIUS = 200;         // how far the mouse glow reaches
  const BREATH_SECONDS = 6;         // one full dim-bright-dim cycle of the lines

  let width = 0, height = 0, dpr = 1;
  let farStars = [], nodes = [], shooting = [], sparkles = [];
  let mouse = { x: -9999, y: -9999 };
  let nextShot = 0;
  let running = true;

  const rand = (min, max) => min + Math.random() * (max - min);

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createStars();
  }

  function createStars() {
    const area = width * height;

    // far stars: about one per 4,500 square pixels
    farStars = Array.from({ length: Math.round(area / 4500) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: rand(0.4, 1.1),
      alpha: rand(0.3, 0.9),
      twinkleSpeed: Math.random() < 0.35 ? rand(0.6, 2) : 0,
      phase: Math.random() * Math.PI * 2,
      blue: Math.random() < 0.15,
    }));

    // constellation stars: fewer on small screens, kept mostly out of the centre
    const count = Math.round(Math.min(44, Math.max(18, area / 28000)));
    nodes = [];
    while (nodes.length < count) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const inCentre = Math.abs(x - width / 2) < width * 0.25 && Math.abs(y - height / 2) < height * 0.28;
      if (inCentre && Math.random() < 0.8) continue;
      nodes.push({
        baseX: x, baseY: y, x, y,
        r: Math.random() < 0.25 ? 1.7 : 1.2,
        wanderX: rand(4, 9), wanderY: rand(4, 9),
        speed: rand(0.08, 0.16),
        phase: Math.random() * Math.PI * 2,
        twinkle: rand(0.5, 1.2),
        blue: Math.random() < 0.3,
      });
    }
  }

  function spawnShootingStar(now) {
    const angle = rand(12, 38) * Math.PI / 180;
    shooting.push({
      x: rand(-0.1, 0.7) * width,
      y: rand(-0.05, 0.45) * height,
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      speed: rand(700, 1100),      // pixels per second
      length: rand(90, 170),
      life: 0,
      maxLife: rand(0.7, 1.2),     // seconds
    });
    nextShot = now + rand(1.6, 4.2);
  }

  // A WISH: a shooting star launched from where the visitor clicked,
  // plus a small burst of sparkles at that spot.
  function makeWish(x, y) {
    const angle = rand(15, 40) * Math.PI / 180 * (Math.random() < 0.5 ? 1 : -1) + (Math.random() < 0.5 ? 0 : Math.PI);
    shooting.push({
      x, y,
      dx: Math.cos(angle),
      dy: Math.abs(Math.sin(angle)),   // always falls downwards, like a real one
      speed: rand(650, 900),
      length: rand(120, 190),
      life: 0,
      maxLife: rand(1.1, 1.5),
      wish: true,
    });
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = rand(40, 130);
      sparkles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, maxLife: rand(0.5, 0.9), r: rand(0.8, 1.8) });
    }
  }

  function draw(now) {
    const t = now / 1000;
    ctx.clearRect(0, 0, width, height);

    // far stars
    for (const s of farStars) {
      const a = s.twinkleSpeed ? s.alpha * (0.45 + 0.55 * Math.sin(t * s.twinkleSpeed + s.phase) ** 2) : s.alpha;
      ctx.fillStyle = s.blue ? `rgba(191,221,255,${a})` : `rgba(255,255,255,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // constellation stars wander gently around their home position
    for (const n of nodes) {
      n.x = n.baseX + Math.sin(t * n.speed * 2 + n.phase) * n.wanderX;
      n.y = n.baseY + Math.cos(t * n.speed * 1.6 + n.phase) * n.wanderY;
    }

    // lines between nearby stars, breathing between 35% and 100%
    const breath = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((t / BREATH_SECONDS) * Math.PI * 2));
    ctx.lineWidth = 1.1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > LINK_DISTANCE) continue;
        const midX = (a.x + b.x) / 2, midY = (a.y + b.y) / 2;
        const nearMouse = Math.hypot(midX - mouse.x, midY - mouse.y) < MOUSE_RADIUS;
        const strength = (0.34 * (1 - d / LINK_DISTANCE) + 0.13) * (nearMouse ? 1.8 : breath);
        ctx.strokeStyle = nearMouse
          ? `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${Math.min(strength, 0.85)})`
          : `rgba(214,230,250,${strength})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // faint line from the mouse to stars near it
      const n = nodes[i];
      const dm = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      if (dm < MOUSE_RADIUS) {
        ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${0.4 * (1 - dm / MOUSE_RADIUS)})`;
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    // the constellation stars themselves, with a soft glow
    for (const n of nodes) {
      const near = Math.hypot(n.x - mouse.x, n.y - mouse.y) < MOUSE_RADIUS;
      const a = 0.6 + 0.4 * Math.sin(t * n.twinkle + n.phase) ** 2;
      const rgb = near || n.blue ? ACCENT.join(',') : '255,255,255';
      ctx.shadowBlur = near ? 16 : 8;
      ctx.shadowColor = `rgba(${rgb},0.9)`;
      ctx.fillStyle = `rgba(${rgb},${a})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, near ? n.r * 1.5 : n.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // shooting stars
    if (t > nextShot) spawnShootingStar(t);
    shooting = shooting.filter((s) => s.life < s.maxLife);
    for (const s of shooting) {
      s.life += 1 / 60;
      s.x += s.dx * s.speed / 60;
      s.y += s.dy * s.speed / 60;
      const fade = Math.sin(Math.PI * (s.life / s.maxLife));
      const tailX = s.x - s.dx * s.length;
      const tailY = s.y - s.dy * s.length;
      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, `rgba(255,255,255,${fade})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
      ctx.fillStyle = s.wish ? `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${fade})` : `rgba(255,255,255,${fade})`;
      if (s.wish) { ctx.shadowBlur = 14; ctx.shadowColor = `rgba(${ACCENT.join(',')},0.9)`; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.wish ? 2.2 : 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // sparkles from a wish: fly outwards, slow down and fade
    sparkles = sparkles.filter((p) => p.life < p.maxLife);
    for (const p of sparkles) {
      p.life += 1 / 60;
      p.x += p.vx / 60;
      p.y += p.vy / 60;
      p.vx *= 0.94;
      p.vy *= 0.94;
      const a = 1 - p.life / p.maxLife;
      ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(now) {
    if (running) draw(now);
    requestAnimationFrame(loop);
  }

  // mouse and touch: positions are relative to the canvas
  function setMouse(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    mouse = { x: clientX - rect.left, y: clientY - rect.top };
  }
  window.addEventListener('mousemove', (e) => setMouse(e.clientX, e.clientY));
  window.addEventListener('touchmove', (e) => { if (e.touches[0]) setMouse(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
  document.addEventListener('mouseleave', () => { mouse = { x: -9999, y: -9999 }; });

  // click or tap the sky (not the name card or menu) to make a wish
  const hero = canvas.parentElement;
  const hint = document.getElementById('wishHint');
  hero.addEventListener('click', (e) => {
    if (reduceMotion || e.target.closest('.hero-card, .nav, a, button')) return;
    const rect = canvas.getBoundingClientRect();
    makeWish(e.clientX - rect.left, e.clientY - rect.top);
    if (hint) hint.classList.add('gone');
  });

  // pause the animation while the hero is scrolled out of view, to save battery
  new IntersectionObserver(([entry]) => { running = entry.isIntersecting; }).observe(canvas);

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 150); });

  resize();
  if (reduceMotion) {
    draw(0);            // one still frame, no movement
  } else {
    requestAnimationFrame(loop);
  }
})();

/* ----------------------------------------------------------
   2. TYPING TITLES
   Edit this list to change the words under your name.
   ---------------------------------------------------------- */
(function typing() {
  const TITLES = ['Computer Science Student', 'Developer', 'Curious Learner', 'Self-taught Explorer'];
  const el = document.getElementById('typed');
  if (!el || reduceMotion) return;

  let titleIndex = 0, charIndex = TITLES[0].length, deleting = true;
  setTimeout(tick, 2200);

  function tick() {
    const word = TITLES[titleIndex];
    if (deleting) {
      charIndex--;
      el.textContent = word.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        titleIndex = (titleIndex + 1) % TITLES.length;
      }
      setTimeout(tick, 45);
    } else {
      const next = TITLES[titleIndex];
      charIndex++;
      el.textContent = next.slice(0, charIndex);
      if (charIndex === next.length) {
        deleting = true;
        setTimeout(tick, 2200);  // pause on the full word
      } else {
        setTimeout(tick, 85);
      }
    }
  }
})();

/* ----------------------------------------------------------
   3. HEADER, MENU, ACTIVE LINK
   ---------------------------------------------------------- */
(function navigation() {
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const links = document.getElementById('navLinks');
  const linkEls = [...links.querySelectorAll('a')];

  // darker header once you scroll down
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // phone menu open / close
  menuBtn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  linkEls.forEach((a) => a.addEventListener('click', () => {
    links.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }));

  // highlight the link of the section you are looking at
  const sections = linkEls.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      linkEls.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => observer.observe(s));
})();

/* ----------------------------------------------------------
   4. SCROLL-IN ANIMATION
   Anything with class="reveal" fades up the first time it appears.
   ---------------------------------------------------------- */
(function reveal() {
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  items.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;  // small stagger
    observer.observe(el);
  });
})();

/* ----------------------------------------------------------
   5. CONTACT FORM (sent through Formspree, see README)
   ---------------------------------------------------------- */
(function contactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.action.includes('YOUR_FORM_ID')) {
      status.textContent = 'The form is not connected yet. Please email me directly for now.';
      return;
    }
    status.textContent = 'Sending…';
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error();
      form.reset();
      status.textContent = 'Thanks! Your message has been sent.';
    } catch {
      status.textContent = 'Something went wrong. Please email me directly instead.';
    }
  });
})();

document.getElementById('year').textContent = new Date().getFullYear();
