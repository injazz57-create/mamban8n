import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TEST_EMAIL = 'SandraRobinson2858134@gmail.com';
const TEST_PASSWORD = 'ndJ6jQ9D';
const MAMBA_AUTH_URL = 'https://www.mamba.ru/auth';
const MAMBA_URL = 'https://www.mamba.ru/';

const config = {
  url: MAMBA_AUTH_URL,
  selectors: {
    emailInput: 'input[name="login"]',
    passwordInput: 'input[name="password"]',
    loginButton: null,
    successIndicator: null,
    captchaElements: [],
    twoFAElements: [],
  },
  cookies: [],
  antiBot: {
    captchaDetected: false,
    twoFADetected: false,
    recommendations: [
      'Use realistic delays between actions (500-2000ms)',
      'Use headless: true with stealth plugin for production',
      'Maintain consistent user-agent across requests',
      'Handle cookies and sessions properly',
      'Use viewport and screen size similar to real browsers (1280x720+)',
      'Add randomized delays between interactions',
      'Respect rate limiting - avoid rapid-fire requests',
    ],
  },
  timestamp: new Date().toISOString(),
};

async function research() {
  let browser;
  try {
    console.log('🚀 Starting Mamba authentication research...\n');

    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    // Add verbose logging
    page.on('console', msg => {
      if (msg.type() === 'error') console.log(`[Console Error] ${msg.text()}`);
    });

    console.log('📍 Step 1: Navigating to auth page...');
    try {
      await page.goto(MAMBA_AUTH_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (e) {
      console.log('⏱️ Navigation timeout, continuing...');
    }

    console.log('⏳ Waiting for page to fully render...');
    await page.waitForTimeout(5000);

    console.log('\n📍 Step 2: Examining login form structure...');

    // Get all form inputs
    const allInputs = await page.$$eval('input', els => els.map(el => ({
      type: el.type,
      name: el.name,
      id: el.id,
      placeholder: el.placeholder,
      className: el.className,
      value: el.value,
    })));

    console.log(`Found ${allInputs.length} input fields:`);
    allInputs.forEach((inp, i) => {
      console.log(`  ${i}: type=${inp.type}, name=${inp.name}, placeholder=${inp.placeholder}`);
    });

    // Get all buttons
    const allButtons = await page.$$eval('button', els => els.map(el => ({
      text: el.textContent.trim().substring(0, 50),
      type: el.type,
      className: el.className,
      id: el.id,
    })));

    console.log(`\nFound ${allButtons.length} buttons:`);
    allButtons.forEach((btn, i) => {
      console.log(`  ${i}: type=${btn.type}, text=${btn.text}`);
    });

    // Find login button - look for one with action-like text
    const loginButtonIdx = allButtons.findIndex(b => 
      b.text.toLowerCase().includes('sign') || 
      b.text.toLowerCase().includes('login') ||
      b.text.toLowerCase().includes('submit') ||
      b.text.toLowerCase().includes('войти') ||
      b.type === 'submit'
    );

    if (loginButtonIdx >= 0) {
      // Get the button selector
      const buttons = await page.$$('button');
      const loginBtn = buttons[loginButtonIdx];
      const btnText = await loginBtn.textContent();
      const btnType = await loginBtn.getAttribute('type');
      console.log(`\n✅ Found login button: "${btnText.trim()}", type=${btnType}`);
      config.selectors.loginButton = 'button[type="submit"]';
    }

    console.log('\n📍 Step 3: Checking for CAPTCHA/bot protection...');
    const captchaElements = await page.$$eval('*', els => els
      .map((el, i) => {
        const html = el.outerHTML;
        if (html.includes('captcha') || html.includes('recaptcha') || html.includes('hcaptcha') || html.includes('geetest')) {
          return {
            tag: el.tagName,
            className: el.className,
            id: el.id,
            type: html.includes('recaptcha') ? 'recaptcha' : html.includes('hcaptcha') ? 'hcaptcha' : 'other',
          };
        }
        return null;
      })
      .filter(x => x)
    );

    if (captchaElements.length > 0) {
      config.antiBot.captchaDetected = true;
      config.selectors.captchaElements = captchaElements;
      console.log('⚠️ CAPTCHA detected:');
      captchaElements.forEach(c => console.log(`  - Type: ${c.type}, Tag: ${c.tag}`));
    } else {
      console.log('✅ No CAPTCHA detected');
    }

    // Check for 2FA fields
    console.log('\n📍 Step 4: Checking for 2FA fields...');
    const has2FA = await page.$$eval('input', els => {
      return els.some(el => 
        el.name.includes('otp') || 
        el.placeholder.toLowerCase().includes('код') ||
        el.placeholder.toLowerCase().includes('code') ||
        el.placeholder.toLowerCase().includes('verification')
      );
    });

    if (has2FA) {
      config.antiBot.twoFADetected = true;
      config.selectors.twoFAElements.push('input[name*="otp"]');
      console.log('⚠️ 2FA field detected');
    } else {
      console.log('✅ No 2FA field visible on login form');
    }

    // Attempt login
    console.log('\n📍 Step 5: Attempting login...');
    
    try {
      // Fill email
      const emailInput = await page.$('input[name="login"]');
      if (emailInput) {
        await emailInput.fill(TEST_EMAIL);
        console.log(`✅ Filled email field: ${TEST_EMAIL}`);
        await page.waitForTimeout(500);
      }

      // Fill password
      const passwordInput = await page.$('input[name="password"]');
      if (passwordInput) {
        await passwordInput.fill(TEST_PASSWORD);
        console.log(`✅ Filled password field`);
        await page.waitForTimeout(500);
      }

      // Click login button
      const loginButton = await page.$('button[type="submit"]');
      if (loginButton) {
        console.log('🔵 Clicking login button...');
        await loginButton.click();
        
        console.log('⏳ Waiting for response...');
        try {
          await page.waitForNavigation({ timeout: 10000, waitUntil: 'domcontentloaded' });
          console.log('✅ Navigation occurred after login');
        } catch (e) {
          console.log('⏱️ No immediate navigation, waiting for state change...');
          await page.waitForTimeout(3000);
        }
      }
    } catch (e) {
      console.log(`⚠️ Login attempt error: ${e.message.substring(0, 100)}`);
    }

    // Check response
    console.log('\n📍 Step 6: Analyzing response...');
    const currentUrl = page.url();
    const pageTitle = await page.title();
    console.log(`Current URL: ${currentUrl}`);
    console.log(`Page title: ${pageTitle}`);

    // Check for success indicators
    const successIndicators = [
      'div:has-text("profile")',
      'div:has-text("Profile")',
      'a[href*="profile"]',
      'button:has-text("Logout")',
      'button:has-text("logout")',
      'span:has-text("Welcome")',
    ];

    for (const indicator of successIndicators) {
      try {
        const found = await page.locator(indicator).first();
        if (found) {
          config.selectors.successIndicator = indicator;
          console.log(`✅ Success indicator found: ${indicator}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Get cookies
    console.log('\n📍 Step 7: Extracting cookies...');
    const allCookies = await context.cookies();
    console.log(`📦 Total cookies: ${allCookies.length}`);

    allCookies.forEach(cookie => {
      config.cookies.push({
        name: cookie.name,
        domain: cookie.domain,
        path: cookie.path,
        httpOnly: cookie.httpOnly,
        secure: cookie.secure,
        sameSite: cookie.sameSite,
      });
      console.log(`  🍪 ${cookie.name}: [${cookie.value.length} chars]`);
    });

    // Get page HTML for reference
    const html = await page.content();
    fs.writeFileSync('/home/engine/project/mamba-auth-page.html', html);
    console.log('\n✅ Page HTML saved to mamba-auth-page.html');

    await context.close();

    // Output configuration
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESEARCH RESULTS');
    console.log('='.repeat(60));
    console.log(JSON.stringify(config, null, 2));

    // Save config file
    const configPath = path.join(process.cwd(), 'src/config/mamba-config.ts');
    const configDir = path.dirname(configPath);

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configContent = `export const mambaConfig = ${JSON.stringify(config, null, 2)};

export const mambaSelectors = {
  emailInput: "${config.selectors.emailInput}",
  passwordInput: "${config.selectors.passwordInput}",
  loginButton: "${config.selectors.loginButton}",
  successIndicator: "${config.selectors.successIndicator}",
};

export const mambaCookies = [
  ${config.cookies.map(c => `"${c.name}"`).join(',\n  ')}
];

export const mambaSessionService = {
  selectors: ${JSON.stringify(config.selectors, null, 2)},
  cookieNames: ${JSON.stringify(config.cookies.map(c => c.name), null, 2)},
  antiBot: ${JSON.stringify(config.antiBot, null, 2)},
  baseUrl: "${config.url}",
};
`;

    fs.writeFileSync(configPath, configContent);
    console.log(`\n✅ Config saved to: ${configPath}`);

    return config;
  } catch (error) {
    console.error('❌ Research error:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

research().catch(console.error);
