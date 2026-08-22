/* ============================================================
   GAME-Z LEVEL-UP PACK (JS)
   یه لایه اضافه‌ست، کاری به Firebase و script.js اصلی نداره
   ============================================================ */
(function () {
  'use strict';

  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', () => {
    injectAurora();
    if (isFinePointer && !prefersReducedMotion) {
      initCursorGlow();
      initTiltCards();
    }
    initRipple();
    initGlitchTitle();
    initCountPulse();
    initPendingPulse();
    initConfettiHooks();
  });

  // 1) پس‌زمینه اورورا + نقطه نوری موس
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
    const glow = document.querySelector('.gz-cursor-glow');
    if (!glow) return;
    let raf = null;
    let mx = 0, my = 0;
    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      glow.classList.add('gz-active');
      if (!raf) {
        raf = requestAnimationFrame(() => {
          glow.style.transform = `translate(${mx - 190}px, ${my - 190}px)`;
          raf = null;
        });
      }
    });
    document.addEventListener('mouseleave', () => glow.classList.remove('gz-active'));
  }

  // 2) تیلت سه‌بعدی کارت‌ها
  function initTiltCards() {
    const selector = '.server-cat, .top-server-card, .game-card, .feature-item';
    document.querySelectorAll(selector).forEach(bindTilt);
    // برای کارت‌هایی که بعداً از فایربیس ساخته میشن
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          if (node.matches && node.matches(selector)) bindTilt(node);
          node.querySelectorAll && node.querySelectorAll(selector).forEach(bindTilt);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function bindTilt(el) {
    if (el.dataset.gzTiltBound) return;
    el.dataset.gzTiltBound = '1';
    el.classList.add('gz-tilt');
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(700px) rotateX(${py * -8}deg) rotateY(${px * 8}deg) translateY(-6px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  }

  // 3) ریپل روی دکمه‌ها
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

  // 4) افکت گلیچ روی عنوان هیرو
  function initGlitchTitle() {
    const h1 = document.querySelector('.hero h1');
    if (!h1 || prefersReducedMotion) return;
    h1.setAttribute('data-text', h1.textContent.trim());
    h1.classList.add('gz-glitch');
  }

  // 5) پالس روی تغییر اعداد آماری (بازدید آنلاین، سرور فعال و ...)
  function initCountPulse() {
    const ids = ['onlinePlayers', 'activeServers', 'totalServers', 'pendingComments', 'totalComments', 'totalUsers'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new MutationObserver(() => {
        el.classList.remove('gz-counting');
        void el.offsetWidth; // ری‌فلو برای ری‌استارت انیمیشن
        el.classList.add('gz-counting');
      });
      obs.observe(el, { childList: true, characterData: true, subtree: true });
    });
  }

  // 6) هشدار بصری روی نظرات در انتظار تایید در پنل ادمین
  function initPendingPulse() {
    const el = document.getElementById('pendingComments');
    if (!el) return;
    const check = () => {
      const n = parseInt((el.textContent || '0').replace(/[^\d]/g, ''), 10) || 0;
      el.classList.toggle('gz-pulse-badge', n > 0);
    };
    check();
    const obs = new MutationObserver(check);
    obs.observe(el, { childList: true, characterData: true, subtree: true });
  }

  // 7) کانفتی برای اکشن‌های موفق: ثبت‌نام / لایک / رأی
  function confettiBurst(x, y) {
    if (prefersReducedMotion) return;
    const colors = ['#00ff9f', '#00b8ff', '#8b5cf6', '#fbbf24', '#ff006e'];
    const count = 26;
    for (let i = 0; i < count; i++) {
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

  function initConfettiHooks() {
    // فرم ثبت‌نام: بعد از کلیک دکمه ثبت‌نام، اگر ثبت موفق بود (توست success ظاهر شد) کانفتی می‌زنیم
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', () => {
        setTimeout(() => {
          const toast = document.querySelector('.custom-toast.success');
          if (toast) {
            const r = registerForm.getBoundingClientRect();
            confettiBurst(r.left + r.width / 2, r.top);
          }
        }, 300);
      });
    }
    // دکمه‌های لایک و رأی در صفحه جزئیات سرور
    document.body.addEventListener('click', (e) => {
      const el = e.target.closest('.vote-btn');
      if (el) confettiBurst(e.clientX, e.clientY);
    });
  }
})();
