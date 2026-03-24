/* ==============================================
   SCRIPT.JS — WEAVE HOMES
   Vanilla JS — no frameworks, no dependencies
   ============================================== */

/* ==============================================
   1. NAVBAR — TRANSPARENT → SOLID ON SCROLL
   ============================================== */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  function update() {
    if (window.scrollY > 44) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update(); // run immediately so refreshing mid-page works
}());


/* ==============================================
   2. MOBILE HAMBURGER MENU
   ============================================== */
(function initMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav  = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  function openMenu() {
    mobileNav.classList.add('open');
    const [a, b, c] = hamburger.querySelectorAll('span');
    a.style.transform = 'rotate(45deg) translate(4px, 4px)';
    b.style.opacity   = '0';
    c.style.transform = 'rotate(-45deg) translate(4px, -4px)';
  }

  function closeMenu() {
    mobileNav.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  }

  hamburger.addEventListener('click', () => {
    mobileNav.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close when a link is tapped
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Close on outside tap
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      closeMenu();
    }
  });
}());


/* ==============================================
   3. INTERSECTION OBSERVER — FADE-IN ANIMATIONS
   ============================================== */
(function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // animate once only
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -32px 0px'
  });

  elements.forEach(el => observer.observe(el));
}());


/* ==============================================
   4. GALLERY LIGHTBOX
   Vanilla JS — handles placeholder divs now;
   when real <img> tags are added, swap the
   renderContent() function below.
   ============================================== */
(function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const contentSlot = lightbox.querySelector('.lightbox-content');
  const captionEl   = lightbox.querySelector('.lightbox-caption');
  const closeBtn    = lightbox.querySelector('.lightbox-close');
  const prevBtn     = lightbox.querySelector('.lightbox-prev');
  const nextBtn     = lightbox.querySelector('.lightbox-next');

  // Collect all gallery items on this page
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  let currentIdx = 0;

  /* --- Render the active item into the lightbox --- */
  function renderContent(idx) {
    const item = items[idx];
    const img  = item.querySelector('img.gallery-img');

    if (img) {
      contentSlot.innerHTML =
        `<img src="${img.src}" alt="${img.alt}" style="max-width:100%;max-height:80vh;object-fit:contain;display:block;margin:0 auto;">`;
    } else {
      const ph    = item.querySelector('.img-placeholder');
      const label = (ph ? ph.textContent.trim() : '') || `Image ${idx + 1}`;
      contentSlot.innerHTML = `<div class="lightbox-placeholder">${label}</div>`;
    }

    if (captionEl) {
      captionEl.textContent = `${idx + 1} / ${items.length}`;
    }
  }

  function openLightbox(idx) {
    currentIdx = idx;
    renderContent(currentIdx);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showNext() {
    currentIdx = (currentIdx + 1) % items.length;
    renderContent(currentIdx);
  }

  function showPrev() {
    currentIdx = (currentIdx - 1 + items.length) % items.length;
    renderContent(currentIdx);
  }

  // Attach click to each gallery item
  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  // Controls
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn)  nextBtn.addEventListener('click', showNext);
  if (prevBtn)  prevBtn.addEventListener('click', showPrev);

  // Click backdrop to close
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowRight')  showNext();
    if (e.key === 'ArrowLeft')   showPrev();
  });
}());


/* ==============================================
   5. AMENITIES TABS
   Scoped so multiple [data-tabs] containers
   on a page are independent.
   ============================================== */
(function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach(container => {
    const buttons = container.querySelectorAll('.tab-btn');
    const panels  = container.querySelectorAll('.tab-panel');

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        panels.forEach(p  => p.classList.remove('active'));
        btn.classList.add('active');
        if (panels[i]) panels[i].classList.add('active');
      });
    });

    // Activate first tab by default if none active
    if (!container.querySelector('.tab-btn.active') && buttons.length) {
      buttons[0].classList.add('active');
      if (panels[0]) panels[0].classList.add('active');
    }
  });
}());


/* ==============================================
   6. MORTGAGE CALCULATOR
   Formula: P × [r(1+r)^n] / [(1+r)^n − 1]
   where P = loan principal, r = monthly rate,
         n = number of monthly payments
   ============================================== */
(function initCalculator() {
  const calc = document.getElementById('mortgage-calc');
  if (!calc) return;

  const inputs = calc.querySelectorAll('input, select');

  // Format number as USD currency string
  function fmt(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function calculate() {
    const price    = parseFloat(calc.querySelector('#calc-price').value)  || 0;
    const downPct  = parseFloat(calc.querySelector('#calc-down').value)   || 0;
    const rate     = parseFloat(calc.querySelector('#calc-rate').value)   || 0;
    const term     = parseInt(  calc.querySelector('#calc-term').value,10)|| 30;
    const taxRate  = parseFloat(calc.querySelector('#calc-tax').value)    || 0;
    const hoa      = parseFloat(calc.querySelector('#calc-hoa').value)    || 0;

    const principal   = price * (1 - downPct / 100);
    const monthlyRate = rate / 100 / 12;
    const n           = term * 12;

    // Principal + Interest
    let pi = 0;
    if (monthlyRate > 0) {
      const factor = Math.pow(1 + monthlyRate, n);
      pi = principal * (monthlyRate * factor) / (factor - 1);
    } else {
      pi = n > 0 ? principal / n : 0;
    }

    const monthlyTax = (price * taxRate / 100) / 12;
    const total      = pi + monthlyTax + hoa;

    // Update display
    calc.querySelector('#result-total').textContent = fmt(total);
    calc.querySelector('#result-pi').textContent    = fmt(pi);
    calc.querySelector('#result-tax').textContent   = fmt(monthlyTax);
    calc.querySelector('#result-hoa').textContent   = fmt(hoa);
  }

  inputs.forEach(el => {
    el.addEventListener('input',  calculate);
    el.addEventListener('change', calculate);
  });

  calculate(); // Initial render
}());


/* ==============================================
   7. SUB-NAV ACTIVE STATE ON SCROLL
   Highlights the subnav link whose section
   is currently at the top of the viewport.
   ============================================== */
(function initSubNav() {
  const subnav = document.querySelector('.subnav');
  if (!subnav) return;

  const links    = Array.from(subnav.querySelectorAll('a[href^="#"]'));
  const sections = links.map(link => ({
    link,
    target: document.querySelector(link.getAttribute('href'))
  })).filter(item => item.target !== null);

  function update() {
    const navbar  = document.querySelector('.navbar');
    const offset  = (navbar  ? navbar.offsetHeight  : 0)
                  + (subnav  ? subnav.offsetHeight   : 0)
                  + 16; // small breathing room

    let active = null;
    sections.forEach(({ target }) => {
      if (target.getBoundingClientRect().top <= offset) {
        active = target;
      }
    });

    links.forEach(l => l.classList.remove('active'));
    if (active) {
      const match = sections.find(s => s.target === active);
      if (match) match.link.classList.add('active');
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}());


/* ==============================================
   8. SMOOTH SCROLL WITH OFFSET
   Accounts for fixed navbar + sticky subnav
   height when following anchor links.
   ============================================== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id     = this.getAttribute('href');
      if (id === '#') return; // "back to top" plain hash

      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();

      const navbar  = document.querySelector('.navbar');
      const subnav  = document.querySelector('.subnav');
      const offset  = (navbar ? navbar.offsetHeight : 0)
                    + (subnav ? subnav.offsetHeight  : 0);

      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
}());
