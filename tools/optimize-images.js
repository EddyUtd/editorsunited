#!/usr/bin/env node
/**
 * Batch image optimizer for EditorsUnited.
 * - Logos: emit WebP at 2× display size (~80px tall, max 320px wide).
 * - Headshot: emit WebP at 720×960 (covers retina up to ~480px display).
 * - Acura is already a tiny WebP — left alone.
 * - SVG is already vector — left alone.
 *
 * Outputs go alongside originals as <name>.webp. Originals stay so <picture>
 * fallbacks still work for ancient browsers.
 *
 * Run: node tools/optimize-images.js
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const repoRoot = path.resolve(__dirname, '..');
const targets = [
  // Marquee logos: bounded box ~320×160 (2× the largest display). Cover crop
  // would distort, so use `inside` resize and let the natural aspect drive it.
  { src: 'assets/logos/nashville-home-guru.jpg', out: 'assets/logos/nashville-home-guru.webp', width: 320, height: 160, fit: 'inside', quality: 78 },
  { src: 'assets/logos/DOJQC.png',                out: 'assets/logos/DOJQC.webp',                width: 320, height: 160, fit: 'inside', quality: 82 },
  { src: 'assets/logos/White-Logo.jpg',           out: 'assets/logos/White-Logo.webp',           width: 320, height: 160, fit: 'inside', quality: 82 },
  // Headshot: about-photo container is at most ~480px wide × 640px tall on
  // mobile, similar on desktop. Render at 720×960 for retina headroom.
  { src: 'assets/headshot.jpg', out: 'assets/headshot.webp', width: 720, height: 960, fit: 'cover', quality: 75 },
];

(async () => {
  const rows = [];
  for (const t of targets) {
    const srcPath = path.join(repoRoot, t.src);
    const outPath = path.join(repoRoot, t.out);
    if (!fs.existsSync(srcPath)) { console.warn('skip (missing):', t.src); continue; }
    const srcBytes = fs.statSync(srcPath).size;

    let pipeline = sharp(srcPath).resize({ width: t.width, height: t.height, fit: t.fit, withoutEnlargement: true });
    await pipeline.webp({ quality: t.quality, effort: 6 }).toFile(outPath);

    const outBytes = fs.statSync(outPath).size;
    rows.push({ file: t.src, src: srcBytes, out: outBytes, saved: srcBytes - outBytes });
  }

  const fmt = (n) => (n / 1024).toFixed(1) + ' KB';
  console.log('\n  source                                    orig       webp       saved');
  console.log('  ' + '-'.repeat(74));
  for (const r of rows) {
    console.log('  ' + r.file.padEnd(40) + '  ' + fmt(r.src).padStart(8) + '  ' + fmt(r.out).padStart(8) + '  ' + fmt(r.saved).padStart(8));
  }
  const total = rows.reduce((a, r) => a + r.saved, 0);
  console.log('  ' + '-'.repeat(74));
  console.log('  total saved: ' + fmt(total) + '\n');
})();
