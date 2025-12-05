import { chromium } from 'playwright';
import fs from 'fs';

const MAMBA_URL = 'https://www.mamba.ru/';

async function explore() {
  let browser;
  try {
    console.log('🚀 Starting Mamba exploration...\n');

    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    console.log('📍 Step 1: Navigating to Mamba main page...');
    try {
      await page.goto(MAMBA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (e) {
      console.log('⏱️ Navigation timeout, continuing...');
    }

    console.log('⏳ Waiting for page to render...');
    await page.waitForTimeout(8000);

    // Try different login URLs
    const loginUrls = [
      'https://www.mamba.ru/auth',
      'https://www.mamba.ru/en/auth',
      'https://www.mamba.ru/login',
      'https://www.mamba.ru/en/login',
      'https://www.mamba.ru/registration',
    ];

    for (const loginUrl of loginUrls) {
      console.log(`\n📍 Trying ${loginUrl}...`);
      try {
        await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await page.waitForTimeout(5000);

        // Check if we found form elements
        const inputs = await page.$$eval('input', els => els.map(el => ({
          type: el.type,
          name: el.name,
          id: el.id,
          placeholder: el.placeholder,
          className: el.className,
        })));

        if (inputs.length > 0) {
          console.log(`✅ Found ${inputs.length} inputs at ${loginUrl}`);
          console.log(JSON.stringify(inputs, null, 2));
          
          // Save page content
          const html = await page.content();
          fs.writeFileSync('/home/engine/project/login-page.html', html);
          console.log('✅ Page saved to login-page.html');
          break;
        }
      } catch (e) {
        console.log(`❌ Error: ${e.message.substring(0, 100)}`);
      }
    }

    // Also check current page for login links
    console.log('\n📍 Checking for login links on main page...');
    await page.goto(MAMBA_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const links = await page.$$eval('a', els => els.map(el => ({
      text: el.textContent.trim().substring(0, 50),
      href: el.href,
      className: el.className,
    })).filter(l => l.text.toLowerCase().includes('sign') || 
                     l.text.toLowerCase().includes('login') ||
                     l.text.toLowerCase().includes('вход') ||
                     l.text.toLowerCase().includes('регистр')));

    if (links.length > 0) {
      console.log('Found login/register links:');
      links.forEach((link, i) => {
        console.log(`  ${i}: ${link.text} -> ${link.href}`);
      });
    }

    // Also look for buttons with login text
    const buttons = await page.$$eval('button', els => els.map(el => ({
      text: el.textContent.trim().substring(0, 50),
      className: el.className,
      id: el.id,
      type: el.type,
    })).filter(b => b.text.toLowerCase().includes('sign') || 
                     b.text.toLowerCase().includes('login') ||
                     b.text.toLowerCase().includes('вход')));

    if (buttons.length > 0) {
      console.log('\nFound login buttons:');
      buttons.forEach((btn, i) => {
        console.log(`  ${i}: ${btn.text}`);
      });
    }

    // Try looking for a form or auth modal
    const forms = await page.$$eval('form', els => els.map(el => ({
      id: el.id,
      className: el.className,
      action: el.action,
      method: el.method,
    })));

    if (forms.length > 0) {
      console.log('\nFound forms:');
      forms.forEach((form, i) => {
        console.log(`  ${i}:`, form);
      });
    }

    await context.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) await browser.close();
  }
}

explore();
