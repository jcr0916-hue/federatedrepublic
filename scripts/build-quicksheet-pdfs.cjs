// Run after npm run build, with a local server serving _site and Playwright installed.
// Usage: node scripts/build-quicksheet-pdfs.cjs [http://localhost:8765]
const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const base = process.argv[2] || 'http://localhost:8765';
    for (const file of fs.readdirSync('.').filter(f => /^quicksheet-.*\.html$/.test(f))) {
      await page.goto(`${base}/${file}`);
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({ path: `pdf/${file.replace('.html', '.pdf')}`, printBackground: true, preferCSSPageSize: true });
      console.log(`Rendered ${file}`);
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
