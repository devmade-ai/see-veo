/**
 * Requirement: Generate PWA icons and favicon from SVG source
 * Approach: Use sharp to convert SVG to PNG at required sizes, png-to-ico for favicon
 * Alternatives considered:
 *   - Manual image editing: Rejected — not reproducible, error-prone
 *   - Vite plugin: Rejected — adds build-time complexity for a rarely-changed asset
 */
import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');
const svgPath = resolve(publicDir, 'mask-icon.svg');
const svgBuffer = readFileSync(svgPath);

async function generate() {
  // Generate PWA icons and apple-touch-icon
  const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { name, size } of sizes) {
    const outPath = resolve(publicDir, name);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // Generate favicon.ico from a 32x32 PNG
  const favicon32 = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();

  const icoBuffer = await pngToIco(favicon32);
  writeFileSync(resolve(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Generated favicon.ico (32x32)');

  console.log('All icons generated successfully.');
}

generate().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
