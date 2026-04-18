document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('eu-lang') || 'en';
  setLanguage(savedLang);

  document.querySelectorAll('[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  document.querySelectorAll('[data-contact-form]').forEach(setupForm);

  const savedBilling = localStorage.getItem('eu-billing') || 'monthly';
  setBilling(savedBilling);
  document.querySelectorAll('[data-bill]').forEach((btn) => {
    btn.addEventListener('click', () => setBilling(btn.dataset.bill));
  });

  setupLiteYouTube();
  setupLazyTurnstile();
  setupCalendlyTracking();
  setupBookCallTracking();
  setupCookieBanner();
});

function track(name, params) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params || {});
  }
}

function setupCalendlyTracking() {
  window.addEventListener('message', (e) => {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.event === 'calendly.event_scheduled') {
      track('book_call', { method: 'calendly', value: 1, currency: 'CAD' });
    }
  });
}

function setupBookCallTracking() {
  document.querySelectorAll('a[href*="calendly.com"], a[href*="#book"], a[href*="contact.html#book"]').forEach((a) => {
    a.addEventListener('click', () => track('book_call_click', { link_url: a.href }));
  });
}

function setupLiteYouTube() {
  document.querySelectorAll('.lite-youtube').forEach((el) => {
    const activate = () => {
      const id = el.dataset.ytId;
      if (!id || el.classList.contains('lyt-loaded')) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
      iframe.title = el.getAttribute('aria-label') || 'Video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      el.appendChild(iframe);
      el.classList.add('lyt-loaded');
    };
    el.addEventListener('click', activate);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });
}

function setupCookieBanner() {
  const stored = localStorage.getItem('eu-cookie-consent');
  if (stored === 'accepted') {
    grantAnalyticsConsent();
    return;
  }
  if (stored === 'rejected') return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-live', 'polite');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-text">
        <strong data-i18n="cookies.title">We use cookies</strong>
        <p data-i18n-html="cookies.body">We use essential cookies to run the site and — with your consent — Google Analytics to understand how visitors use it. You can change your choice anytime from our <a href="privacy.html">privacy policy</a>.</p>
      </div>
      <div class="cookie-banner-actions">
        <button type="button" class="btn btn-secondary cookie-btn-reject" data-i18n="cookies.reject">Reject</button>
        <button type="button" class="btn btn-primary cookie-btn-accept" data-i18n="cookies.accept">Accept</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  const lang = document.documentElement.lang || localStorage.getItem('eu-lang') || 'en';
  applyTranslations(lang);

  const hide = () => banner.remove();
  banner.querySelector('.cookie-btn-accept').addEventListener('click', () => {
    localStorage.setItem('eu-cookie-consent', 'accepted');
    grantAnalyticsConsent();
    hide();
  });
  banner.querySelector('.cookie-btn-reject').addEventListener('click', () => {
    localStorage.setItem('eu-cookie-consent', 'rejected');
    hide();
  });
}

function grantAnalyticsConsent() {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
  }
}

function setupLazyTurnstile() {
  const widgets = document.querySelectorAll('.cf-turnstile');
  if (!widgets.length) return;
  let loaded = false;
  const load = () => {
    if (loaded) return;
    loaded = true;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  };
  if (!('IntersectionObserver' in window)) { load(); return; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { load(); io.disconnect(); }
  }, { rootMargin: '600px' });
  widgets.forEach((w) => io.observe(w));
}

function setBilling(mode) {
  if (mode !== 'monthly' && mode !== 'annual') mode = 'monthly';
  localStorage.setItem('eu-billing', mode);

  document.querySelectorAll('.bill-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.bill === mode);
    btn.setAttribute('aria-pressed', btn.dataset.bill === mode ? 'true' : 'false');
  });

  document.querySelectorAll('.pricing-grid').forEach((grid) => {
    grid.setAttribute('data-billing', mode);
  });

  document.querySelectorAll('.price-current, .price-old, .price-lead-amount').forEach((el) => {
    const v = el.dataset[mode];
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

  const lang = document.documentElement.lang || localStorage.getItem('eu-lang') || 'en';
  applyTranslations(lang);
}

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

  document.querySelectorAll('[data-footer-rights]').forEach((el) => {
    const tpl = getT(lang, 'footer.rights');
    if (tpl) el.textContent = tpl.replace('{year}', new Date().getFullYear());
  });

  document.documentElement.lang = lang;
}

function setLanguage(lang) {
  localStorage.setItem('eu-lang', lang);
  applyTranslations(lang);
  document.querySelectorAll('[data-lang]').forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function setupForm(form) {
  const btn = form.querySelector('[data-submit-btn]');
  const successEl = form.querySelector('[data-success]');
  const errorEl = form.querySelector('[data-error]');
  const originalBtnText = btn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
      if (!field.value.trim()) {
        valid = false;
        field.classList.add('field-error');
      } else {
        field.classList.remove('field-error');
      }
    });
    if (!valid) return;

    btn.disabled = true;
    btn.textContent = getT(document.documentElement.lang || 'en', 'form.sending') || 'Sending...';
    successEl.hidden = true;
    errorEl.hidden = true;

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form)
      });
      const json = await res.json();

      if (json.success) {
        form.reset();
        successEl.hidden = false;
        btn.textContent = getT(document.documentElement.lang || 'en', 'form.sent') || 'Sent';
        track('generate_lead', { method: 'contact_form', value: 1, currency: 'CAD' });
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    } catch {
      errorEl.hidden = false;
      btn.disabled = false;
      btn.textContent = originalBtnText;
    }
  });

  form.querySelectorAll('input, textarea').forEach((field) => {
    field.addEventListener('input', () => field.classList.remove('field-error'));
  });
}
