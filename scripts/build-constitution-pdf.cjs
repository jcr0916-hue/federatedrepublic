// Build a tagged, outlined Constitution PDF from the semantic print page.
// Run after npm run build, with a local server serving _site and Playwright installed.
// Usage: node scripts/build-constitution-pdf.cjs [http://localhost:8765]
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const base = process.argv[2] || 'http://localhost:8765';
    await page.goto(`${base}/constitution-print.html`, { waitUntil: 'networkidle' });
    await page.pdf({
      path: 'pdf/constitution-current.pdf',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true
    });
    console.log('Rendered tagged Constitution PDF with document outline.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
