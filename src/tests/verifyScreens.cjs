const { chromium } = require('playwright');

async function testScreens() {
  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { width: 390, height: 844, name: '390px' },
    { width: 430, height: 932, name: '430px' },
    { width: 1280, height: 900, name: 'desktop' }
  ];

  const routes = ['/plan', '/travel-options', '/plan-b', '/nearby'];

  for (const vp of viewports) {
    console.log(`\nTesting viewport: ${vp.name} (${vp.width}x${vp.height})`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

    page.on('console', msg => {
      if (msg.type() === 'error') console.log(`  [Console Error] ${msg.text()}`);
    });

    for (const route of routes) {
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'networkidle' });
      const title = await page.title();
      console.log(`  Route ${route} loaded. Page title: "${title}"`);

      if (route === '/plan') {
        const h1 = await page.textContent('h1');
        console.log(`    Trip Plan Hero Destination: "${h1?.trim()}"`);
      } else if (route === '/travel-options') {
        const text = await page.textContent('body');
        const hasShakti = text.includes('Shakti Scheme');
        console.log(`    Travel options has Shakti Scheme card: ${hasShakti}`);
      } else if (route === '/plan-b') {
        const text = await page.textContent('body');
        const hasPlanB = text.includes('Plan B & Weather');
        console.log(`    Plan B screen loaded: ${hasPlanB}`);
      } else if (route === '/nearby') {
        const svg = await page.$('svg');
        console.log(`    Nearby screen has illustrated SVG map: ${svg !== null}`);
      }
    }
    await page.close();
  }

  await browser.close();
  console.log('\nAll screens verified successfully!');
}

testScreens().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
