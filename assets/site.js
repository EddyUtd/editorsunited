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
});

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

  document.querySelectorAll('.price-current, .price-old').forEach((el) => {
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
