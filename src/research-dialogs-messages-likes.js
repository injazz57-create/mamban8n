import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const TEST_EMAIL = 'SandraRobinson2858134@gmail.com';
const TEST_PASSWORD = 'ndJ6jQ9D';
const MAMBA_AUTH_URL = 'https://www.mamba.ru/auth';
const MAMBA_URL = 'https://www.mamba.ru/';

const researchData = {
  auth: {
    selectors: {
      emailInput: 'input[name="login"]',
      passwordInput: 'input[name="password"]',
      loginButton: 'button[type="submit"]',
    },
  },
  dialogs: {
    url: null,
    selectors: {
      messagesSection: null,
      dialogsList: null,
      dialogItem: null,
      dialogName: null,
      dialogAvatar: null,
      dialogTimestamp: null,
      dialogUnreadBadge: null,
    },
    structure: null,
  },
  messages: {
    selectors: {
      messageInput: null,
      sendButton: null,
      messageList: null,
      messageItem: null,
      messageText: null,
      messageTime: null,
      messageStatus: null,
      messageAvatar: null,
    },
    structure: null,
  },
  likes: {
    url: null,
    selectors: {
      likesSection: null,
      likeButton: null,
      likeCounter: null,
      likesList: null,
      likeItem: null,
    },
    structure: null,
  },
  insights: {
    navigationPaths: [],
    domStructure: [],
  }
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function analyzeStructure(page, selector, name) {
  try {
    const elements = await page.$$(selector);
    if (elements.length === 0) return null;
    
    const element = elements[0];
    const html = await element.evaluate(el => {
      return {
        outerHTML: el.outerHTML.substring(0, 500),
        textContent: el.textContent.substring(0, 200),
        classes: el.className,
        id: el.id,
        children: el.children.length,
        innerHTML: el.innerHTML.substring(0, 500),
      };
    });
    
    return { selector, name, ...html };
  } catch (e) {
    return null;
  }
}

async function findDialogsNavigation(page) {
  console.log('\n📍 Searching for dialogs/messages navigation...');
  
  // Check common selectors for dialogs/messages
  const commonSelectors = [
    'a[href*="dialogs"]',
    'a[href*="messages"]',
    'a[href*="chat"]',
    'button[aria-label*="Message"]',
    'button[aria-label*="Dialog"]',
    'nav a',
    '[role="navigation"] a',
  ];
  
  for (const selector of commonSelectors) {
    try {
      const elements = await page.$(selector);
      for (let el of elements) {
        const href = await el.getAttribute('href');
        const text = await el.textContent();
        if (href || text) {
          console.log(`  Found: ${selector} -> href: ${href}, text: ${text.trim().substring(0, 50)}`);
          researchData.insights.navigationPaths.push({
            selector,
            href,
            text: text.trim().substring(0, 100),
          });
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Try to find dialogs section by looking for common text patterns
  try {
    const bodyText = await page.textContent();
    if (bodyText && (bodyText.includes('Диалог') || bodyText.includes('Сообщение'))) {
      console.log('✅ Found Russian text indicating dialogs/messages section');
      researchData.insights.navigationPaths.push({
        note: 'Russian dialogs/messages text detected',
        text: 'Диалог/Сообщение present',
      });
    }
  } catch (e) {
    // Continue
  }
}

async function findDialogsSection(page) {
  console.log('\n📍 Step 1: Finding dialogs/messages section...');
  
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  // First try to find and click on messages/dialogs in navigation
  const possibleNavSelectors = [
    { selector: 'a[href*="dialogs"]', name: 'dialogs link' },
    { selector: 'a[href*="messages"]', name: 'messages link' },
    { selector: 'a[href*="chat"]', name: 'chat link' },
    { selector: 'button:has-text("Диалог")', name: 'dialogs button (RU)' },
    { selector: 'button:has-text("Сообщение")', name: 'messages button (RU)' },
  ];
  
  for (const { selector, name } of possibleNavSelectors) {
    try {
      const el = await page.$(selector);
      if (el) {
        console.log(`  Found: ${name}`);
        await el.click();
        await delay(2000);
        const newUrl = page.url();
        console.log(`  Navigated to: ${newUrl}`);
        researchData.dialogs.url = newUrl;
        break;
      }
    } catch (e) {
      // Continue
    }
  }
}

async function analyzeDialogsList(page) {
  console.log('\n📍 Step 2: Analyzing dialogs list structure...');
  
  // Try to find common dialog item patterns
  const dialogSelectors = [
    '[class*="dialog"]',
    '[class*="message"]',
    '[class*="chat"]',
    '[role="listitem"]',
    '[data-testid*="dialog"]',
    'div[class*="item"]',
    'li',
  ];
  
  for (const selector of dialogSelectors) {
    try {
      const count = await page.$$eval(selector, els => els.length);
      if (count > 0) {
        console.log(`  Found ${count} elements with selector: ${selector}`);
        
        // Analyze first element
        const firstElement = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          return {
            tag: el.tagName,
            className: el.className,
            id: el.id,
            html: el.outerHTML.substring(0, 300),
            textContent: el.textContent.substring(0, 150),
            children: el.children.length,
          };
        }, selector);
        
        if (firstElement) {
          console.log(`    First element: ${JSON.stringify(firstElement, null, 2)}`);
          researchData.dialogs.selectors.dialogItem = selector;
          researchData.insights.domStructure.push({
            context: 'dialog list',
            selector,
            structure: firstElement,
          });
          break;
        }
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Try to get all dialogs content
  try {
    const dialogs = await page.evaluate(() => {
      const items = document.querySelectorAll('[class*="dialog"], [class*="message"], [role="listitem"], li');
      return Array.from(items.slice(0, 3)).map((item, idx) => ({
        index: idx,
        text: item.textContent.substring(0, 200),
        html: item.outerHTML.substring(0, 300),
        classes: item.className,
      }));
    });
    
    if (dialogs.length > 0) {
      console.log(`\n  Sample dialogs found:`);
      dialogs.forEach((d, i) => {
        console.log(`  Dialog ${i}: ${d.text.trim().substring(0, 100)}`);
      });
      researchData.dialogs.structure = dialogs;
    }
  } catch (e) {
    console.log(`  Could not extract dialogs: ${e.message.substring(0, 100)}`);
  }
}

async function findMessageInput(page) {
  console.log('\n📍 Step 3: Finding message input and send button...');
  
  const inputSelectors = [
    'input[placeholder*="Message"]',
    'input[placeholder*="Сообщение"]',
    'textarea[placeholder*="Message"]',
    'textarea[placeholder*="Сообщение"]',
    '[contenteditable="true"]',
    'input[type="text"][placeholder*="сообщение"]',
    'input[placeholder*="написать"]',
    '.message-input',
    '[class*="input"][class*="message"]',
  ];
  
  for (const selector of inputSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        console.log(`  Found message input: ${selector}`);
        const details = await element.evaluate(el => ({
          tag: el.tagName,
          type: el.type,
          placeholder: el.placeholder,
          className: el.className,
          id: el.id,
        }));
        console.log(`    Details: ${JSON.stringify(details)}`);
        researchData.messages.selectors.messageInput = selector;
        break;
      }
    } catch (e) {
      // Continue
    }
  }
  
  // Look for send button
  const sendButtonSelectors = [
    'button[aria-label*="Send"]',
    'button[aria-label*="Отправить"]',
    'button:has-text("Send")',
    'button:has-text("Отправить")',
    '[class*="send"][class*="button"]',
    'button[class*="send"]',
    '[data-testid*="send"]',
  ];
  
  for (const selector of sendButtonSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        console.log(`  Found send button: ${selector}`);
        const details = await element.evaluate(el => ({
          text: el.textContent.trim(),
          className: el.className,
          id: el.id,
          ariaLabel: el.getAttribute('aria-label'),
        }));
        console.log(`    Details: ${JSON.stringify(details)}`);
        researchData.messages.selectors.sendButton = selector;
        break;
      }
    } catch (e) {
      // Continue
    }
  }
}

async function analyzeMessagesStructure(page) {
  console.log('\n📍 Step 4: Analyzing messages structure...');
  
  // Look for message elements
  const messageSelectors = [
    '[class*="message"]',
    '[role="article"]',
    '.message',
    '[data-testid*="message"]',
    '[class*="chat-item"]',
  ];
  
  for (const selector of messageSelectors) {
    try {
      const count = await page.$$eval(selector, els => els.length);
      if (count > 0) {
        console.log(`  Found ${count} message elements: ${selector}`);
        
        // Analyze first message
        const firstMessage = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          
          // Try to find text, time, status
          const textEl = el.querySelector('[class*="text"], [class*="body"], p, span');
          const timeEl = el.querySelector('[class*="time"], [class*="date"], .timestamp');
          const statusEl = el.querySelector('[class*="status"], [aria-label*="Status"]');
          
          return {
            selector: sel,
            tag: el.tagName,
            className: el.className,
            text: textEl ? textEl.textContent.substring(0, 100) : null,
            time: timeEl ? timeEl.textContent.substring(0, 50) : null,
            status: statusEl ? statusEl.textContent.substring(0, 50) : null,
            html: el.outerHTML.substring(0, 400),
          };
        }, selector);
        
        if (firstMessage) {
          console.log(`    Structure: ${JSON.stringify(firstMessage, null, 2)}`);
          researchData.messages.selectors.messageItem = selector;
          researchData.messages.structure = firstMessage;
          
          // Try to find more specific selectors
          try {
            const messageDetails = await page.evaluate((sel) => {
              const messages = document.querySelectorAll(sel);
              if (messages.length === 0) return [];
              
              return Array.from(messages.slice(0, 3)).map(msg => ({
                text: msg.textContent.substring(0, 150),
                hasTime: !!msg.querySelector('[class*="time"], [class*="date"]'),
                hasStatus: !!msg.querySelector('[class*="status"]'),
                hasAvatar: !!msg.querySelector('img, [class*="avatar"]'),
              }));
            }, selector);
            
            console.log(`    Sample messages: ${JSON.stringify(messageDetails, null, 2)}`);
          } catch (e) {
            // Continue
          }
          break;
        }
      }
    } catch (e) {
      // Continue
    }
  }
}

async function findLikesSection(page) {
  console.log('\n📍 Step 5: Finding likes section...');
  
  // First check if we're on a profile or need to navigate
  const currentUrl = page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  // Look for likes in navigation
  const likesSelectors = [
    'a[href*="likes"]',
    'a[href*="admirers"]',
    'button:has-text("Likes")',
    'button:has-text("Лайки")',
    'a:has-text("Лайки")',
    '[class*="likes"]',
    '[data-testid*="likes"]',
  ];
  
  for (const selector of likesSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        const href = await element.getAttribute('href');
        const text = await element.textContent();
        console.log(`  Found potential likes link: ${selector}`);
        console.log(`    href: ${href}, text: ${text.trim().substring(0, 50)}`);
        
        // Try to navigate
        await element.click();
        await delay(2000);
        const newUrl = page.url();
        console.log(`  Navigated to: ${newUrl}`);
        researchData.likes.url = newUrl;
        break;
      }
    } catch (e) {
      // Continue
    }
  }
  
  // If no specific likes link found, look for like buttons on profiles
  console.log('\n  Searching for like buttons in current view...');
  const likeButtonSelectors = [
    'button[aria-label*="Like"]',
    'button[aria-label*="Лайк"]',
    '[class*="like"][class*="button"]',
    'button[class*="heart"]',
    'svg[class*="like"]',
  ];
  
  for (const selector of likeButtonSelectors) {
    try {
      const count = await page.$$eval(selector, els => els.length);
      if (count > 0) {
        console.log(`  Found ${count} like buttons: ${selector}`);
        researchData.likes.selectors.likeButton = selector;
        
        // Get details of first like button
        const likeDetails = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          return {
            tag: el.tagName,
            className: el.className,
            ariaLabel: el.getAttribute('aria-label'),
            parent: el.parentElement.className,
            html: el.outerHTML.substring(0, 200),
          };
        }, selector);
        
        console.log(`    Details: ${JSON.stringify(likeDetails)}`);
        break;
      }
    } catch (e) {
      // Continue
    }
  }
}

async function tryToSendMessage(page) {
  console.log('\n📍 Step 6: Attempting to send test message...');
  
  if (!researchData.messages.selectors.messageInput) {
    console.log('  ⚠️ Message input not found, skipping');
    return;
  }
  
  try {
    const messageInput = await page.$(researchData.messages.selectors.messageInput);
    if (messageInput) {
      await messageInput.fill('Test message from research');
      console.log('  Filled message input');
      await delay(500);
      
      if (researchData.messages.selectors.sendButton) {
        const sendButton = await page.$(researchData.messages.selectors.sendButton);
        if (sendButton) {
          await sendButton.click();
          console.log('  Clicked send button');
          await delay(2000);
          
          // Check for message in DOM
          const sentMessage = await page.evaluate(() => {
            const messages = document.querySelectorAll('[class*="message"]');
            if (messages.length > 0) {
              const lastMsg = messages[messages.length - 1];
              return {
                text: lastMsg.textContent.substring(0, 200),
                html: lastMsg.outerHTML.substring(0, 300),
              };
            }
            return null;
          });
          
          if (sentMessage) {
            console.log(`  Message appears in DOM: ${sentMessage.text.substring(0, 100)}`);
            researchData.messages.structure = sentMessage;
          }
        }
      }
    }
  } catch (e) {
    console.log(`  Error sending message: ${e.message.substring(0, 100)}`);
  }
}

async function tryToLike(page) {
  console.log('\n📍 Step 7: Attempting to like...');
  
  if (!researchData.likes.selectors.likeButton) {
    console.log('  ⚠️ Like button not found, skipping');
    return;
  }
  
  try {
    const likeButton = await page.$(researchData.likes.selectors.likeButton);
    if (likeButton) {
      // Get initial state
      const initialState = await likeButton.evaluate(el => ({
        className: el.className,
        ariaPressed: el.getAttribute('aria-pressed'),
        html: el.outerHTML.substring(0, 200),
      }));
      
      console.log(`  Initial state: ${JSON.stringify(initialState)}`);
      
      await likeButton.click();
      console.log('  Clicked like button');
      await delay(1000);
      
      // Get new state
      const newState = await likeButton.evaluate(el => ({
        className: el.className,
        ariaPressed: el.getAttribute('aria-pressed'),
        html: el.outerHTML.substring(0, 200),
      }));
      
      console.log(`  New state: ${JSON.stringify(newState)}`);
      researchData.likes.structure = {
        initialState,
        newState,
        changed: initialState.className !== newState.className || initialState.ariaPressed !== newState.ariaPressed,
      };
    }
  } catch (e) {
    console.log(`  Error trying to like: ${e.message.substring(0, 100)}`);
  }
}

async function research() {
  let browser;
  try {
    console.log('🚀 Starting Mamba dialogs/messages/likes research...\n');
    
    browser = await chromium.launch({
      headless: true,
    });
    
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    
    const page = await context.newPage();
    
    console.log('📍 Phase 1: Login');
    console.log('==================');
    
    // Navigate to auth
    await page.goto(MAMBA_AUTH_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await delay(3000);
    
    // Fill login form
    await page.fill('input[name="login"]', TEST_EMAIL);
    await delay(500);
    await page.fill('input[name="password"]', TEST_PASSWORD);
    await delay(500);
    
    // Click login
    const loginButton = await page.$('button[type="submit"]');
    if (loginButton) {
      await loginButton.click();
      console.log('✅ Login submitted');
      
      try {
        await page.waitForNavigation({ timeout: 15000, waitUntil: 'domcontentloaded' });
      } catch (e) {
        await delay(3000);
      }
    }
    
    const postLoginUrl = page.url();
    console.log(`Current URL after login: ${postLoginUrl}`);
    
    if (postLoginUrl.includes('auth')) {
      console.log('⚠️ Still on auth page, may need to solve CAPTCHA');
      // Try waiting more
      await delay(5000);
    }
    
    await delay(2000);
    
    console.log('\n📍 Phase 2: Dialogs/Messages Exploration');
    console.log('==========================================');
    
    // Find navigation
    await findDialogsNavigation(page);
    
    // Navigate to dialogs
    await findDialogsSection(page);
    await delay(2000);
    
    // Analyze dialogs list
    await analyzeDialogsList(page);
    await delay(1000);
    
    // Find message input
    await findMessageInput(page);
    await delay(1000);
    
    // Analyze messages structure
    await analyzeMessagesStructure(page);
    await delay(1000);
    
    // Try to send message
    await tryToSendMessage(page);
    await delay(2000);
    
    console.log('\n📍 Phase 3: Likes Exploration');
    console.log('=============================');
    
    // Find likes section
    await findLikesSection(page);
    await delay(1000);
    
    // Try to like
    await tryToLike(page);
    
    // Get page content for analysis
    const html = await page.content();
    fs.writeFileSync('/home/engine/project/mamba-dialogs-page.html', html);
    console.log('\n✅ Page HTML saved');
    
    await context.close();
    
    // Output results
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESEARCH RESULTS');
    console.log('='.repeat(70));
    console.log(JSON.stringify(researchData, null, 2));
    
    return researchData;
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
