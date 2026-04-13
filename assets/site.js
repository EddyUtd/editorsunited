document.addEventListener('DOMContentLoaded', () => {
  // ── Footer year ──
  document.querySelectorAll('[data-year]').forEach(node => {
    node.textContent = new Date().getFullYear();
  });

  // ── Contact forms ──
  document.querySelectorAll('[data-contact-form]').forEach(setupForm);
});

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
