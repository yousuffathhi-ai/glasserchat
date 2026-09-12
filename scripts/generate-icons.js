import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const svgPath = path.resolve('public/icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  const targets = [
    { file: 'public/icon-192.png', size: 192 },
    { file: 'public/icon-512.png', size: 512 },
    { file: 'public/apple-touch-icon.png', size: 180 },
    { file: 'public/pwa-192x192.png', size: 192 },
    { file: 'public/pwa-512x512.png', size: 512 },
  ];

  for (const t of targets) {
    await sharp(svgBuffer)
      .resize(t.size, t.size)
      .png()
      .toFile(path.resolve(t.file));
    console.log(`Generated ${t.file}`);
  }

  // Maskable icon with 10% safe zone padding
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 11, g: 17, b: 27, alpha: 1 },
    })
    .png()
    .toFile(path.resolve('public/pwa-maskable-512x512.png'));
  console.log('Generated public/pwa-maskable-512x512.png');
}

generateIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
