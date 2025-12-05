import { chromium } from 'playwright';
import fs from 'fs';

const MAMBA_URL = 'https://www.mamba.ru/';

// Try using a session cookie/cookie jar from a known working session
// For now, let's try to use the login session more directly
const TEST_EMAIL = 'SandraRobinson2858134@gmail.com';
const TEST_PASSWORD = 'ndJ6jQ9D';

const researchData = {
  dialogs: {
    url: null,
    selectors: {},
    structure: null,
  },
  messages: {
    selectors: {},
    structure: null,
  },
  likes: {
    url: null,
    selectors: {},
    structure: null,
  },
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function research() {
  let browser;
  try {
    console.log('🚀 Starting Mamba research with session handling...\n');
    
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });
    
    // Try to create a persistent context
    const contextPath = '/tmp/mamba-browser-context';
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      storageState: fs.existsSync(`${contextPath}.json`) ? `${contextPath}.json` : undefined,
    });
    
    const page = await context.newPage();
    
    // Navigate to main page
    console.log('Navigating to Mamba homepage...');
    await page.goto(MAMBA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(2000);
    
    console.log(`Current URL: ${page.url()}`);
    console.log(`Page title: ${await page.title()}\n`);
    
    // Check if we're logged in
    const userInfo = await page.evaluate(() => {
      return {
        hasUserMenu: !!document.querySelector('[class*="user"], [class*="profile"], [class*="account"]'),
        bodyClass: document.body.className,
        allLinks: Array.from(document.querySelectorAll('a')).slice(0, 20).map(a => ({ href: a.href, text: a.textContent.trim() }))
      };
    });
    
    console.log('Page analysis:');
    console.log(`Has user menu: ${userInfo.hasUserMenu}`);
    console.log(`Body classes: ${userInfo.bodyClass}\n`);
    console.log('Links found:');
    userInfo.allLinks.forEach((link, i) => {
      if (link.href) console.log(`  ${i}: ${link.href} (${link.text.substring(0, 50)})`);
    });
    
    // Save page HTML
    let html = await page.content();
    fs.writeFileSync('/home/engine/project/page-main.html', html);
    console.log('\n✅ Main page HTML saved');
    
    // Find and analyze dialogs section
    console.log('\n📍 Looking for dialogs section...');
    
    const links = await page.$$('a');
    for (let link of links) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && (href.includes('dialog') || href.includes('message') || text.toLowerCase().includes('message') || text.toLowerCase().includes('dialog'))) {
        console.log(`✅ Found dialogs link: ${href} (${text.trim()})`);
        
        console.log('Navigating...');
        try {
          await link.click();
          await delay(3000);
          
          const dialogUrl = page.url();
          console.log(`Dialog URL: ${dialogUrl}`);
          researchData.dialogs.url = dialogUrl;
          
          // Analyze dialogs page
          html = await page.content();
          fs.writeFileSync('/home/engine/project/page-dialogs-direct.html', html);
          
          const dialogAnalysis = await page.evaluate(() => {
            // Find dialog list items
            const items = [];
            const selectors = ['li', 'div[role="listitem"]', '[class*="message"]', '[class*="dialog"]'];
            
            for (const sel of selectors) {
              const els = document.querySelectorAll(sel);
              if (els.length > 2) {
                Array.from(els).slice(0, 3).forEach((el, idx) => {
                  items.push({
                    selector: sel,
                    tag: el.tagName.toLowerCase(),
                    classes: el.className.split(' '),
                    text: el.textContent.substring(0, 200).trim(),
                  });
                });
                break;
              }
            }
            
            // Find inputs
            const inputs = [];
            document.querySelectorAll('input, textarea, [contenteditable]').forEach((el, idx) => {
              if (idx < 5) {
                inputs.push({
                  tag: el.tagName.toLowerCase(),
                  type: el.getAttribute('type'),
                  placeholder: el.getAttribute('placeholder'),
                  classes: el.className,
                });
              }
            });
            
            // Find buttons
            const buttons = [];
            document.querySelectorAll('button').forEach((el, idx) => {
              if (idx < 10) {
                buttons.push({
                  text: el.textContent.trim().substring(0, 50),
                  classes: el.className,
                  ariaLabel: el.getAttribute('aria-label'),
                });
              }
            });
            
            return { items, inputs, buttons };
          });
          
          console.log(`\nDialog page analysis:`);
          console.log(`  Dialog items: ${dialogAnalysis.items.length}`);
          dialogAnalysis.items.forEach((item, i) => {
            console.log(`    [${i}] <${item.tag}> classes="${item.classes.join(' ')}" text="${item.text.substring(0, 80)}..."`);
          });
          
          console.log(`\n  Inputs: ${dialogAnalysis.inputs.length}`);
          dialogAnalysis.inputs.forEach((inp, i) => {
            console.log(`    [${i}] <${inp.tag}> type="${inp.type}" placeholder="${inp.placeholder}"`);
            
            if (inp.placeholder && (inp.placeholder.toLowerCase().includes('message') || inp.placeholder.toLowerCase().includes('сообщение'))) {
              researchData.messages.selectors.input = inp;
            }
          });
          
          console.log(`\n  Buttons: ${dialogAnalysis.buttons.length}`);
          dialogAnalysis.buttons.forEach((btn, i) => {
            console.log(`    [${i}] "${btn.text}" aria-label="${btn.ariaLabel}"`);
          });
          
          researchData.dialogs.structure = dialogAnalysis;
          break;
        } catch (e) {
          console.log(`Error navigating: ${e.message.substring(0, 100)}`);
        }
      }
    }
    
    // Find likes section
    console.log('\n📍 Looking for likes section...');
    
    for (let link of links) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && (href.includes('like') || href.includes('admirer') || text.toLowerCase().includes('like'))) {
        console.log(`✅ Found likes link: ${href} (${text.trim()})`);
        
        console.log('Navigating...');
        try {
          await link.click();
          await delay(3000);
          
          const likesUrl = page.url();
          console.log(`Likes URL: ${likesUrl}`);
          researchData.likes.url = likesUrl;
          
          html = await page.content();
          fs.writeFileSync('/home/engine/project/page-likes-direct.html', html);
          
          const likesAnalysis = await page.evaluate(() => {
            const items = [];
            document.querySelectorAll('div, li, [role="listitem"]').forEach((el, idx) => {
              if (idx < 5) {
                items.push({
                  tag: el.tagName.toLowerCase(),
                  classes: el.className,
                  text: el.textContent.substring(0, 150).trim(),
                });
              }
            });
            
            const buttons = [];
            document.querySelectorAll('button').forEach((el, idx) => {
              if (idx < 5) {
                buttons.push({
                  text: el.textContent.trim().substring(0, 50),
                  classes: el.className,
                });
              }
            });
            
            return { items, buttons };
          });
          
          console.log(`\nLikes page analysis:`);
          console.log(`  Elements: ${likesAnalysis.items.length}`);
          console.log(`  Buttons: ${likesAnalysis.buttons.length}`);
          
          researchData.likes.structure = likesAnalysis;
          break;
        } catch (e) {
          console.log(`Error navigating: ${e.message.substring(0, 100)}`);
        }
      }
    }
    
    // Save state for next use
    await context.storageState({ path: `${contextPath}.json` });
    console.log('\n✅ Browser context saved');
    
    // OUTPUT RESULTS
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESEARCH RESULTS');
    console.log('='.repeat(70));
    console.log(JSON.stringify(researchData, null, 2));
    
    fs.writeFileSync('/home/engine/project/research-results.json', JSON.stringify(researchData, null, 2));
    
    await context.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

research().catch(console.error);
