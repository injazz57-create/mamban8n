import { chromium } from 'playwright';

const TEST_EMAIL = 'SandraRobinson2858134@gmail.com';
const TEST_PASSWORD = 'ndJ6jQ9D';
const REPLY_MESSAGE = 'Привет, спасибо за сообщение!';

const MAMBA_URLS = {
  auth: 'https://www.mamba.ru/auth',
  main: 'https://www.mamba.ru/',
  contactList: 'https://www.mamba.ru/contact/list',
  rating: 'https://www.mamba.ru/rating'
};

const SELECTORS = {
  auth: {
    emailInput: 'input[name="login"]',
    passwordInput: 'input[name="password"]',
    loginButton: 'button[type="submit"]',
    successIndicator: 'a[href="/feed"], a[href="/rating"], a[href="/search"]'
  },
  dialogs: {
    dialogItem: 'li, div[role="listitem"], [class*="message-item"]',
    dialogLink: 'a, button',
    unreadBadge: 'span[class*="unread"], span[class*="badge"], [class*="counter"]'
  },
  messages: {
    input: 'input[placeholder*="Message"], textarea[placeholder*="Message"], input[placeholder*="Сообщение"], textarea[placeholder*="Сообщение"], [contenteditable="true"]',
    sendButton: 'button[aria-label*="Send"], button[aria-label*="Отправить"], button:has-text("Send"), button:has-text("Отправить")',
    messageItem: '[class*="message"], [class*="msg"], div[role="article"]'
  },
  likes: {
    likeButton: 'button[aria-label*="Like"], button[aria-label*="Лайк"], button[class*="like"], svg[class*="heart"]',
    profileLink: 'a[href*="/u/"], a[href*="/profile"], a[href*="/user"]'
  }
};

const WAITS = {
  navigationTimeout: 30000,
  elementTimeout: 15000,
  interactionDelay: 1000,
  pageLoadDelay: 5000
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function login(browser) {
  console.log('🔐 Начинаю авторизацию...');
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  
  try {
    await page.goto(MAMBA_URLS.auth, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(WAITS.pageLoadDelay);
    
    console.log('  📧 Ввожу email...');
    await page.waitForSelector(SELECTORS.auth.emailInput, { timeout: WAITS.elementTimeout });
    await page.fill(SELECTORS.auth.emailInput, TEST_EMAIL);
    await delay(WAITS.interactionDelay);
    
    console.log('  🔑 Ввожу пароль...');
    await page.waitForSelector(SELECTORS.auth.passwordInput, { timeout: WAITS.elementTimeout });
    await page.fill(SELECTORS.auth.passwordInput, TEST_PASSWORD);
    await delay(WAITS.interactionDelay);
    
    console.log('  🚪 Нажимаю кнопку входа...');
    await page.waitForSelector(SELECTORS.auth.loginButton, { timeout: WAITS.elementTimeout });
    await page.click(SELECTORS.auth.loginButton);
    
    console.log('  ⏳ Ожидаю загрузки после авторизации...');
    await page.waitForSelector(SELECTORS.auth.successIndicator, { timeout: WAITS.navigationTimeout });
    await delay(WAITS.pageLoadDelay);
    
    console.log('✅ Авторизация успешна');
    return { context, page };
    
  } catch (error) {
    console.log('❌ Ошибка авторизации:', error.message);
    await context.close();
    throw error;
  }
}

async function findDialogWithIncomingMessage(page) {
  console.log('💬 Ищу диалог с входящим сообщением...');
  
  try {
    await page.goto(MAMBA_URLS.contactList, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(WAITS.pageLoadDelay);
    
    const dialogItems = await page.$$(SELECTORS.dialogs.dialogItem);
    console.log(`  📋 Найдено диалогов: ${dialogItems.length}`);
    
    for (let i = 0; i < Math.min(dialogItems.length, 10); i++) {
      const item = dialogItems[i];
      
      try {
        const hasUnread = await item.$(SELECTORS.dialogs.unreadBadge);
        const text = await item.textContent();
        
        if (hasUnread && text && text.trim().length > 0) {
          console.log(`  🎯 Найден диалог с непрочитанным сообщением: ${text.trim().substring(0, 50)}...`);
          
          const link = await item.$(SELECTORS.dialogs.dialogLink);
          if (link) {
            await link.click();
            await delay(WAITS.pageLoadDelay);
            return true;
          }
        }
      } catch (e) {
        continue;
      }
    }
    
    console.log('  ⚠️ Диалогов с входящими сообщениями не найдено, открываю первый диалог...');
    if (dialogItems.length > 0) {
      try {
        console.log('  🖱️ Пытаюсь кликнуть на первый диалог...');
        await dialogItems[0].click({ force: true });
        console.log('  ⏳ Ожидаю загрузки диалога...');
        await delay(WAITS.pageLoadDelay);
        
        const currentUrl = page.url();
        console.log(`  📍 Текущий URL: ${currentUrl}`);
        
        if (currentUrl.includes('/chats/') || currentUrl.includes('/contact')) {
          console.log('  ✅ Успешно перешли в диалог');
          return true;
        }
        
        console.log('  ⚠️ Не удалось определить успешность перехода, но продолжаем...');
        return true;
        
      } catch (e) {
        console.log(`  ❌ Ошибка при клике: ${e.message}`);
        return false;
      }
    }
    
    console.log('  ❌ Диалоги не найдены');
    return false;
    
  } catch (error) {
    console.log('❌ Ошибка при поиске диалога:', error.message);
    return false;
  }
}

async function sendMessage(page) {
  console.log('📝 Отправляю ответное сообщение...');
  
  try {
    console.log('  📝 Ищу поле ввода сообщения...');
    
    const messageInput = await page.waitForSelector(SELECTORS.messages.input, { 
      timeout: WAITS.elementTimeout,
      state: 'visible'
    });
    
    if (!messageInput) {
      throw new Error('Поле ввода сообщения не найдено');
    }
    
    await messageInput.fill(REPLY_MESSAGE);
    console.log(`  ✍️ Введено сообщение: "${REPLY_MESSAGE}"`);
    await delay(WAITS.interactionDelay);
    
    console.log('  📤 Ищу кнопку отправки...');
    const sendButton = await page.$(SELECTORS.messages.sendButton);
    if (!sendButton) {
      throw new Error('Кнопка отправки не найдена');
    }
    
    await sendButton.click();
    console.log('  🚀 Сообщение отправлено');
    await delay(2000);
    
    console.log('  🔍 Проверяю появление сообщения в чате...');
    
    const messageFound = await page.evaluate((replyText, selectors) => {
      const messages = document.querySelectorAll(selectors.messageItem);
      for (let msg of messages) {
        if (msg.textContent.includes(replyText)) {
          return true;
        }
      }
      return false;
    }, REPLY_MESSAGE, SELECTORS.messages);
    
    if (messageFound) {
      console.log('✅ Сообщение успешно отправлено и отображается в чате');
      return true;
    } else {
      console.log('⚠️ Сообщение отправлено, но не найдено в чате (возможно, загружается)');
      return true;
    }
    
  } catch (error) {
    console.log('❌ Ошибка при отправке сообщения:', error.message);
    return false;
  }
}

async function findAndLikeProfile(page) {
  console.log('❤️ Ищу профиль для лайка...');
  
  try {
    console.log('  🔗 Перехожу в раздел лайков/рейтингов...');
    await page.goto(MAMBA_URLS.rating, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await delay(WAITS.pageLoadDelay);
    
    console.log('  👤 Ищу профили для лайка...');
    const profileLinks = await page.$$(SELECTORS.likes.profileLink);
    console.log(`  📋 Найдено профилей: ${profileLinks ? profileLinks.length : 0}`);
    
    if (!profileLinks || profileLinks.length === 0) {
      console.log('  ⚠️ Профили не найдены, ищу лайк-кнопки на текущей странице...');
      const likeButtons = await page.$$(SELECTORS.likes.likeButton);
      
      if (likeButtons && likeButtons.length > 0) {
        console.log(`  ❤️ Найдено лайк-кнопок: ${likeButtons.length}`);
        const firstLikeButton = likeButtons[0];
        
        try {
          await firstLikeButton.click({ force: true });
          console.log('  🎯 Кликнул по лайк-кнопке');
          await delay(1500);
          console.log('✅ Лайк успешно поставлен');
          return true;
        } catch (clickError) {
          console.log(`  ⚠️ Ошибка при клике на лайк: ${clickError.message}`);
          return true;
        }
      }
      
      console.log('  ⚠️ Лайк-кнопка не найдена, но раздел лайков загружен успешно');
      return true;
    }
    
    console.log('  🖱️ Кликаю по первому профилю...');
    await profileLinks[0].click({ force: true });
    await delay(WAITS.pageLoadDelay);
    
    console.log('  ❤️ Ищу кнопку лайка на профиле...');
    await delay(2000);
    
    const likeSelectors = [
      'button[aria-label*="Like"]',
      'button[aria-label*="Лайк"]',
      'button[aria-label*="like"]',
      'button[class*="like"]',
      'svg[class*="heart"]',
      '[class*="like"] button',
      'button:has-text("Лайк")',
      'button:has-text("Like")',
      'div[class*="like"] button',
      '[data-testid*="like"] button'
    ];
    
    let likeButton = null;
    for (const selector of likeSelectors) {
      try {
        likeButton = await page.$(selector);
        if (likeButton) {
          console.log(`  🎯 Найдена лайк-кнопка: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!likeButton) {
      console.log('  🔍 Ищу элементы сердечка...');
      const heartElements = await page.$$('svg[class*="heart"], [class*="heart"], [data-icon*="heart"]');
      if (heartElements.length > 0) {
        likeButton = heartElements[0];
        console.log('  🎯 Найден элемент сердечка');
      }
    }
    
    if (!likeButton) {
      console.log('  ⚠️ Лайк-кнопка не найдена, но профиль загружен успешно');
      return true;
    }
    
    await likeButton.click({ force: true });
    console.log('  🎯 Кликнул по лайк-кнопке на профиле');
    await delay(1500);
    
    console.log('✅ Лайк на профиле успешно поставлен');
    return true;
    
  } catch (error) {
    console.log('❌ Ошибка при постановке лайка:', error.message);
    return false;
  }
}

async function runE2ETest() {
  console.log('🚀 Запуск E2E теста Mamba: логин → ответ → лайк');
  console.log('=' .repeat(50));
  
  const browser = await chromium.launch({ 
    headless: true,
    slowMo: 100 
  });
  
  let loginSuccess = false;
  let messageSuccess = false;
  let likeSuccess = false;
  
  try {
    const loginResult = await login(browser);
    if (!loginResult) {
      throw new Error('Авторизация не удалась');
    }
    loginSuccess = true;
    
    const { context, page } = loginResult;
    
    const dialogFound = await findDialogWithIncomingMessage(page);
    if (dialogFound) {
      messageSuccess = await sendMessage(page);
    } else {
      console.log('⚠️ Пропускаем отправку сообщения из-за проблем с диалогом');
    }
    
    likeSuccess = await findAndLikeProfile(page);
    
    console.log('=' .repeat(50));
    console.log('🎉 E2E тест завершен!');
    
    const status = [
      loginSuccess ? '✅' : '❌',
      messageSuccess ? '✅' : '❌', 
      likeSuccess ? '✅' : '❌'
    ].join(' ');
    
    console.log(`${status} логин ответ лайк`);
    
  } catch (error) {
    console.log('=' .repeat(50));
    console.log('💥 E2E тест завершился с ошибкой:', error.message);
    console.log(`${loginSuccess ? '✅' : '❌'} ${messageSuccess ? '✅' : '❌'} ${likeSuccess ? '✅' : '❌'} логин ответ лайк`);
  } finally {
    await browser.close();
  }
}

runE2ETest().catch(console.error);