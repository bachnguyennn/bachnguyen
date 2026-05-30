// Generates a 1200x630 social/Open Graph preview image (PNG) from an inline SVG.
// Run: node scripts/generate-og.mjs
import sharp from 'sharp';

const W = 1200;
const H = 630;

const pill = (x, y, w, label) => `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="46" rx="23" fill="#ffffff" stroke="#dde2ec"/>
    <text x="${x + w / 2}" y="${y + 30}" text-anchor="middle"
      font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="600" fill="#0f172a">${label}</text>
  </g>`;

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow1" cx="85%" cy="12%" r="55%">
      <stop offset="0%" stop-color="#3b5bdb" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#3b5bdb" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="6%" cy="100%" r="50%">
      <stop offset="0%" stop-color="#0d9488" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0d9488" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#f7f8fb"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>
  <rect x="0" y="0" width="12" height="${H}" fill="#3b5bdb"/>

  <text x="90" y="150" font-family="Helvetica, Arial, sans-serif" font-size="26"
    font-weight="700" letter-spacing="6" fill="#3b5bdb">STUDENT DATA SCIENTIST</text>

  <text x="86" y="280" font-family="Georgia, 'Times New Roman', serif" font-size="118"
    font-weight="700" fill="#0f172a">Bach Nguyen</text>

  <text x="90" y="350" font-family="Helvetica, Arial, sans-serif" font-size="34" fill="#4b5468">
    Machine Learning · Quantitative Modelling · Computer Vision</text>

  ${pill(90, 410, 150, 'PyTorch')}
  ${pill(256, 410, 160, 'XGBoost')}
  ${pill(432, 410, 130, 'SHAP')}
  ${pill(578, 410, 240, 'Calibration')}
  ${pill(834, 410, 250, 'Backtesting')}

  <text x="90" y="558" font-family="Helvetica, Arial, sans-serif" font-size="26"
    font-weight="600" fill="#4b5468">Ontario Tech University</text>
  <text x="${W - 90}" y="558" text-anchor="end" font-family="Helvetica, Arial, sans-serif"
    font-size="26" fill="#9aa3b2">bachnguyennn.github.io/bachnguyen</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile('public/og-image.png');
console.log('Wrote public/og-image.png (1200x630)');
