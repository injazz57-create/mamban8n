// Mamba.ru Configuration and Selectors
// Research-based configuration for Mamba dialogs, messages, and likes functionality

export const mambaConfig = {
  // Base URLs
  baseUrl: 'https://www.mamba.ru',
  authUrl: 'https://www.mamba.ru/auth',
  mainUrl: 'https://www.mamba.ru/',
  
  // Authentication Selectors
  auth: {
    emailInput: 'input[name="login"]',
    passwordInput: 'input[name="password"]',
    loginButton: 'button[type="submit"]',
    successIndicator: 'a[href="/feed"], a[href="/rating"], a[href="/search"]',
  },
  
  // Dialogs/Messages Navigation
  navigation: {
    feedLink: 'a[href="/feed"]',
    ratingLink: 'a[href="/rating"]',
    searchLink: 'a[href="/search"]',
    contactListLink: 'a[href="/contact/list"]',
    messagesLink: 'a[href*="chats"], a[href*="contact"]',
    likesLink: 'a[href*="/rating/"], a[href*="super-like"]',
  },
  
  // Dialogs/Messages Page Selectors
  dialogs: {
    // Main dialogs container
    container: '[class*="dialog"], [role="main"]',
    
    // Dialog list items - using tag selector as classes are compiled
    dialogItem: 'li, div[role="listitem"], [class*="message-item"]',
    
    // Components within dialog item
    dialogName: 'span, div[class*="name"]',
    dialogAvatar: 'img, [class*="avatar"]',
    dialogPreview: 'p, span[class*="preview"], span[class*="text"]',
    dialogTimestamp: 'time, span[class*="time"], span[class*="date"]',
    dialogUnreadBadge: 'span[class*="unread"], span[class*="badge"], [class*="counter"]',
    
    // Action buttons
    dialogDelete: 'button[aria-label*="Delete"], button[aria-label*="Remove"]',
    dialogOpen: 'button, a[class*="open"]',
  },
  
  // Message Input/Send
  messages: {
    // Input field for typing messages
    input: 'input[placeholder*="Message"], textarea[placeholder*="Message"], input[placeholder*="Сообщение"], textarea[placeholder*="Сообщение"], [contenteditable="true"]',
    
    // Send button
    sendButton: 'button[aria-label*="Send"], button[aria-label*="Отправить"], button:has-text("Send"), button:has-text("Отправить")',
    
    // Message list container
    messageList: '[class*="message-list"], [role="log"], div[class*="messages"]',
    
    // Individual message
    messageItem: '[class*="message"], [class*="msg"], div[role="article"]',
    
    // Message components
    messageText: 'span, p, div[class*="text"]',
    messageTime: 'time, span[class*="time"]',
    messageSender: 'span[class*="sender"], span[class*="author"]',
    messageAvatar: 'img[class*="avatar"]',
    messageStatus: 'span[class*="status"], [aria-label*="delivery"], svg[class*="check"]',
    
    // Attachment indicators
    messageImage: 'img[class*="message-image"], img[class*="attachment"]',
    messageLink: 'a[class*="message-link"]',
  },
  
  // Likes/Admirers Section
  likes: {
    // Likes container/page
    container: '[class*="likes"], [class*="admirers"]',
    
    // Like button on profile/card
    likeButton: 'button[aria-label*="Like"], button[aria-label*="Лайк"], button[class*="like"], svg[class*="heart"]',
    
    // Like counter
    likeCounter: 'span[class*="like-count"], span[class*="count"], span[class*="number"]',
    
    // Likes list
    likesList: '[class*="likes-list"], [class*="admirers-list"], div[role="list"]',
    
    // Like item (person who liked)
    likeItem: 'div[class*="like-item"], [class*="admirer-item"], [role="listitem"]',
    
    // Profile info within like item
    likeProfile: 'a[href*="/u/"], a[href*="/profile"]',
    likeProfileName: 'span[class*="name"], h3, h4',
    likeProfileAge: 'span[class*="age"]',
  },
  
  // Common Patterns
  commonSelectors: {
    // Buttons by functionality
    buttonDelete: 'button[aria-label*="Delete"], button[aria-label*="Remove"], button:has-text("Delete")',
    buttonEdit: 'button[aria-label*="Edit"], button:has-text("Edit")',
    buttonClose: 'button[aria-label*="Close"], button:has-text("Close"), button[class*="close"]',
    
    // Profile links
    profileLink: 'a[href*="/u/"], a[href*="/profile"], a[href*="/user"]',
    
    // Timestamps
    timestamp: 'time, span[class*="time"], span[class*="date"], span[class*="ago"]',
    
    // User status
    userStatus: 'span[class*="status"], div[class*="status"], [class*="online"], [class*="offline"]',
  },
  
  // Anti-Bot / Security
  antiBot: {
    captchaDetected: true,
    captchaType: 'recaptcha',
    twoFADetected: false,
    recommendations: [
      'IMPORTANT: reCAPTCHA detected on login form - requires manual solving or 2Captcha service integration',
      'Use realistic delays between interactions (500-2000ms)',
      'Maintain consistent user-agent across requests',
      'Use persistent browser context for cookie storage',
      'For production: integrate with 2Captcha or similar service for automated CAPTCHA solving',
      'Handle rate limiting with exponential backoff',
      'Wait for DOM elements with explicit timeouts (5-8 seconds)',
    ],
  },
  
  // Cookies to maintain/track
  cookies: [
    'LOGIN',        // Login status
    'UID',          // User ID
    'mmbUID',       // Mamba User ID
    'SECRET',       // Session secret
    'mmbSECRET',    // Mamba session secret
    'LEVEL',        // User level/tier
    'mmbsid',       // Mamba session ID
    'registered_once', // Registration flag
    'start_with_auth_form', // Auth form state
    'unauth_lang',  // Language for unauth users
    'mb_track_id',  // Tracking ID
    'mb_source_info', // Source info
    '_ym_uid',      // Yandex Metrika
    '_ym_d',        // Yandex Metrika date
  ],
};

// Typed selector constants
export const mambaSelectors = {
  // Auth
  emailInput: 'input[name="login"]',
  passwordInput: 'input[name="password"]',
  loginButton: 'button[type="submit"]',
  
  // Navigation
  feedLink: 'a[href="/feed"]',
  messagesLink: 'a[href*="dialog"]',
  likesLink: 'a[href*="like"]',
  
  // Messages
  messageInput: 'input[placeholder*="Message"], textarea[placeholder*="Message"]',
  sendButton: 'button[aria-label*="Send"]',
  messageItem: 'div[class*="message"]',
  
  // Likes
  likeButton: 'button[aria-label*="Like"], button[class*="like"]',
  likesList: 'div[class*="likes-list"]',
} as const;

// Session service configuration
export const mambaSessionService = {
  // URLs
  urls: {
    base: 'https://www.mamba.ru',
    auth: 'https://www.mamba.ru/auth',
    feed: 'https://www.mamba.ru/feed',
    contactList: 'https://www.mamba.ru/contact/list',
    chat: 'https://www.mamba.ru/chats/{userId}/contact',
    rating: 'https://www.mamba.ru/rating',
    ratingProfile: 'https://www.mamba.ru/rating/profile/{profileId}',
    ratingChat: 'https://www.mamba.ru/rating/chats/{userId}/contact',
    superLike: 'https://www.mamba.ru/rating/super-like',
    search: 'https://www.mamba.ru/search',
    profile: 'https://www.mamba.ru/profile/{id}',
  },
  
  // Selectors
  selectors: {
    // Authentication
    login: {
      emailInput: 'input[name="login"]',
      passwordInput: 'input[name="password"]',
      submitButton: 'button[type="submit"]',
    },
    
    // Navigation
    navigation: {
      mainMenu: 'nav, [role="navigation"]',
      feedLink: 'a[href="/feed"]',
      messagesLink: 'a[href*="message"], a[href*="dialog"]',
      likesLink: 'a[href*="like"], a[href*="admirer"]',
    },
    
    // Dialogs/Messages
    dialogs: {
      container: '[class*="dialog"], [role="main"]',
      list: 'li, [role="listitem"]',
      item: {
        root: 'li, div[role="listitem"]',
        name: 'span, div',
        avatar: 'img',
        preview: 'p, span',
        timestamp: 'time, span[class*="time"]',
      },
    },
    
    // Message composition
    messageCompose: {
      input: 'input[placeholder*="Message"], textarea, [contenteditable="true"]',
      sendButton: 'button[aria-label*="Send"]',
      attachButton: 'button[aria-label*="Attach"], button[aria-label*="File"]',
    },
    
    // Likes
    likes: {
      button: 'button[aria-label*="Like"], button[class*="like"]',
      counter: 'span[class*="count"]',
      list: 'div[class*="likes-list"]',
      item: 'div[class*="like-item"]',
    },
  },
  
  // Cookie names to track
  cookieNames: [
    'LOGIN', 'UID', 'mmbUID', 'SECRET', 'mmbSECRET', 'LEVEL',
    'mmbsid', 'registered_once', 'mb_track_id', '_ym_uid',
  ],
  
  // Security/Anti-bot info
  antiBot: {
    captchaDetected: true,
    captchaType: 'recaptcha',
    twoFADetected: false,
    recommendations: [
      'Handle reCAPTCHA (requires manual or 2Captcha integration)',
      'Use delays: 500-2000ms between actions',
      'Consistent user-agent required',
      'Persistent context for cookies',
      'Handle 5-8 second render times in headless mode',
    ],
  },
  
  // Typical wait times (ms)
  waits: {
    navigationTimeout: 15000,
    elementTimeout: 8000,
    interactionDelay: 500,
    pageLoadDelay: 3000,
  },
};

// Cookie names constant
export const mambaCookies = [
  'LOGIN',
  'UID',
  'mmbUID',
  'SECRET',
  'mmbSECRET',
  'LEVEL',
  'mmbsid',
  'registered_once',
  'mb_track_id',
  'mb_track_source_id',
  'mb_source_info',
  '_ym_uid',
  '_ym_d',
  '_ym_isad',
  'yandexuid',
  'ymex',
] as const;

// Dialog message types
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  ATTACHMENT = 'attachment',
  SYSTEM = 'system',
}

// Message status
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

// Dialog data structure
export interface Dialog {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isOnline: boolean;
}

// Message data structure
export interface Message {
  id: string;
  senderId: string;
  text: string;
  type: MessageType;
  status: MessageStatus;
  timestamp: Date;
  isOwn: boolean;
}

// Like data structure
export interface Like {
  id: string;
  profileId: string;
  profileName: string;
  profileAvatar: string;
  likedAt: Date;
  isVerified: boolean;
}

// Research Notes and Findings
export const researchFindings = {
  timestamp: new Date().toISOString(),
  notes: [
    'Mamba.ru uses reCAPTCHA on login - requires manual solving or 2Captcha integration for automation',
    'After successful login, user can access /contact/list for messaging',
    'Each chat is accessible via /chats/{userId}/contact pattern',
    'Messages list can be retrieved from chat pages',
    'Likes/ratings accessible via /rating section',
    'Super-likes page available at /rating/super-like',
    'Profile ratings available at /rating/profile/{profileId}',
    'Message input typically uses placeholder text containing "Message" or similar',
    'Send button uses aria-label with "Send" or similar text',
    'Classes are heavily minified/compiled - use tag names and aria-labels for selectors',
    'Page uses React SPA pattern - needs proper DOM wait times (5-8 seconds)',
    'Session maintained via LOGIN, UID, mmbUID, SECRET, mmbSECRET cookies',
  ],
  htmlAnalysis: {
    foundElements: {
      messageKeywordCount: 100,
      chatKeywordCount: 86,
      likeKeywordCount: 76,
      sendKeywordCount: 56,
    },
    discoveredUrls: [
      '/contact/list - Main contacts/dialogs list',
      '/chats/{userId}/contact - Individual chat page',
      '/rating - Ratings/likes discovery page',
      '/rating/super-like - Super likes page',
      '/profile/{id} - User profiles',
      '/search - Search functionality',
      '/event-list/all - Event list',
    ],
    classNamingConvention: 'Heavily minified class names (e.g., c1cteck8, t1t16o1v) - use data attributes and aria-labels instead',
  },
};

