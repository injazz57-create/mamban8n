import { chromium } from 'playwright';
import fs from 'fs';

const MAMBA_URL = 'https://www.mamba.ru/';

async function debug() {
  let browser;
  try {
    console.log('🚀 Starting debug...');

    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    console.log('\n📍 Navigating to Mamba.ru...');
    try {
      await page.goto(MAMBA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (e) {
      console.log('⏱️ Navigation timeout');
    }

    console.log('⏳ Waiting for React to render...');
    await page.waitForTimeout(10000);

    console.log('\n📍 Checking page content...');
    const title = await page.title();
    const url = page.url();
    console.log(`Title: ${title}`);
    console.log(`URL: ${url}`);

    // Use evaluate to check DOM directly
    const pageInfo = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      const buttons = document.querySelectorAll('button');
      return {
        inputCount: inputs.length,
        buttonCount: buttons.length,
        htmlLength: document.documentElement.outerHTML.length,
        bodyHTML: document.body.innerHTML.substring(0, 500),
      };
    });

    console.log(`\n Page info:`, pageInfo);

    // Get all input elements
    const inputs = await page.locator('input').all();
    console.log(`\n Found ${inputs.length} input elements via locator`);

    // Try CSS selectors directly
    const inputElements = await page.$('input');
    console.log(`Found ${inputElements.length} input elements via $`);
    
    if (inputElements.length > 0) {
      for (let i = 0; i < inputElements.length && i < 10; i++) {
        const attrs = await page.evaluate(el => ({
          type: el.type,
          name: el.name,
          id: el.id,
          placeholder: el.placeholder,
          className: el.className,
        }), inputElements[i]);
        console.log(`  Input ${i}:`, attrs);
      }
    }

    // Get all buttons
    const buttonElements = await page.$('button');
    console.log(`\nFound ${buttonElements.length} button elements via $`);
    
    if (buttonElements.length > 0) {
      for (let i = 0; i < buttonElements.length && i < 10; i++) {
        const info = await page.evaluate(el => ({
          text: el.textContent.substring(0, 50),
          className: el.className,
          id: el.id,
          type: el.type,
        }), buttonElements[i]);
        console.log(`  Button ${i}:`, info);
      }
    }

    // Get page HTML for inspection
    const html = await page.content();
    fs.writeFileSync('/home/engine/project/page-content.html', html);
    console.log('\n✅ Page HTML saved to page-content.html');

    // Check for login form
    const loginForms = await page.locator('form').all();
    console.log(`\n Found ${loginForms.length} form elements`);

    // Look for specific patterns
    const links = await page.locator('a').all();
    console.log(`\n Found ${links.length} link elements, checking for "вход" or "login":`);
    for (let i = 0; i < links.length && i < 20; i++) {
      try {
        const text = await links[i].textContent();
        if (text && (text.toLowerCase().includes('вход') || text.toLowerCase().includes('login'))) {
          const href = await links[i].getAttribute('href');
          console.log(`  Link: ${text.trim()} -> ${href}`);
        }
      } catch (e) {}
    }

    await context.close();
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (browser) await browser.close();
  }
}

debug();
