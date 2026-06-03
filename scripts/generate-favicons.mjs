// Rasterize the brand favicon SVG into PNG fallbacks (Safari / iOS / old browsers).
// Run: node scripts/generate-favicons.mjs
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync('brand/assets/favicon.svg');

// 180x180 apple-touch-icon — flattened on the brand dark so iOS has no transparency
await sharp(svg, { density: 512 })
  .resize(180, 180)
  .flatten({ background: '#19202e' })
  .png()
  .toFile('public/apple-touch-icon.png');

// 32x32 tab favicon (keeps alpha)
await sharp(svg, { density: 512 }).resize(32, 32).png().toFile('public/favicon-32.png');

// 192x192 for Android / PWA
await sharp(svg, { density: 512 })
  .resize(192, 192)
  .flatten({ background: '#19202e' })
  .png()
  .toFile('public/favicon-192.png');

console.log('Wrote public/{apple-touch-icon,favicon-32,favicon-192}.png');
