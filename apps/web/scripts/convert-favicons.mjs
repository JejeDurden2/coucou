import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');

const faviconSvg = readFileSync(join(publicDir, 'favicon.svg'));
const appleTouchSvg = readFileSync(join(publicDir, 'apple-touch-icon.svg'));

async function convertFavicons() {
  console.log('Converting favicons...');

  // Generate PNGs from favicon.svg
  const sizes = [16, 32, 48, 96, 192, 512];

  for (const size of sizes) {
    await sharp(faviconSvg)
      .resize(size, size)
      .png()
      .toFile(join(publicDir, `favicon-${size}x${size}.png`));
    console.log(`✓ favicon-${size}x${size}.png`);
  }

  // Generate android-chrome icons
  await sharp(faviconSvg)
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'android-chrome-192x192.png'));
  console.log('✓ android-chrome-192x192.png');

  await sharp(faviconSvg)
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'android-chrome-512x512.png'));
  console.log('✓ android-chrome-512x512.png');

  // Generate apple-touch-icon.png (180x180)
  await sharp(appleTouchSvg).resize(180, 180).png().toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // Generate favicon.ico from multiple sizes (16, 32, 48)
  const ico16 = await sharp(faviconSvg).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(faviconSvg).resize(32, 32).png().toBuffer();
  const ico48 = await sharp(faviconSvg).resize(48, 48).png().toBuffer();

  const icoBuffer = await pngToIco([ico16, ico32, ico48]);
  writeFileSync(join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('✓ favicon.ico (16x16, 32x32, 48x48)');

  console.log('\n✅ All favicons generated successfully!');
}

convertFavicons().catch(console.error);
