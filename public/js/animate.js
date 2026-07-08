/**
 * GDRTI Motion & Animation System
 * Vanilla JS — Intersection Observer + CSS keyframes
 * Based on ui-ux-pro-max skill (150-300ms timing, spring physics via cubic-bezier)
 */

(function GDRTI_Motion() {
  'use strict';

  // ─── 1. SPRING EASING (cubic-bezier Spring approximation) ──
  const SPRING = 'cubic-bezier(.34,1.56,.64,1)';   // overshoot
  const EASE_OUT = 'cubic-bezier(.22,.68,0,1.2)';  // smooth decel

  // ─── 2. INTERSECTION OBSERVER — scroll animasiyası ─────────
  function initScrollAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      .gdrti-anim {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity .4s ease, transform .5s ${EASE_OUT};
        will-change: opacity, transform;
      }
      .gdrti-anim.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .gdrti-anim-left {
        opacity: 0;
        transform: translateX(-20px);
        transition: opacity .35s ease, transform .45s ${EASE_OUT};
      }
      .gdrti-anim-left.visible {
        opacity: 1;
        transform: translateX(0);
      }
      .gdrti-anim-scale {
        opacity: 0;
        transform: scale(.92);
        transition: opacity .3s ease, transform .4s ${SPRING};
      }
      .gdrti-anim-scale.visible {
        opacity: 1;
        transform: scale(1);
      }
    `;
    document.head.appendChild(style);

    const io = new IntersectionObserver((entries) => {
      entries.forEach(el => {
        if (el.isIntersecting) {
          el.target.classList.add('visible');
          io.unobserve(el.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

    document.querySelectorAll('.sector-card, .task-item, .emp-row, .stat-card, .card, .goal-card, .mn-card, .sv-card, .doc-card, .lb-row, .kb-card').forEach((el, i) => {
      el.classList.add('gdrti-anim');
      el.style.transitionDelay = `${Math.min(i * 0.06, 0.5)}s`;
      io.observe(el);
    });
  }

  // ─── 3. BUTTON RIPPLE + PRESS ───────────────────────────────
  function initButtonEffects() {
    const style = document.createElement('style');
    style.textContent = `
      .btn, .gq-btn, .folder-chip, .mp-btn {
        transform: translateY(0);
        transition: transform .12s ${SPRING}, box-shadow .15s ease, filter .15s ease !important;
      }
      .btn:active, .gq-btn:active, .folder-chip:active {
        transform: scale(.95) translateY(1px) !important;
      }
      .btn:not(.secondary):not([disabled]):hover {
        filter: brightness(1.07) !important;
      }
      .ripple-wrap { position: relative; overflow: hidden; }
      .ripple {
        position: absolute; border-radius: 50%;
        background: rgba(255,255,255,.3); pointer-events: none;
        transform: scale(0); animation: ripple-anim .5s ease-out forwards;
      }
      @keyframes ripple-anim {
        to { transform: scale(4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('.btn:not(.secondary), .btn.excel').forEach(btn => {
      btn.classList.add('ripple-wrap');
      btn.addEventListener('click', e => {
        const r = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        r.className = 'ripple';
        r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
        btn.appendChild(r);
        r.addEventListener('animationend', () => r.remove());
      });
    });
  }

  // ─── 4. KART HOVER — 3D tilt efekti ─────────────────────────
  function initCardTilt() {
    document.querySelectorAll('.sector-card, .stat-card, .ev-section').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - .5) * 6;
        const y = ((e.clientY - rect.top) / rect.height - .5) * -6;
        card.style.transform = `perspective(600px) rotateY(${x}deg) rotateX(${y}deg) translateY(-3px)`;
        card.style.transition = 'transform .1s ease';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = `transform .4s ${SPRING}`;
      });
    });
  }

  // ─── 5. RƏQƏM COUNT-UP ─────────────────────────────────────
  function countUp(el, target, duration = 1200) {
    const start = performance.now();
    const isFloat = !Number.isInteger(target);

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = target * ease;
      el.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = isFloat ? target.toFixed(1) : target;
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const raw = el.textContent.trim().replace(/[^0-9.]/g, '');
        const val = parseFloat(raw);
        if (!isNaN(val) && val > 0) countUp(el, val);
        io.unobserve(el);
      });
    }, { threshold: .8 });

    document.querySelectorAll('.emp-points .num, .stat-card .num, .score-final, .score-val b').forEach(el => {
      io.observe(el);
    });
  }

  // ─── 6. SİDEBAR LINK AKTİV PULSE ───────────────────────────
  function initSidebarPulse() {
    const style = document.createElement('style');
    style.textContent = `
      .sidebar a.active {
        animation: nav-pulse 2s ease-in-out infinite;
      }
      @keyframes nav-pulse {
        0%,100% { background: rgba(255,255,255,.18); }
        50%      { background: rgba(255,255,255,.24); }
      }
      .sidebar a { transition: background .15s ease, transform .2s ${SPRING}, color .15s ease !important; }
      .sidebar a:hover { transform: translateX(4px) !important; }
    `;
    document.head.appendChild(style);
  }

  // ─── 7. PROGRESS BAR ANİMASİYASI ────────────────────────────
  function initProgressBars() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const fill = e.target.querySelector('.progress-fill');
        if (fill) {
          const target = fill.style.width || fill.getAttribute('data-width') || '0%';
          fill.style.width = '0%';
          setTimeout(() => { fill.style.width = target; }, 100);
        }
        io.unobserve(e.target);
      });
    }, { threshold: .5 });

    document.querySelectorAll('.progress-bar').forEach(bar => {
      const fill = bar.querySelector('.progress-fill');
      if (fill && fill.style.width) {
        fill.setAttribute('data-width', fill.style.width);
        fill.style.width = '0%';
      }
      io.observe(bar);
    });
  }

  // ─── 8. MODAL ANİMASİYASI ───────────────────────────────────
  function initModals() {
    const style = document.createElement('style');
    style.textContent = `
      .modal-bg { animation: modal-bg-in .2s ease both; }
      @keyframes modal-bg-in {
        from { opacity:0; backdrop-filter:blur(0); }
        to   { opacity:1; backdrop-filter:blur(4px); }
      }
      .modal { animation: modal-in .3s ${SPRING} both; }
      @keyframes modal-in {
        from { opacity:0; transform:scale(.88) translateY(20px); }
        to   { opacity:1; transform:scale(1) translateY(0); }
      }
    `;
    document.head.appendChild(style);
  }

  // ─── 9. SEARCH INPUT ANIMASIYASI ────────────────────────────
  function initSearchPulse() {
    const style = document.createElement('style');
    style.textContent = `
      #globalSearch {
        transition: background .2s ease, box-shadow .2s ease, transform .2s ${SPRING} !important;
      }
      #globalSearch:focus {
        transform: scaleX(1.03);
        box-shadow: 0 0 0 2px rgba(165,180,252,.5) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── 10. FLOATING BUTTONS ANİMASİYASI ──────────────────────
  function initFloatingButtons() {
    const style = document.createElement('style');
    style.textContent = `
      .cw-bubble, #aiBubble, #notifBell {
        transition: transform .2s ${SPRING}, box-shadow .2s ease !important;
      }
      .cw-bubble:hover, #aiBubble:hover {
        transform: scale(1.12) translateY(-2px) !important;
      }
      .cw-bubble:active, #aiBubble:active { transform: scale(.93) !important; }
      @keyframes float-in {
        from { opacity:0; transform:scale(0) translateY(20px); }
        to   { opacity:1; transform:scale(1) translateY(0); }
      }
      .cw-bubble { animation: float-in .4s .2s ${SPRING} both; }
      #aiBubble  { animation: float-in .4s .35s ${SPRING} both; }
    `;
    document.head.appendChild(style);
  }

  // ─── 11. NOTIFICATION BELL SHAKE ───────────────────────────
  function initBellShake() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bell-shake {
        0%,100%{transform:rotate(0)}
        15%{transform:rotate(12deg)}
        30%{transform:rotate(-10deg)}
        45%{transform:rotate(8deg)}
        60%{transform:rotate(-6deg)}
        75%{transform:rotate(3deg)}
      }
      #notifBell.has-notif { animation: bell-shake 1s ease .5s both; }
    `;
    document.head.appendChild(style);

    // Bell-ə notif badge varsa shake et
    const observer = new MutationObserver(() => {
      const bell = document.getElementById('notifBell');
      const badge = document.getElementById('notifCount');
      if (bell && badge && badge.style.display !== 'none') {
        bell.classList.add('has-notif');
      }
    });

    const badge = document.getElementById('notifCount');
    if (badge) observer.observe(badge, { attributes: true, attributeFilter: ['style'] });
  }

  // ─── 12. PAGE ENTRANCE ──────────────────────────────────────
  function initPageEntrance() {
    const style = document.createElement('style');
    style.textContent = `
      .main {
        animation: page-enter .4s ease both;
      }
      @keyframes page-enter {
        from { opacity:0; transform:translateY(8px); }
        to   { opacity:1; transform:translateY(0); }
      }
      .topbar {
        animation: page-enter .35s ease both;
      }
    `;
    document.head.appendChild(style);
  }

  // ─── BAŞLAT ─────────────────────────────────────────────────
  function init() {
    initPageEntrance();
    initSidebarPulse();
    initModals();
    initButtonEffects();
    initFloatingButtons();
    initSearchPulse();

    // DOM hazır olduqdan sonra
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', afterLoad);
    } else {
      afterLoad();
    }
  }

  function afterLoad() {
    setTimeout(() => {
      initScrollAnimations();
      initCardTilt();
      initCounters();
      initProgressBars();
      initBellShake();
    }, 100);
  }

  init();
})();
