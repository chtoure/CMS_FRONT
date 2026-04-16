import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:5173/site/admin/builder/page-revision/update/4', { waitUntil: 'networkidle2' });
    
    // Login
    console.log('Logging in...');
    await page.type('input[type="email"]', 'takpaagilbert@gmail.com');
    await page.type('input[type="password"]', '12345678');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log('In builder. Waiting for canvas to render...');
    await page.waitForSelector('.device-wrapper', { timeout: 10000 });

    const deviceWrapper = await page.$('.device-wrapper');
    const transform = await page.evaluate(el => window.getComputedStyle(el).transform, deviceWrapper);
    console.log('device-wrapper transform:', transform);

    // Let's inject a fixed style manually into one of the components to see what happens
    console.log('Injecting position: fixed to a component...');
    await page.evaluate(() => {
       const cmp = document.querySelector('.device-wrapper .relative.transition-all > div > div > div'); 
       if (cmp) {
           cmp.style.setProperty('position', 'fixed', 'important');
           cmp.style.setProperty('top', '50px', 'important');
           cmp.style.setProperty('left', '50px', 'important');
           cmp.style.setProperty('z-index', '9999', 'important');
           cmp.classList.add('my-test-fixed-element');
           console.log('Fixed element injected!', cmp);
       }
    });

    await page.screenshot({ path: '/tmp/before_scroll.png' });
    console.log('Saved before_scroll.png');

    // Scroll the inner container
    console.log('Scrolling the inner canvas...');
    await page.evaluate(() => {
       const scroller = document.querySelector('.device-wrapper .overflow-y-auto');
       if (scroller) {
          scroller.scrollTop = 300;
       }
    });

    await page.screenshot({ path: '/tmp/after_scroll_inner.png' });
    console.log('Saved after_scroll_inner.png');

    // Get the rect of the element
    const rect1 = await page.evaluate(() => {
        const cmp = document.querySelector('.my-test-fixed-element');
        return cmp ? cmp.getBoundingClientRect() : null;
    });
    console.log('Rect after inner scroll:', rect1);

    // Scroll outer container
    console.log('Scrolling the outer canvas...');
    await page.evaluate(() => {
       const outerScroller = document.querySelector('.flex-1.overflow-auto');
       if (outerScroller) {
          outerScroller.scrollTop = 300;
       }
    });

    await page.screenshot({ path: '/tmp/after_scroll_outer.png' });
    console.log('Saved after_scroll_outer.png');

    const rect2 = await page.evaluate(() => {
        const cmp = document.querySelector('.my-test-fixed-element');
        return cmp ? cmp.getBoundingClientRect() : null;
    });
    console.log('Rect after outer scroll:', rect2);

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
