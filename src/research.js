import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TEST_EMAIL = 'SandraRobinson2858134@gmail.com';
const TEST_PASSWORD = 'ndJ6jQ9D';
const MAMBA_URL = 'https://www.mamba.ru/';

const selectors = {
  emailInput: null,
  passwordInput: null,
  loginButton: null,
  successIndicator: null,
  captchaElements: [],
  twoFAElements: [],
};

const cookies = [];
const antiBot = {
  captchaDetected: false,
  twoFADetected: false,
  recommendations: [],
};

async function research() {
  let browser;
  try {
    console.log('🚀 Starting Mamba authentication research...');

    browser = await chromium.launch({
      headless: true, // Run in headless mode in this environment
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    });

    const page = await context.newPage();

    // Enable debugging and log network requests
    page.on('console', msg => {
      if (msg.type() !== 'log') {
        console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    console.log('\n📍 Step 1: Navigating to Mamba.ru...');
    try {
      await page.goto(MAMBA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    } catch (e) {
      console.log('⏱️ Navigation timeout, but proceeding with page content...');
    }
    console.log('✅ Page loaded');

    console.log('\n📍 Step 2: Searching for login form and selectors...');
    
    // Wait a moment for page to fully render
    await page.waitForTimeout(2000);

    // Try to find login form - look for common patterns
    const emailSelectors = [
      'input[type="email"]',
      'input[name*="email" i]',
      'input[id*="email" i]',
      'input[placeholder*="email" i]',
      'input[placeholder*="почта" i]',
      'input[class*="email" i]',
      '#login',
      'input[name="login"]',
      'input[data-testid*="email"]',
    ];

    const passwordSelectors = [
      'input[type="password"]',
      'input[name*="password" i]',
      'input[id*="password" i]',
      'input[name*="passwd" i]',
      'input[placeholder*="пароль" i]',
      'input[class*="password" i]',
      'input[data-testid*="password"]',
    ];

    const loginButtonSelectors = [
      'button:has-text("Вход")',
      'button:has-text("Login")',
      'button[type="submit"]',
      'button[name*="login" i]',
      'button[id*="login" i]',
      'a:has-text("Вход")',
      'input[type="submit"][value*="вход" i]',
      '[data-testid*="login-button"]',
    ];

    // Find email input
    for (const selector of emailSelectors) {
      try {
        if (await page.$(selector)) {
          selectors.emailInput = selector;
          console.log(`✅ Found email input: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Find password input
    for (const selector of passwordSelectors) {
      try {
        if (await page.$(selector)) {
          selectors.passwordInput = selector;
          console.log(`✅ Found password input: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Find login button
    for (const selector of loginButtonSelectors) {
      try {
        if (await page.$(selector)) {
          selectors.loginButton = selector;
          console.log(`✅ Found login button: ${selector}`);
          break;
        }
      } catch (e) {
        // Continue
      }
    }

    // Check for CAPTCHA
    console.log('\n📍 Step 3: Checking for CAPTCHA/bot protection...');
    const captchaPatterns = [
      'iframe[src*="captcha"]',
      'div[class*="captcha" i]',
      'div[id*="captcha" i]',
      'script[src*="recaptcha"]',
      'script[src*="hcaptcha"]',
      'div[class*="geetest"]',
      'div[id*="geetest"]',
    ];

    for (const pattern of captchaPatterns) {
      if (await page.$(pattern)) {
        antiBot.captchaDetected = true;
        selectors.captchaElements.push(pattern);
        console.log(`⚠️ CAPTCHA detected: ${pattern}`);
      }
    }

    // Try to login
    if (selectors.emailInput && selectors.passwordInput && selectors.loginButton) {
      console.log('\n📍 Step 4: Logging in...');
      
      await page.fill(selectors.emailInput, TEST_EMAIL);
      console.log(`✅ Entered email: ${TEST_EMAIL}`);
      
      await page.fill(selectors.passwordInput, TEST_PASSWORD);
      console.log(`✅ Entered password`);

      // Add delay to mimic human behavior
      await page.waitForTimeout(1000);

      await page.click(selectors.loginButton);
      console.log(`✅ Clicked login button`);

      // Wait for navigation or response
      try {
        await page.waitForNavigation({ timeout: 10000, waitUntil: 'networkidle' });
        console.log('✅ Navigation detected after login');
      } catch (e) {
        console.log('⏱️ No immediate navigation, checking page state...');
        await page.waitForTimeout(3000);
      }

      // Check for 2FA
      console.log('\n📍 Step 5: Checking for 2FA/additional authentication...');
      const twoFAPatterns = [
        'input[placeholder*="код" i]',
        'input[placeholder*="code" i]',
        'input[name*="otp" i]',
        'input[name*="verification" i]',
        'div:has-text("Код подтверждения")',
        'div:has-text("Verification code")',
      ];

      for (const pattern of twoFAPatterns) {
        if (await page.$(pattern)) {
          antiBot.twoFADetected = true;
          selectors.twoFAElements.push(pattern);
          console.log(`⚠️ 2FA detected: ${pattern}`);
        }
      }

      // Get cookies
      console.log('\n📍 Step 6: Extracting cookies...');
      const allCookies = await context.cookies();
      allCookies.forEach(cookie => {
        cookies.push({
          name: cookie.name,
          value: cookie.value.substring(0, 50) + (cookie.value.length > 50 ? '...' : ''),
          domain: cookie.domain,
          path: cookie.path,
          httpOnly: cookie.httpOnly,
          secure: cookie.secure,
          sameSite: cookie.sameSite,
        });
        console.log(`🍪 ${cookie.name}: ${cookie.value.substring(0, 50)}...`);
      });

      // Check page title and URL to determine success
      const pageUrl = page.url();
      const pageTitle = await page.title();
      console.log(`\n📍 Current URL: ${pageUrl}`);
      console.log(`📍 Page Title: ${pageTitle}`);

      // Try to find success indicator
      const possibleSuccessIndicators = [
        'div:has-text("профиль")',
        'div:has-text("Мой профиль")',
        'a[href*="profile"]',
        'a[href*="account"]',
        'button:has-text("Выход")',
        'button:has-text("Logout")',
        '.user-info',
        '[class*="user"]',
      ];

      for (const indicator of possibleSuccessIndicators) {
        if (await page.$(indicator)) {
          selectors.successIndicator = indicator;
          console.log(`✅ Success indicator found: ${indicator}`);
          break;
        }
      }
    } else {
      console.log('❌ Could not find all login form elements');
    }

    // Recommendations
    console.log('\n📍 Step 7: Anti-bot recommendations...');
    antiBot.recommendations.push('Use realistic delays between actions (1-3 seconds)');
    antiBot.recommendations.push('Use headless: false for initial testing, then headless: true with stealth mode');
    antiBot.recommendations.push('Maintain consistent user-agent across requests');
    antiBot.recommendations.push('Handle cookies and sessions properly');
    antiBot.recommendations.push('Use viewport and screen size similar to real browsers');

    if (antiBot.captchaDetected) {
      antiBot.recommendations.push('IMPORTANT: CAPTCHA detected - may need manual solving or specialized service');
    }

    if (antiBot.twoFADetected) {
      antiBot.recommendations.push('IMPORTANT: 2FA detected - requires manual input or SMS interception');
    }

    console.log('\n📋 Recommendations:');
    antiBot.recommendations.forEach(rec => console.log(`  • ${rec}`));

    await context.close();

    // Create config file
    const config = {
      url: MAMBA_URL,
      selectors,
      cookies: cookies.map(c => c.name),
      antiBot,
      timestamp: new Date().toISOString(),
    };

    console.log('\n📊 FINAL CONFIGURATION:');
    console.log(JSON.stringify(config, null, 2));

    // Save to file
    const configPath = path.join(process.cwd(), 'src/config/mamba-config.ts');
    const configDir = path.dirname(configPath);

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const configContent = `export const mambaConfig = ${JSON.stringify(config, null, 2)};

export const mambaSessionService = {
  selectors: ${JSON.stringify(config.selectors, null, 2)},
  cookieNames: ${JSON.stringify(config.cookies, null, 2)},
  antiBot: ${JSON.stringify(config.antiBot, null, 2)},
};
`;

    fs.writeFileSync(configPath, configContent);
    console.log(`\n✅ Config saved to: ${configPath}`);

    return config;
  } catch (error) {
    console.error('❌ Error during research:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

research().catch(console.error);
