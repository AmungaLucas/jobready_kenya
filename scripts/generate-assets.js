const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SVG_PATH = path.join(__dirname, '..', 'upload', 'Group 25.svg');
const PUBLIC = path.join(__dirname, '..', 'public');

async function main() {
  const svgBuffer = fs.readFileSync(SVG_PATH);

  // Ensure output dirs
  const dirs = ['icons', 'images'].map(d => path.join(PUBLIC, d));
  dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

  // 1. Standard PNG favicons
  const faviconSizes = [16, 32, 48];
  for (const size of faviconSizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC, 'icons', `favicon-${size}x${size}.png`));
    console.log(`  favicon-${size}x${size}.png`);
  }

  // 2. Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(PUBLIC, 'icons', 'apple-touch-icon.png'));
  console.log('  apple-touch-icon.png (180x180)');

  // 3. Android / PWA icons (192x192, 512x512)
  for (const size of [192, 512]) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC, 'icons', `android-chrome-${size}x${size}.png`));
    console.log(`  android-chrome-${size}x${size}.png`);
  }

  // 4. Open Graph image (1200x630) - branded background
  const ogWidth = 1200;
  const ogHeight = 630;
  // Create a branded OG image with the logo centered on a gradient background
  const ogSvg = `
  <svg width="${ogWidth}" height="${ogHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0C1D32"/>
        <stop offset="100%" stop-color="#1a3a5c"/>
      </linearGradient>
    </defs>
    <rect width="${ogWidth}" height="${ogHeight}" fill="url(#bg)"/>
    <!-- Subtle pattern overlay -->
    <rect x="0" y="0" width="${ogWidth}" height="${ogHeight}" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="40"/>
    <!-- Logo -->
    <image href="${SVG_PATH}" x="${ogWidth/2 - 160}" y="${ogHeight/2 - 130}" width="320" height="260" />
    <!-- Brand text -->
    <text x="${ogWidth/2}" y="${ogHeight/2 + 170}" font-family="Arial, sans-serif" font-size="52" font-weight="800" fill="white" text-anchor="middle">JobBoard Kenya</text>
    <text x="${ogWidth/2}" y="${ogHeight/2 + 215}" font-family="Arial, sans-serif" font-size="22" fill="rgba(255,255,255,0.7)" text-anchor="middle">Find Verified Jobs &amp; Opportunities</text>
  </svg>`;

  await sharp(Buffer.from(ogSvg))
    .resize(ogWidth, ogHeight)
    .png()
    .toFile(path.join(PUBLIC, 'images', 'og-default.png'));
  console.log('  og-default.png (1200x630)');

  // 5. Twitter card image (same as OG but can differ)
  await sharp(Buffer.from(ogSvg))
    .resize(ogWidth, ogHeight)
    .png()
    .toFile(path.join(PUBLIC, 'images', 'twitter-card.png'));
  console.log('  twitter-card.png (1200x630)');

  // 6. Copy the main logo.svg to public
  fs.copyFileSync(SVG_PATH, path.join(PUBLIC, 'logo.svg'));
  console.log('  logo.svg (source)');

  // 7. Generate a simplified favicon.svg (smaller, web-optimized)
  // The original is 1700x1300, let's create a square-cropped version
  const faviconSvg = `
  <svg width="32" height="32" viewBox="0 0 1700 1300" xmlns="http://www.w3.org/2000/svg">
    <path d="M769 509C769 467.579 802.579 434 844 434V434V759C844 800.421 810.421 834 769 834V834V509Z" fill="#191919"/>
    <path d="M874 699C874 657.579 907.579 624 949 624V624V749C949 790.421 915.421 824 874 824V824V699Z" fill="#191919"/>
    <circle cx="1011.5" cy="671.5" r="47.5" fill="#090909"/>
    <circle cx="706.5" cy="786.5" r="47.5" fill="#090909"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M680.3 1.98646C701.997 -5.80245 724.853 10.2822 724.853 33.3405V296.728C724.853 297.966 724.782 299.2 724.646 300.426C585.335 357.546 487.21 494.545 487.21 654.469C487.21 720.527 503.952 782.675 533.423 836.896C532.05 839.232 530.393 841.4 528.485 843.345L268.951 1107.88C258.701 1118.33 242.834 1120.86 229.844 1114.12L17.966 1004.16C6.92804 998.429 0 987.026 0 974.588V269.644C1.08544e-05 255.584 8.82428 243.039 22.0534 238.29L680.3 1.98646ZM128.689 820.06C112.794 820.06 99.9088 832.949 99.9088 848.848C99.9088 864.747 112.794 877.636 128.689 877.636H276.702C292.597 877.636 305.482 864.747 305.482 848.848C305.482 832.949 292.597 820.06 276.702 820.06H128.689ZM128.689 704.906C112.794 704.906 99.9088 717.795 99.9088 733.694C99.9088 749.594 112.794 762.483 128.689 762.483H363.043C378.938 762.483 391.823 749.594 391.823 733.694C391.823 717.795 378.938 704.906 363.043 704.906H128.689ZM223.253 425.247C155.132 425.247 99.9088 480.485 99.9088 548.626V589.752H387.712V548.626C387.712 480.485 332.489 425.247 264.368 425.247H223.253ZM243.81 241C198.396 241 161.581 277.826 161.581 323.253C161.581 368.68 198.396 405.506 243.81 405.506C289.224 405.506 326.04 368.68 326.04 323.253C326.04 277.826 289.224 241 243.81 241Z" fill="#0C1D32"/>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1431.05 192.121C1441.3 181.674 1457.17 179.143 1470.16 185.884L1682.03 295.842C1693.07 301.57 1700 312.974 1700 325.412V1030.36C1700 1044.42 1691.18 1056.96 1677.95 1061.71L1019.7 1298.01C998.003 1305.8 975.147 1289.72 975.147 1266.66V1003.27C975.147 1002.03 975.218 1000.8 975.354 999.574C1114.67 942.454 1212.79 805.455 1212.79 645.531C1212.79 579.473 1196.05 517.325 1166.58 463.103C1167.95 460.767 1169.61 458.6 1171.52 456.655L1431.05 192.121ZM1420.01 1002.2C1404.11 1002.2 1391.23 1015.09 1391.23 1030.99C1391.23 1046.89 1404.11 1059.78 1420.01 1059.78H1568.02C1583.92 1059.78 1596.8 1046.89 1596.8 1030.99C1596.8 1015.09 1583.92 1002.2 1568.02 1002.2H1420.01ZM1333.67 887.046C1317.77 887.046 1304.89 899.936 1304.89 915.835C1304.89 931.734 1317.77 944.623 1333.67 944.623H1568.02C1583.92 944.623 1596.8 931.734 1596.8 915.835C1596.8 899.936 1583.92 887.046 1568.02 887.046H1333.67ZM1432.34 607.387C1364.22 607.387 1309 662.626 1309 730.766V771.893H1596.8V730.766C1596.8 662.626 1541.58 607.387 1473.46 607.387H1432.34ZM1452.9 423.141C1407.49 423.141 1370.67 459.967 1370.67 505.394C1370.67 550.821 1407.49 587.646 1452.9 587.646C1498.31 587.646 1535.13 550.821 1535.13 505.394C1535.13 459.967 1498.31 423" fill="#0C1D32"/>
  </svg>`;
  fs.writeFileSync(path.join(PUBLIC, 'favicon.svg'), faviconSvg);
  console.log('  favicon.svg');

  // 8. Generate favicon.ico (use 32x32 PNG wrapped in ICO format)
  // Simple ICO: just use the 32x32 PNG renamed (modern browsers accept this)
  const png32 = await sharp(svgBuffer).resize(32, 32).png().toBuffer();
  // Create a proper ICO with both 16x16 and 32x32
  const png16 = await sharp(svgBuffer).resize(16, 16).png().toBuffer();

  // Build ICO binary (simplified: single 32x32 entry)
  const icoBuffer = createIco([png16, png32]);
  fs.writeFileSync(path.join(PUBLIC, 'favicon.ico'), icoBuffer);
  console.log('  favicon.ico (16+32)');

  // 9. PWA manifest
  const manifest = {
    name: 'JobBoard Kenya',
    short_name: 'JobBoard KE',
    description: 'Find verified jobs & opportunities across Kenya',
    start_url: '/',
    display: 'standalone',
    background_color: '#0C1D32',
    theme_color: '#0C1D32',
    icons: [
      { src: '/icons/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png', purpose: 'apple-touch-icon' },
    ],
  };
  fs.writeFileSync(path.join(PUBLIC, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('  manifest.json');

  // 10. Robots.txt update
  const robots = `User-agent: *
Allow: /

Sitemap: https://jobboard.ke/sitemap.xml
`;
  fs.writeFileSync(path.join(PUBLIC, 'robots.txt'), robots);
  console.log('  robots.txt');

  console.log('\n=== ALL ASSETS GENERATED ===');
}

// Minimal ICO generator (supports PNG entries)
function createIco(pngBuffers) {
  const numImages = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * numImages;
  let dataOffset = headerSize + dirSize;

  const parts = [];

  // ICO header
  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0);     // Reserved
  header.writeUInt16LE(1, 2);     // Type: ICO
  header.writeUInt16LE(numImages, 4);
  parts.push(header);

  // Directory entries + image data
  let offset = dataOffset;
  for (const png of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    // Use first pixel to get dimensions (parse PNG IHDR)
    const w = png[16] || 0; // width from IHDR
    const h = png[20] || 0; // height from IHDR (stored as half in ICO)
    entry.writeUInt8(w >= 256 ? 0 : w, 0);   // Width
    entry.writeUInt8(h >= 256 ? 0 : h, 1);   // Height
    entry.writeUInt8(0, 2);                    // Color palette
    entry.writeUInt8(0, 3);                    // Reserved
    entry.writeUInt16LE(1, 4);                 // Color planes
    entry.writeUInt16LE(32, 6);               // Bits per pixel
    entry.writeUInt32LE(png.length, 8);       // Image data size
    entry.writeUInt32LE(offset, 12);          // Image data offset
    parts.push(entry);
    offset += png.length;
  }

  // Image data
  for (const png of pngBuffers) {
    parts.push(png);
  }

  return Buffer.concat(parts);
}

main().catch(e => { console.error(e); process.exit(1); });