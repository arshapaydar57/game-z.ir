// ============================================================
//  GAME-Z — UI LAYER (بدون وابستگی به Firebase)
//  این فایل به‌صورت اسکریپت معمولی (نه ماژول) لود میشه تا حتی اگر
//  اتصال به Firebase/گوگل مسدود یا کند باشه، ظاهر و تعاملات سایت
//  (تم روشن/تیره، منو، انیمیشن‌ها و بازی حدس عدد) همیشه کار کنن.
// ============================================================
(function () {
  'use strict';

  const domCache = {};
  function getEl(id) {
    if (!domCache[id]) domCache[id] = document.getElementById(id);
    return domCache[id];
  }
  window.gzGetEl = getEl;

  // ---------------- THEME TOGGLE ----------------
  let isDarkMode = localStorage.getItem('gamez_dark_mode') !== 'false';
  function applyTheme(dark) {
    if (dark) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'light');
  }
  function initThemeToggle() {
    const toggle = document.querySelector('.theme-toggle');
    applyTheme(isDarkMode);
    if (!toggle) return;
    toggle.innerHTML = isDarkMode ? '☀️' : '🌙';
    toggle.addEventListener('click', () => {
      isDarkMode = !isDarkMode;
      localStorage.setItem('gamez_dark_mode', isDarkMode);
      applyTheme(isDarkMode);
      toggle.innerHTML = isDarkMode ? '☀️' : '🌙';
    });
  }
  // تم رو همون اول (قبل از DOMContentLoaded) هم اعمال کن که فلش نزنه
  applyTheme(isDarkMode);

  // ---------------- TOAST ----------------
  function showToast(message, type) {
    type = type || 'info';
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'custom-toast ' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      toast.style.transition = '0.5s ease';
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
  window.showToast = showToast;

  // ---------------- COPY IP ----------------
  window.copyIP = function (ip) {
    if (!ip) { showToast('❌ آی‌پی نامعتبر!', 'error'); return; }
    navigator.clipboard.writeText(ip).then(() => {
      showToast('✅ آدرس کپی شد: ' + ip, 'success');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = ip;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('✅ آدرس کپی شد: ' + ip, 'success');
    });
  };

  // ---------------- USER BADGE (فقط localStorage) ----------------
  function initUserBadge() {
    const user = localStorage.getItem('gamez_current_user');
    const badge = getEl('userBadge');
    if (!badge) return;
    if (user === 'admin') {
      badge.textContent = '👑 ادمین';
      badge.classList.add('admin');
      badge.onclick = () => window.location.href = 'admin.html';
    } else if (user) {
      badge.textContent = '👤 ' + user;
    } else {
      badge.textContent = '👤 مهمان';
      badge.onclick = () => window.location.href = 'login.html';
    }
  }

  // ---------------- HEADER SHRINK ----------------
  function initHeaderShrink() {
    const header = getEl('mainHeader');
    if (!header) return;
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { header.classList.toggle('shrink', window.scrollY > 60); ticking = false; });
        ticking = true;
      }
    });
  }

  // ---------------- MOBILE MENU ----------------
  function initMobileMenu() {
    const toggle = getEl('menuToggle');
    const nav = getEl('mainNav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => nav.classList.remove('open')));
  }

  // ---------------- REVEAL ON SCROLL ----------------
  function initReveal() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(el => observer.observe(el));
  }
  window.gzInitReveal = initReveal; // چون کارت‌های جدید بعداً هم اضافه میشن، از بیرون هم صداش می‌زنیم

  // ---------------- AURORA BACKGROUND + CURSOR GLOW ----------------
  function injectAurora() {
    if (document.querySelector('.gz-aurora')) return;
    const aurora = document.createElement('div');
    aurora.className = 'gz-aurora';
    aurora.innerHTML = '<span></span><span></span><span></span>';
    document.body.prepend(aurora);
    const glow = document.createElement('div');
    glow.className = 'gz-cursor-glow';
    document.body.appendChild(glow);
  }
  function initCursorGlow() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const glow = document.querySelector('.gz-cursor-glow');
    if (!glow) return;
    let raf = null, mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      glow.classList.add('gz-active');
      if (!raf) raf = requestAnimationFrame(() => { glow.style.transform = 'translate(' + (mx - 200) + 'px,' + (my - 200) + 'px)'; raf = null; });
    });
    document.addEventListener('mouseleave', () => glow.classList.remove('gz-active'));
  }

  // ---------------- TILT ----------------
  function bindTilt(el) {
    if (!el || el.dataset.gzTiltBound || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    el.dataset.gzTiltBound = '1';
    el.classList.add('gz-tilt');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(700px) rotateX(' + (py * -7) + 'deg) rotateY(' + (px * 7) + 'deg) translateY(-6px)';
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  }
  window.gzBindTilt = bindTilt;

  function initTiltCards() {
    const selector = '.server-cat, .top-server-card, .game-card, .feature-item';
    document.querySelectorAll(selector).forEach(bindTilt);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(m => m.addedNodes.forEach(node => {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches(selector)) bindTilt(node);
        node.querySelectorAll && node.querySelectorAll(selector).forEach(bindTilt);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ---------------- RIPPLE ----------------
  function initRipple() {
    const selector = '.btn-neon, .guess-btn, .copy-big, .admin-form button, .comment-form button, .vote-btn';
    document.body.addEventListener('click', (e) => {
      const btn = e.target.closest(selector);
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(r.width, r.height);
      ripple.className = 'gz-ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  }

  // ---------------- GLITCH TITLE ----------------
  function initGlitchTitle() {
    const h1 = document.querySelector('.hero h1');
    if (!h1) return;
    h1.setAttribute('data-text', h1.textContent.trim());
    h1.classList.add('gz-glitch');
  }

  // ---------------- CONFETTI ----------------
  function confettiBurst(x, y) {
    const colors = ['#a855f7', '#f472b6', '#fbbf24', '#ff2e88', '#c084fc'];
    for (let i = 0; i < 26; i++) {
      const piece = document.createElement('div');
      piece.className = 'gz-confetti-piece';
      piece.style.background = colors[i % colors.length];
      piece.style.left = (x + (Math.random() * 120 - 60)) + 'px';
      const duration = 1.4 + Math.random() * 1.1;
      piece.style.animationDuration = duration + 's';
      piece.style.top = (y - 20) + 'px';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), duration * 1000 + 100);
    }
  }
  window.gzConfetti = confettiBurst;

  // ---------------- ANIMATE NUMBER ----------------
  function animateNumber(el, target) {
    if (!el) return;
    target = parseInt(target, 10) || 0;
    const current = parseInt((el.textContent || '0').replace(/[^\d]/g, ''), 10) || 0;
    if (current === target) { el.textContent = target; return; }
    const duration = 500;
    const start = performance.now();
    function step(now) {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(current + (target - current) * p);
      el.classList.add('gz-counting');
      if (p < 1) requestAnimationFrame(step);
      else setTimeout(() => el.classList.remove('gz-counting'), 300);
    }
    requestAnimationFrame(step);
  }
  window.gzAnimateNumber = animateNumber;

  // ---------------- PARTICLES ----------------
  function initParticles() {
    const canvas = getEl('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];
    const COUNT = 60;

    function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    function Particle() { this.reset(); }
    Particle.prototype.reset = function () {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.speedY = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.3 + 0.1;
      this.hue = Math.random() * 80 + 260;
      this.color = 'hsla(' + this.hue + ', 85%, 70%, ' + this.opacity + ')';
    };
    Particle.prototype.update = function () {
      this.x += this.speedX; this.y += this.speedY;
      if (this.x < 0 || this.x > w) this.speedX *= -1;
      if (this.y < 0 || this.y > h) this.speedY *= -1;
    };
    Particle.prototype.draw = function () {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = 'hsla(' + this.hue + ', 85%, 70%, 0.25)';
      ctx.shadowBlur = 12;
      ctx.fill();
    };
    for (let i = 0; i < COUNT; i++) particles.push(new Particle());

    function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => { p.update(); p.draw(); });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(168, 85, 247, ' + (0.05 * (1 - dist / 120)) + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ---------------- بازی حدس عدد ----------------
  function initGuessGame() {
    const btn = getEl('guess-btn');
    if (!btn) return;
    const input = getEl('guess-input');
    const resetBtn = getEl('reset-btn');
    const numberDisplay = getEl('main-number');
    const hintText = getEl('hint-text');
    const attemptsEl = getEl('attempts');
    const bestScoreEl = getEl('best-score');
    const rangeMin = getEl('range-min');
    const rangeMax = getEl('range-max');
    const fill = getEl('progress-fill');
    const historyList = getEl('history-list');
    const messageEl = getEl('game-message');

    const toPersianDigits = (n) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

    let secret, attempts, min, max, over = false;
    const best = parseInt(localStorage.getItem('gamez_guess_best') || '0', 10);
    if (bestScoreEl && best) bestScoreEl.textContent = toPersianDigits(best);

    function newGame() {
      secret = Math.floor(Math.random() * 100) + 1;
      attempts = 0; min = 1; max = 100; over = false;
      numberDisplay.textContent = '❓';
      hintText.textContent = 'عدد رو حدس بزن';
      attemptsEl.textContent = toPersianDigits(0);
      rangeMin.textContent = toPersianDigits(1);
      rangeMax.textContent = toPersianDigits(100);
      fill.style.width = '0%';
      historyList.innerHTML = '';
      messageEl.textContent = '';
      input.value = '';
      input.disabled = false;
      btn.disabled = false;
      input.focus();
    }

    function makeGuess() {
      if (over) return;
      const val = parseInt(input.value, 10);
      if (isNaN(val) || val < 1 || val > 100) {
        messageEl.textContent = '⚠️ یک عدد بین ۱ تا ۱۰۰ وارد کن';
        return;
      }
      attempts++;
      attemptsEl.textContent = toPersianDigits(attempts);
      messageEl.textContent = '';

      const chip = document.createElement('span');
      chip.className = 'history-item';
      chip.textContent = toPersianDigits(val);

      if (val === secret) {
        chip.classList.add('win');
        numberDisplay.innerHTML = '🎉 ' + toPersianDigits(val);
        hintText.textContent = 'آفرین! تو ' + toPersianDigits(attempts) + ' تلاش پیدا کردی';
        fill.style.width = '100%';
        over = true;
        input.disabled = true;
        btn.disabled = true;
        if (!best || attempts < best) {
          localStorage.setItem('gamez_guess_best', attempts);
          if (bestScoreEl) bestScoreEl.textContent = toPersianDigits(attempts);
        }
        confettiBurst(window.innerWidth / 2, window.innerHeight / 3);
        showToast('🏆 بردی! دوباره بازی کن', 'success');
      } else if (val < secret) {
        chip.classList.add('low');
        min = Math.max(min, val + 1);
        numberDisplay.textContent = '⬆️';
        hintText.textContent = 'بزرگ‌تره!';
      } else {
        chip.classList.add('high');
        max = Math.min(max, val - 1);
        numberDisplay.textContent = '⬇️';
        hintText.textContent = 'کوچیک‌تره!';
      }
      rangeMin.textContent = toPersianDigits(min);
      rangeMax.textContent = toPersianDigits(max);
      const progress = Math.min(100, (attempts / 10) * 100);
      if (!over) fill.style.width = progress + '%';
      historyList.appendChild(chip);
      input.value = '';
      input.focus();
    }

    btn.addEventListener('click', makeGuess);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') makeGuess(); });
    resetBtn.addEventListener('click', newGame);
    newGame();
  }

  // ---------------- INIT ----------------
  document.addEventListener('DOMContentLoaded', function () {
    injectAurora();
    initParticles();
    initHeaderShrink();
    initMobileMenu();
    initReveal();
    initUserBadge();
    initThemeToggle();
    initCursorGlow();
    initTiltCards();
    initRipple();
    initGlitchTitle();
    initGuessGame();
    console.log('✅ لایه UI (ui.js) با موفقیت لود شد — این بخش به Firebase وابسته نیست.');
  });
})();
