import { chromium } from 'playwright';
import fs from 'fs';

const TEST_EMAIL = 'SandraRobinson2858134@gmail.com';
const TEST_PASSWORD = 'ndJ6jQ9D';
const MAMBA_AUTH_URL = 'https://www.mamba.ru/auth';

const researchData = {
  dialogs: {
    url: null,
    selectors: {
      dialogLink: null,
      dialogsList: null,
      dialogItem: null,
      dialogProfile: null,
      dialogMessage: null,
      dialogTimestamp: null,
      dialogUnread: null,
    },
    samples: [],
  },
  messages: {
    url: null,
    selectors: {
      messageInput: null,
      sendButton: null,
      messageList: null,
      messageItem: null,
      messageText: null,
      messageTime: null,
      messageSender: null,
      messageAvatar: null,
    },
    samples: [],
  },
  likes: {
    url: null,
    selectors: {
      likeButton: null,
      likeCounter: null,
      likesList: null,
      likeItem: null,
      likeProfile: null,
    },
    samples: [],
  },
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function research() {
  let browser;
  try {
    console.log('🚀 Starting Mamba advanced research...\n');
    
    browser = await chromium.launch({
      headless: true,
      args: ['--disable-dev-shm-usage', '--no-sandbox'],
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    
    const page = await context.newPage();
    
    // LOGIN
    console.log('📍 PHASE 1: LOGIN');
    console.log('=================\n');
    
    console.log('Navigating to auth...');
    await page.goto(MAMBA_AUTH_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(3000);
    
    console.log(`Page loaded. URL: ${page.url()}`);
    console.log(`Title: ${await page.title()}\n`);
    
    console.log('Filling credentials...');
    await page.fill('input[name="login"]', TEST_EMAIL);
    await delay(300);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await delay(300);
    
    console.log('Clicking submit...');
    await page.click('button[type="submit"]');
    
    try {
      await page.waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' });
    } catch (e) {
      await delay(3000);
    }
    
    const afterLoginUrl = page.url();
    console.log(`After login URL: ${afterLoginUrl}\n`);
    
    // Save page HTML
    let pageHtml = await page.content();
    fs.writeFileSync('/home/engine/project/page-after-login.html', pageHtml);
    
    await delay(2000);
    
    // DIALOGS SECTION
    console.log('📍 PHASE 2: DIALOGS/MESSAGES');
    console.log('=============================\n');
    
    // Find dialogs link
    console.log('Looking for dialogs navigation...');
    const allA = await page.$$eval('a', els => els.map(e => ({ href: e.href, text: e.textContent.trim(), className: e.className })));
    const allBtn = await page.$$eval('button', els => els.map(e => ({ text: e.textContent.trim(), className: e.className, ariaLabel: e.getAttribute('aria-label') })));
    
    console.log(`Found ${allA.length} links and ${allBtn.length} buttons\n`);
    
    // Look for dialogs/messages/chat in links
    let dialogLink = null;
    for (const link of allA) {
      if (link.href.includes('dialog') || link.href.includes('message') || link.href.includes('chat') || 
          link.text.toLowerCase().includes('диалог') || link.text.toLowerCase().includes('сообщение') ||
          link.text.toLowerCase().includes('message') || link.text.toLowerCase().includes('chat')) {
        console.log(`✅ Found dialogs link: ${link.href} (${link.text})`);
        dialogLink = link.href;
        researchData.dialogs.selectors.dialogLink = `a[href="${link.href}"]`;
        break;
      }
    }
    
    if (dialogLink) {
      console.log(`\nNavigating to dialogs: ${dialogLink}`);
      await page.goto(dialogLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await delay(2000);
      
      researchData.dialogs.url = page.url();
      console.log(`Dialogs URL: ${researchData.dialogs.url}\n`);
      
      // Save dialogs page
      pageHtml = await page.content();
      fs.writeFileSync('/home/engine/project/page-dialogs.html', pageHtml);
      
      // Analyze dialogs page
      console.log('Analyzing dialogs page structure...');
      
      // Find dialog items
      const dialogItems = await page.evaluate(() => {
        // Try different selectors
        let items = [];
        
        // Try common selectors
        const selectors = [
          'li', 'div[role="listitem"]', '[class*="dialog"]', '[class*="chat"]', '[class*="message"]'
        ];
        
        for (const sel of selectors) {
          const els = document.querySelectorAll(sel);
          if (els.length > 2) { // More than 2 likely means list
            items = Array.from(els).slice(0, 5).map((el, idx) => ({
              index: idx,
              tag: el.tagName.toLowerCase(),
              className: el.className,
              id: el.id,
              textPreview: el.textContent.substring(0, 150).trim(),
              html: el.outerHTML.substring(0, 400),
            }));
            if (items.length > 0) break;
          }
        }
        
        return { items, foundWith: 'li or similar' };
      });
      
      if (dialogItems.items.length > 0) {
        console.log(`✅ Found ${dialogItems.items.length} dialog items:\n`);
        dialogItems.items.forEach(item => {
          console.log(`  <${item.tag} class="${item.className}"> ${item.textPreview.substring(0, 80)}...\n`);
          researchData.dialogs.samples.push(item);
        });
        
        // Set dialog item selector
        if (dialogItems.items[0].className) {
          const className = dialogItems.items[0].className.split(' ')[0];
          researchData.dialogs.selectors.dialogItem = `${dialogItems.items[0].tag}[class*="${className}"]`;
        } else {
          researchData.dialogs.selectors.dialogItem = dialogItems.items[0].tag;
        }
      }
      
      // Look for message input if we're in a dialog
      console.log('\n📍 Looking for message input...');
      const inputElements = await page.evaluate(() => {
        const inputs = [];
        
        // Find all input-like elements
        document.querySelectorAll('input, textarea, [contenteditable]').forEach((el, idx) => {
          if (idx < 10) {
            inputs.push({
              tag: el.tagName.toLowerCase(),
              type: el.getAttribute('type'),
              placeholder: el.getAttribute('placeholder'),
              className: el.className,
              id: el.id,
              ariaLabel: el.getAttribute('aria-label'),
            });
          }
        });
        
        return inputs;
      });
      
      console.log(`Found ${inputElements.length} input elements:`);
      inputElements.forEach((inp, i) => {
        console.log(`  ${i}: <${inp.tag}> type="${inp.type}" placeholder="${inp.placeholder}" aria-label="${inp.ariaLabel}"`);
        
        if (inp.placeholder && (inp.placeholder.toLowerCase().includes('message') || inp.placeholder.toLowerCase().includes('сообщение'))) {
          researchData.messages.selectors.messageInput = `${inp.tag}[placeholder="${inp.placeholder}"]`;
        }
      });
      
      // Look for send button
      console.log('\n📍 Looking for send button...');
      const buttons = await page.evaluate(() => {
        const btns = [];
        document.querySelectorAll('button').forEach((el, idx) => {
          if (idx < 20) {
            btns.push({
              text: el.textContent.trim().substring(0, 50),
              ariaLabel: el.getAttribute('aria-label'),
              className: el.className,
              type: el.getAttribute('type'),
            });
          }
        });
        return btns;
      });
      
      console.log(`Found ${buttons.length} buttons:`);
      buttons.forEach((btn, i) => {
        console.log(`  ${i}: "${btn.text}" aria-label="${btn.ariaLabel}"`);
        
        if (btn.text.toLowerCase().includes('send') || btn.text.toLowerCase().includes('отправить') ||
            btn.ariaLabel?.toLowerCase().includes('send') || btn.ariaLabel?.toLowerCase().includes('отправить')) {
          researchData.messages.selectors.sendButton = `button:has-text("${btn.text}")`;
        }
      });
    } else {
      console.log('⚠️ Could not find dialogs link');
    }
    
    // LIKES SECTION
    console.log('\n📍 PHASE 3: LIKES');
    console.log('==================\n');
    
    // Try to find likes section
    let likeLink = null;
    for (const link of allA) {
      if (link.href.includes('like') || link.href.includes('admirer') || 
          link.text.toLowerCase().includes('лайк') || link.text.toLowerCase().includes('like')) {
        console.log(`✅ Found likes link: ${link.href} (${link.text})`);
        likeLink = link.href;
        researchData.likes.selectors.likeButton = `a[href="${link.href}"]`;
        break;
      }
    }
    
    if (likeLink) {
      console.log(`\nNavigating to likes: ${likeLink}`);
      await page.goto(likeLink, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await delay(2000);
      
      researchData.likes.url = page.url();
      console.log(`Likes URL: ${researchData.likes.url}\n`);
      
      // Save likes page
      pageHtml = await page.content();
      fs.writeFileSync('/home/engine/project/page-likes.html', pageHtml);
      
      // Analyze likes page
      console.log('Analyzing likes page structure...');
      
      const likeItems = await page.evaluate(() => {
        const items = [];
        document.querySelectorAll('div, li').forEach((el, idx) => {
          if (idx < 10) {
            items.push({
              tag: el.tagName.toLowerCase(),
              className: el.className,
              textPreview: el.textContent.substring(0, 100).trim(),
            });
          }
        });
        return items;
      });
      
      console.log(`Found elements on likes page:\n`);
      likeItems.forEach(item => {
        console.log(`  <${item.tag} class="${item.className}"> ${item.textPreview.substring(0, 80)}`);
        researchData.likes.samples.push(item);
      });
    } else {
      console.log('⚠️ Could not find likes link');
    }
    
    // SUMMARY
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESEARCH RESULTS');
    console.log('='.repeat(70));
    
    console.log(JSON.stringify(researchData, null, 2));
    
    // Save research data
    fs.writeFileSync('/home/engine/project/research-data.json', JSON.stringify(researchData, null, 2));
    console.log('\n✅ Research data saved to research-data.json');
    
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
