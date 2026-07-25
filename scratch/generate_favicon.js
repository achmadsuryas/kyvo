const fs = require('fs');
const path = require('path');

// Generate SVG favicon with Neobrutalism K dot logo
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <!-- Outer Neobrutalist Shadow -->
  <rect x="32" y="32" width="460" height="460" rx="96" fill="#111111"/>
  <!-- Main Yellow Background -->
  <rect x="16" y="16" width="460" height="460" rx="96" fill="#FFD43B" stroke="#111111" stroke-width="24"/>
  <!-- Letter K in Black -->
  <text x="210" y="360" font-family="Arial Black, Impact, sans-serif" font-size="340" font-weight="900" text-anchor="middle" fill="#111111">K</text>
  <!-- Accent Pink Dot -->
  <circle cx="390" cy="350" r="48" fill="#FF4D6D" stroke="#111111" stroke-width="16"/>
</svg>`;

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write SVG icon
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf-8');
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

console.log('Static SVG Favicons generated successfully in public/');
