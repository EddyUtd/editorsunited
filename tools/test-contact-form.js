const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const ENDPOINT = 'https://portal.editorsunited.com/api/leads/intake';
const pages = {
  'index.html': 'website-home',
  'about.html': 'website-about',
  'contact.html': 'website-contact',
  'portfolio.html': 'website-portfolio'
};

test('every contact form uses the first-party CRM endpoint', () => {
  for (const [filename, source] of Object.entries(pages)) {
    const html = fs.readFileSync(path.join(ROOT, filename), 'utf8');
    assert.match(html, new RegExp(`<form[^>]+data-contact-form[^>]+data-source="${source}"[^>]+action="${ENDPOINT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    assert.match(html, new RegExp(`name="source" value="${source}"`));
    assert.doesNotMatch(html, /web3forms|access_key/i);
  }
});

test('website script waits for the EditorsUnited CRM response', () => {
  const script = fs.readFileSync(path.join(ROOT, 'assets', 'site.js'), 'utf8');
  assert.match(script, new RegExp(ENDPOINT.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(script, /res\.ok && json\.ok/);
  assert.match(script, /company: \(data\.get\('brand'\)/);
  assert.match(script, /message: \(data\.get\('goals'\)/);
  assert.doesNotMatch(script, /web3forms/i);
});

test('privacy disclosure describes first-party form processing', () => {
  const privacy = fs.readFileSync(path.join(ROOT, 'privacy.html'), 'utf8');
  const translations = fs.readFileSync(path.join(ROOT, 'assets', 'translations.js'), 'utf8');
  assert.match(privacy, /first-party contact form storage/i);
  assert.match(translations, /first-party contact form storage/i);
  assert.doesNotMatch(privacy + translations, /web3forms/i);
});
