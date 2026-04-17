const fs = require('fs');
const r = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const a = r.audits;

const score = Math.round(r.categories.performance.score * 100);
const fmt = (id) => a[id]?.displayValue ?? 'n/a';

console.log('PERF SCORE:', score);
console.log('');
console.log('Core Web Vitals:');
console.log('  FCP:', fmt('first-contentful-paint'));
console.log('  LCP:', fmt('largest-contentful-paint'));
console.log('  TBT:', fmt('total-blocking-time'));
console.log('  CLS:', fmt('cumulative-layout-shift'));
console.log('  Speed Index:', fmt('speed-index'));
console.log('');
console.log('LCP element:', a['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet?.slice(0, 140) || 'n/a');
console.log('');
console.log('Top opportunities (by potential savings):');
const opps = Object.values(a)
  .filter((x) => x.details?.type === 'opportunity' && x.numericValue > 50)
  .sort((x, y) => (y.numericValue ?? 0) - (x.numericValue ?? 0))
  .slice(0, 12);
for (const o of opps) {
  const ms = Math.round(o.numericValue);
  console.log('  -', o.title, '—', ms + 'ms savings', o.displayValue ? '(' + o.displayValue + ')' : '');
}
console.log('');
console.log('Diagnostics flagged (non-passing):');
const diags = Object.values(a)
  .filter((x) => x.details?.type === 'table' && (x.score === null || x.score < 0.9) && !x.details?.items ? false : x.score !== null && x.score < 0.9 && x.scoreDisplayMode !== 'notApplicable' && x.scoreDisplayMode !== 'manual')
  .sort((x, y) => x.score - y.score);
for (const d of diags.slice(0, 15)) {
  console.log('  -', d.id, '|', d.title, '|', d.displayValue || '');
}
