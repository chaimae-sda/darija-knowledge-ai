const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER_LOG:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERROR:', err.message));
    try {
        await page.goto('http://localhost:5173', { timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (e) {
        console.log('LOAD_ERROR:', e.message);
    }
    await browser.close();
})();
