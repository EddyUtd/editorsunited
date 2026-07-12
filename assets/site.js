/* EditorsUnited — site.js
   i18n, billing toggle, forms, cookie consent, lite-YouTube facades,
   and the Edit Bay motion system (scroll reveals, hero scrub, header timecode). */

// Storage can throw in hardened/private browsers — never let that kill init.
function safeGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage blocked */ }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch { /* storage blocked */ }
}

const REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  const savedLang = safeGet('eu-lang') || 'en';
  setLanguage(savedLang);

  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  document.querySelectorAll('[data-contact-form]').forEach(setupForm);

  const savedBilling = safeGet('eu-billing') || 'monthly';
  setBilling(savedBilling);
  document.querySelectorAll('[data-bill]').forEach((btn) => {
    btn.addEventListener('click', () => setBilling(btn.dataset.bill));
  });

  setupLiteYouTube();
  setupCalendlyTracking();
  setupBookCallTracking();
  setupCookieBanner();
  setupCookieReset();
  setupReveals();
  setupHeroScrub();
  setupHeaderTimecode();
});

function track(name, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params || {});
  }
}

function setupCalendlyTracking() {
  window.addEventListener('message', (e) => {
    if (!/^https:\/\/([a-z0-9-]+\.)?calendly\.com$/.test(e.origin)) return;
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.event === 'calendly.event_scheduled') {
      track('book_call', { method: 'calendly', value: 1, currency: 'CAD' });
    }
  });
}

function setupBookCallTracking() {
  document.querySelectorAll('a[href*="calendly.com"], a[href*="#book"]').forEach((a) => {
    a.addEventListener('click', () => track('book_call_click', { link_url: a.href }));
  });
}

function setupLiteYouTube() {
  document.querySelectorAll('.lite-youtube').forEach((el) => {
    const activate = () => {
      const id = el.dataset.ytId;
      if (!id || el.classList.contains('lyt-loaded')) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.title = el.getAttribute('aria-label') || 'Video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      el.appendChild(iframe);
      el.classList.add('lyt-loaded');
      // The facade is no longer a button once the player is in.
      el.removeAttribute('role');
      el.removeAttribute('tabindex');
      el.removeAttribute('aria-label');
      iframe.addEventListener('load', () => iframe.focus(), { once: true });
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

function setupCookieBanner() {
  const stored = safeGet('eu-cookie-consent');
  if (stored === 'accepted') {
    grantAnalyticsConsent();
    return;
  }
  if (stored === 'rejected') return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-text">
        <strong data-i18n="cookies.title">We use cookies</strong>
        <p data-i18n-html="cookies.body">We use essential cookies to run the site and — with your consent — Google Analytics to understand how visitors use it. You can change your choice anytime from our <a href="/privacy">privacy policy</a>.</p>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" class="btn btn-secondary cookie-btn-reject" data-i18n="cookies.reject">Reject</button>
        <button type="button" class="btn btn-primary cookie-btn-accept" data-i18n="cookies.accept">Accept</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  const lang = document.documentElement.lang || safeGet('eu-lang') || 'en';
  applyTranslations(lang);

  const hide = () => banner.remove();
  banner.querySelector('.cookie-btn-accept').addEventListener('click', () => {
    safeSet('eu-cookie-consent', 'accepted');
    grantAnalyticsConsent();
    hide();
  });
  banner.querySelector('.cookie-btn-reject').addEventListener('click', () => {
    safeSet('eu-cookie-consent', 'rejected');
    hide();
  });
}

/* Privacy page: "reset my cookie choice" control */
function setupCookieReset() {
  document.querySelectorAll('[data-cookie-reset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      safeRemove('eu-cookie-consent');
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
      const done = document.querySelector('[data-cookie-reset-done]');
      if (done) done.hidden = false;
    });
  });
}

function grantAnalyticsConsent() {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
  }
}

/* ── Billing toggle ── */

function applyBillingDom(mode, lang) {
  document.querySelectorAll('.pricing-grid').forEach((grid) => {
    grid.setAttribute('data-billing', mode);
  });

  // Prices: prefer language-specific attribute (data-monthly-fr) when present.
  document.querySelectorAll('.price-current, .price-old, .price-lead-amount').forEach((el) => {
    const key = lang === 'fr' ? mode + 'Fr' : mode;
    const v = el.dataset[key] !== undefined ? el.dataset[key] : el.dataset[mode];
    if (v !== undefined) el.textContent = v;
  });

  document.querySelectorAll('[data-bill-key]').forEach((el) => {
    const base = el.dataset.billKey;
    el.setAttribute('data-i18n', mode === 'annual' ? base + 'Annual' : base);
  });

  document.querySelectorAll('[data-cta-monthly]').forEach((a) => {
    const target = mode === 'annual' ? a.dataset.ctaAnnual : a.dataset.ctaMonthly;
    if (target) a.setAttribute('href', target);
    if (target && target.startsWith('#')) {
      a.removeAttribute('target');
      a.removeAttribute('rel');
    } else {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });
}

function setBilling(mode) {
  if (mode !== 'monthly' && mode !== 'annual') mode = 'monthly';
  safeSet('eu-billing', mode);

  document.querySelectorAll('.bill-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.bill === mode);
    btn.setAttribute('aria-pressed', btn.dataset.bill === mode ? 'true' : 'false');
  });

  const lang = document.documentElement.lang || safeGet('eu-lang') || 'en';
  applyBillingDom(mode, lang);
  applyTranslations(lang);
}

/* ── i18n ── */

function getT(lang, key) {
  if (typeof EU_TRANSLATIONS === 'undefined') return undefined;
  return key.split('.').reduce((obj, k) => obj && obj[k], EU_TRANSLATIONS[lang]);
}

function applyTranslations(lang) {
  if (typeof EU_TRANSLATIONS === 'undefined' || !EU_TRANSLATIONS[lang]) return;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const val = getT(lang, el.dataset.i18n);
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const val = getT(lang, el.dataset.i18nHtml);
    if (val !== undefined) el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    const val = getT(lang, el.dataset.i18nPh);
    if (val !== undefined) el.setAttribute('placeholder', val);
  });

  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const val = getT(lang, el.dataset.i18nAria);
    if (val !== undefined) el.setAttribute('aria-label', val);
  });

  document.querySelectorAll('[data-footer-rights]').forEach((el) => {
    const tpl = getT(lang, 'footer.rights');
    if (tpl) el.textContent = tpl.replace('{year}', new Date().getFullYear());
  });

  document.documentElement.lang = lang;
}

function setLanguage(lang) {
  safeSet('eu-lang', lang);
  applyTranslations(lang);
  // Re-render language-dependent price formats without re-saving billing.
  const mode = safeGet('eu-billing') || 'monthly';
  applyBillingDom(mode === 'annual' ? 'annual' : 'monthly', lang);
  applyTranslations(lang);
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

/* ── Contact forms ── */

function setupForm(form) {
  const btn = form.querySelector('[data-submit-btn]');
  const successEl = form.querySelector('[data-success]');
  const errorEl = form.querySelector('[data-error]');
  if (!btn || !successEl || !errorEl) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    let firstInvalid = null;
    form.querySelectorAll('[required]').forEach((field) => {
      if (!field.value.trim()) {
        valid = false;
        field.classList.add('field-error');
        field.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = field;
      } else {
        field.classList.remove('field-error');
        field.removeAttribute('aria-invalid');
      }
    });
    if (!valid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const lang = document.documentElement.lang || 'en';
    btn.disabled = true;
    btn.textContent = getT(lang, 'form.sending') || 'Sending...';
    successEl.hidden = true;
    errorEl.hidden = true;

    mirrorLeadToCrm(form, lang);

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      });
      const json = await res.json();

      if (json.success) {
        form.reset();
        successEl.hidden = false;
        btn.textContent = getT(lang, 'form.sent') || 'Sent';
        track('generate_lead', { method: 'contact_form', value: 1, currency: 'CAD' });
        // Allow a follow-up message after a short pause.
        setTimeout(() => {
          btn.disabled = false;
          btn.textContent = getT(document.documentElement.lang || 'en', 'form.submit') || 'Submit inquiry';
        }, 4000);
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    } catch {
      errorEl.hidden = false;
      btn.disabled = false;
      btn.textContent = getT(document.documentElement.lang || 'en', 'form.submit') || 'Submit inquiry';
    }
  });

  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('input', () => {
      field.classList.remove('field-error');
      field.removeAttribute('aria-invalid');
    });
  });
}

/* Mirror the lead into the EditorsUnited CRM. Fire-and-forget: the user-facing
   submission flow is Web3Forms; if the portal is unreachable this must never
   affect the UX (and the lead still arrives by email). */
function mirrorLeadToCrm(form, lang) {
  try {
    const data = new FormData(form);
    const page = (location.pathname.replace(/\/|\.html$/g, '') || 'home');
    const payload = {
      name: (data.get('name') || '').toString().slice(0, 200),
      email: (data.get('email') || '').toString().slice(0, 200),
      company: (data.get('brand') || data.get('company') || '').toString().slice(0, 200),
      message: (data.get('goals') || data.get('message') || '').toString().slice(0, 4000),
      source: page === 'home' ? 'contact-form' : page,
      lang: lang,
      botcheck: (data.get('botcheck') || '').toString()
    };
    fetch('https://portal.editorsunited.com/api/leads/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined
    }).catch(() => {});
  } catch { /* never block the form */ }
}

/* ── Motion: scroll reveals ── */

function setupReveals() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  // Stagger children of reveal groups.
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    Array.from(group.querySelectorAll('[data-reveal]')).forEach((el, i) => {
      el.style.setProperty('--d', Math.min(i * 80, 400) + 'ms');
    });
  });

  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-on'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-on');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

  els.forEach((el) => io.observe(el));
}

/* ── Motion: hero scrub frame counter ── */

function setupHeroScrub() {
  const counter = document.querySelector('[data-tc-counter]');
  if (!counter) return;
  if (REDUCED_MOTION) {
    counter.textContent = '00:00:03:12';
    return;
  }
  const FPS = 30;
  const LOOP_SECONDS = 8;
  let start = null;
  let lastFrame = -1;
  const pad = (n) => String(n).padStart(2, '0');
  function tick(ts) {
    if (start === null) start = ts;
    const elapsed = ((ts - start) / 1000) % LOOP_SECONDS;
    const frame = Math.floor(elapsed * FPS);
    if (frame !== lastFrame) {
      lastFrame = frame;
      const s = Math.floor(elapsed);
      const f = frame % FPS;
      counter.textContent = `00:00:${pad(s)}:${pad(f)}`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ── Motion: header timecode readout + scroll progress line ── */

function setupHeaderTimecode() {
  const tc = document.querySelector('[data-header-tc]');
  const progress = document.querySelector('.scroll-progress');
  const header = document.querySelector('.site-header');
  if (!tc && !progress && !header) return;

  const pad = (n) => String(n).padStart(2, '0');
  let rafPending = false;

  function update() {
    rafPending = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progress) progress.style.transform = `scaleX(${p})`;
    if (tc) {
      // Map the page to a one-minute reel.
      const total = p * 60;
      const s = Math.floor(total);
      const f = Math.floor((total - s) * 30);
      tc.textContent = `TC 00:${pad(s)}:${pad(f)}`;
    }
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
  }

  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  update();
}
