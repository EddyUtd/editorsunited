document.addEventListener('DOMContentLoaded', () => {
  // ── i18n: detect saved language, apply, wire buttons ──
  const savedLang = localStorage.getItem('eu-lang') || 'en';
  setLanguage(savedLang);

  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // ── Contact forms ──
  document.querySelectorAll('[data-contact-form]').forEach(setupForm);
});

// ── i18n helpers ──
function getT(lang, key) {
  if (typeof EU_TRANSLATIONS === 'undefined') return undefined;
  return key.split('.').reduce((obj, k) => obj && obj[k], EU_TRANSLATIONS[lang]);
}

function applyTranslations(lang) {
  if (typeof EU_TRANSLATIONS === 'undefined' || !EU_TRANSLATIONS[lang]) return;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = getT(lang, el.dataset.i18n);
    if (val !== undefined) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const val = getT(lang, el.dataset.i18nHtml);
    if (val !== undefined) el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const val = getT(lang, el.dataset.i18nPh);
    if (val !== undefined) el.setAttribute('placeholder', val);
  });

  // Footer rights (has {year} interpolation)
  document.querySelectorAll('[data-footer-rights]').forEach(el => {
    const tpl = getT(lang, 'footer.rights');
    if (tpl) el.textContent = tpl.replace('{year}', new Date().getFullYear());
  });

  document.documentElement.lang = lang;
}

function setLanguage(lang) {
  localStorage.setItem('eu-lang', lang);
  applyTranslations(lang);
  document.querySelectorAll('[data-lang]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// ── Form handler ──
function setupForm(form) {
  const btn = form.querySelector('[data-submit-btn]');
  const successEl = form.querySelector('[data-success]');
  const errorEl = form.querySelector('[data-error]');
  const originalBtnText = btn.textContent;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate required fields
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.classList.add('field-error');
      } else {
        field.classList.remove('field-error');
      }
    });
    if (!valid) return;

    // Loading state
    btn.disabled = true;
    btn.textContent = 'Sending…';
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
        btn.textContent = 'Sent ✓';
      } else {
        throw new Error(json.message || 'Submission failed');
      }
    } catch {
      errorEl.hidden = false;
      btn.disabled = false;
      btn.textContent = originalBtnText;
    }
  });

  // Clear error highlight when user starts typing
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('field-error'));
  });
}
