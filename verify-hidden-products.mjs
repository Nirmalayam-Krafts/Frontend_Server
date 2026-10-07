import { preview } from 'vite';
import { chromium } from 'playwright';

async function run() {
  console.log('🚀 Starting Vite preview server...');
  const server = await preview({
    preview: {
      port: 4173,
    },
  });

  const url = 'http://localhost:4173';
  console.log(`📡 Preview server running at ${url}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // TEST 1: Navbar Dropdown
    console.log('\n--- 1. Testing Navbar Dropdown ---');
    await page.goto(`${url}/`, { waitUntil: 'networkidle' });

    // Hover on "Products" in navbar to open dropdown
    const productsNav = page.locator('nav').locator('text=Products').first();
    await productsNav.hover();
    await page.waitForTimeout(400);

    const nav = page.locator('nav');
    const customPrintedInNav = await nav.locator('text="Custom Printed Bags"').count();
    const handleBagsInNav = await nav.locator('text="Handle Paper Bags"').count();
    const customPrintedLink = await nav.locator('a[href*="custom-printed"]').count();
    const handleLink = await nav.locator('a[href*="handle-bags"]').count();

    assert(customPrintedInNav === 0, 'Navbar dropdown does NOT contain "Custom Printed Bags"');
    assert(handleBagsInNav === 0, 'Navbar dropdown does NOT contain "Handle Paper Bags"');
    assert(customPrintedLink === 0, 'Navbar has NO link to custom-printed-paper-bags');
    assert(handleLink === 0, 'Navbar has NO link to handle-bags');

    const fnbInNav = await nav.locator('text="Food & Bakery Bags"').count();
    const ecocraftInNav = await nav.locator('text="EcoCraft Paper Bags"').count();
    const rollsInNav = await nav.locator('text="Kraft Paper Rolls"').count();

    assert(fnbInNav > 0, 'Navbar dropdown contains "Food & Bakery Bags"');
    assert(ecocraftInNav > 0, 'Navbar dropdown contains "EcoCraft Paper Bags"');
    assert(rollsInNav > 0, 'Navbar dropdown contains "Kraft Paper Rolls"');

    // TEST 2: Footer Links
    console.log('\n--- 2. Testing Footer Catalog Links ---');
    const footer = page.locator('footer');
    const customPrintedInFooter = await footer.locator('text="Custom Printed Bags"').count();
    const handleBagsInFooter = await footer.locator('text="Handle Paper Bags"').count();
    const customPrintedFooterLink = await footer.locator('a[href*="custom-printed"]').count();
    const handleFooterLink = await footer.locator('a[href*="handle-bags"]').count();

    assert(customPrintedInFooter === 0, 'Footer does NOT contain "Custom Printed Bags"');
    assert(handleBagsInFooter === 0, 'Footer does NOT contain "Handle Paper Bags"');
    assert(customPrintedFooterLink === 0, 'Footer has NO link to custom-printed-paper-bags');
    assert(handleFooterLink === 0, 'Footer has NO link to handle-bags');

    const fnbInFooter = await footer.locator('text="Food & Bakery Bags"').count();
    const ecocraftInFooter = await footer.locator('text="EcoCraft Paper Bags"').count();
    const rollsInFooter = await footer.locator('text="Kraft Paper Rolls"').count();

    assert(fnbInFooter > 0, 'Footer contains "Food & Bakery Bags"');
    assert(ecocraftInFooter > 0, 'Footer contains "EcoCraft Paper Bags"');
    assert(rollsInFooter > 0, 'Footer contains "Kraft Paper Rolls"');

    // TEST 3: Homepage Collections & Preview Grid
    console.log('\n--- 3. Testing Homepage Collections & Preview Grid ---');
    const customPrintedOnHome = await page.locator('text="Custom Printed Bags"').count();
    const handleBagsOnHome = await page.locator('text="Handle Paper Bags"').count();
    const handleBagsCard = await page.locator('.product-grid-3x3').locator('text="Handle Bags"').count();

    assert(customPrintedOnHome === 0, 'Homepage does NOT contain "Custom Printed Bags" section/card');
    assert(handleBagsOnHome === 0, 'Homepage does NOT contain "Handle Paper Bags" section/card');
    assert(handleBagsCard === 0, 'Homepage wholesale preview grid does NOT contain "Handle Bags"');

    // TEST 4: Master Products Catalog Page
    console.log('\n--- 4. Testing Products Catalog Page (/products) ---');
    await page.goto(`${url}/products`, { waitUntil: 'networkidle' });

    const customPrintedOnProducts = await page.locator('text="Custom Printed Paper Bags"').count();
    const handleBagsOnProducts = await page.locator('text="Handle Paper Bags"').count();
    const customPrintedLinkProducts = await page.locator('a[href*="custom-printed"]').count();
    const handleLinkProducts = await page.locator('a[href*="handle-bags"]').count();

    assert(customPrintedOnProducts === 0, 'Products page does NOT have "Custom Printed Paper Bags"');
    assert(handleBagsOnProducts === 0, 'Products page does NOT have "Handle Paper Bags"');
    assert(customPrintedLinkProducts === 0, 'Products page has NO link to custom-printed-paper-bags');
    assert(handleLinkProducts === 0, 'Products page has NO link to handle-bags');

    const fnbOnProducts = await page.locator('text="Food & Bakery Paper Bags"').count();
    const ecocraftOnProducts = await page.locator('text="EcoCraft Paper Bags"').count();
    const rollsOnProducts = await page.locator('text="Kraft Paper Rolls"').count();

    assert(fnbOnProducts > 0, 'Products page contains "Food & Bakery Paper Bags"');
    assert(ecocraftOnProducts > 0, 'Products page contains "EcoCraft Paper Bags"');
    assert(rollsOnProducts > 0, 'Products page contains "Kraft Paper Rolls"');

    // TEST 5: Redirections & URL Protection
    console.log('\n--- 5. Testing URL Redirections & Hidden Pages ---');
    
    // Visit /products/custom-printed-paper-bags directly
    await page.goto(`${url}/products/custom-printed-paper-bags`, { waitUntil: 'networkidle' });
    assert(page.url().endsWith('/products'), `/products/custom-printed-paper-bags redirected to ${page.url()} (expected /products)`);

    // Visit /products/handle-bags directly
    await page.goto(`${url}/products/handle-bags`, { waitUntil: 'networkidle' });
    assert(page.url().endsWith('/products'), `/products/handle-bags redirected to ${page.url()} (expected /products)`);

    // Visit /products/flat-handle directly
    await page.goto(`${url}/products/flat-handle`, { waitUntil: 'networkidle' });
    assert(page.url().endsWith('/products'), `/products/flat-handle redirected to ${page.url()} (expected /products)`);

    // Visit /products/luxury directly
    await page.goto(`${url}/products/luxury`, { waitUntil: 'networkidle' });
    assert(page.url().endsWith('/products'), `/products/luxury redirected to ${page.url()} (expected /products)`);

    // TEST 6: Legitimate Categories Functionality
    console.log('\n--- 6. Testing Legitimate Category Pages Functionality ---');
    await page.goto(`${url}/products/food-bakery-bags`, { waitUntil: 'networkidle' });
    assert(page.url().endsWith('/products/food-bakery-bags'), 'Legitimate category /products/food-bakery-bags loads without redirect');
    const fnbHeading = await page.locator('h1').innerText();
    assert(fnbHeading.includes('Food & Bakery'), `Category h1 loaded correctly: "${fnbHeading}"`);

    await page.goto(`${url}/products/ecocraft`, { waitUntil: 'networkidle' });
    assert(page.url().endsWith('/products/ecocraft'), 'Legitimate category /products/ecocraft loads without redirect');

    await page.goto(`${url}/products/kraft-paper-rolls`, { waitUntil: 'networkidle' });
    assert(page.url().endsWith('/products/kraft-paper-rolls'), 'Legitimate category /products/kraft-paper-rolls loads without redirect');

  } catch (err) {
    console.error('Error during test execution:', err);
    failed++;
  } finally {
    await browser.close();
    server.httpServer.close();
  }

  console.log(`\n========================================`);
  console.log(`Playwright Verification Results:`);
  console.log(`Total Passed: ${passed}`);
  console.log(`Total Failed: ${failed}`);
  console.log(`========================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();
