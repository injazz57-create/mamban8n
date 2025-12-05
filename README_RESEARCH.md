# Mamba.ru Research Project - Dialogs, Messages & Likes

## Overview

This project contains comprehensive research and configuration for Mamba.ru dialogs, messages, and likes functionality using Playwright for browser automation.

## Project Contents

### Main Configuration
- **`src/config/mamba-config.ts`** - Complete TypeScript configuration
  - Browser selectors for all UI elements
  - URL patterns for navigation
  - TypeScript interfaces for data structures
  - Session management configuration
  - Research findings and discoveries

### Research Scripts
- **`src/research-dialogs-messages-likes.js`** - Main dialogs/messages research
- **`src/research-advanced.js`** - Advanced page analysis
- **`src/research-with-cookies.js`** - Session persistence testing
- **`src/analyze-html-structure.js`** - HTML structure analysis

### Documentation
- **`RESEARCH_RESULTS.md`** - Detailed findings and discoveries
- **`RESEARCH_FINDINGS.md`** - Original authentication research

## Key Features Researched

### 1. Dialogs/Messages
- Contact list access: `/contact/list`
- Individual chat navigation: `/chats/{userId}/contact`
- Message input and send button identification
- Message list structure and parsing

### 2. Message Sending
- Input field selectors for all variations
- Send button location and activation
- Message confirmation and status tracking
- Attachment and media support

### 3. Likes/Ratings
- Likes section: `/rating`
- Super likes: `/rating/super-like`
- Like button identification and clicking
- Like counter and status tracking

## Configuration Usage

### Import Configuration
```typescript
import { 
  mambaConfig, 
  mambaSessionService, 
  mambaSelectors,
  Message,
  MessageStatus,
  Like
} from './src/config/mamba-config';
```

### Using Selectors
```javascript
// Get message input selector
const inputSelector = mambaSessionService.selectors.messageCompose.input;

// Navigate to dialogs
const contactListUrl = mambaSessionService.urls.contactList;

// Access like button
const likeButton = mambaSessionService.selectors.likes.button;
```

### Data Structures
```typescript
const message: Message = {
  id: '123',
  senderId: 'user456',
  text: 'Hello world',
  type: MessageType.TEXT,
  status: MessageStatus.SENT,
  timestamp: new Date(),
  isOwn: true
};

const like: Like = {
  id: '789',
  profileId: 'profile123',
  profileName: 'John Doe',
  profileAvatar: 'url/to/avatar',
  likedAt: new Date(),
  isVerified: true
};
```

## Running Research Scripts

### Install Dependencies
```bash
npm install
npx playwright install chromium
```

### Run Research
```bash
# Main dialogs/messages research
npm run research:dialogs

# Advanced analysis
npm run research:advanced

# Session management research
npm run research:cookies

# Analyze saved HTML files
node src/analyze-html-structure.js
```

## Important Information

### Anti-Bot Measures
1. **reCAPTCHA** on login form
   - Requires manual solving or 2Captcha service integration
   - Prevents automated authentication

2. **Rate Limiting**
   - Implement 500-2000ms delays between interactions
   - Use exponential backoff for retries

3. **Session Management**
   - Store LOGIN, UID, SECRET cookies
   - All marked as httpOnly and secure
   - Implement cookie refresh logic

### Browser Requirements
- **Wait Times**: 5-8 seconds for DOM rendering
- **Viewport**: 1280x720+ recommended
- **User Agent**: Consistent across requests
- **Headless Mode**: Supported with longer render times

### CSS Class Naming
- Classes are heavily minified (e.g., `c1cteck8`, `t1t16o1v`)
- Use `aria-label`, `data-*` attributes for reliable selectors
- Fall back to tag names and role attributes

## Discovered URLs

```
/contact/list              - Main dialogs/contacts list
/chats/{userId}/contact    - Individual chat page
/rating                    - Ratings/encounters section
/rating/super-like         - Super likes page
/rating/profile/{id}       - Profile rating page
/profile/{id}              - User profile
/search                    - Search functionality
/event-list/all            - Event list
```

## Selector Strategy

### Primary Selectors
1. Use `aria-label` for buttons and interactive elements
2. Use `placeholder` for input fields
3. Use `href` for navigation links
4. Use `role` attributes for semantic elements

### Fallback Selectors
1. Tag names (`li`, `button`, `input`, etc.)
2. Class attribute patterns (`[class*="message"]`)
3. Child selectors for nested components

### Avoid
- Specific minified class names (subject to change)
- Complex nth-child selectors (brittle)
- XPath queries (less maintainable)

## Next Steps

### For Development
1. Integrate CAPTCHA solving (2Captcha API)
2. Implement full session management
3. Create message sending service
4. Build like tracking system

### For Testing
1. Create test suite using selectors
2. Validate message delivery
3. Test like functionality
4. Verify session persistence

## Architecture Notes

- React SPA pattern used by Mamba
- Heavy minification of CSS classes
- API likely behind-the-scenes for data
- Requires proper wait times for DOM updates

## Files Generated During Research

- `mamba-dialogs-page.html` - Dialogs page HTML
- `page-after-login.html` - Login result analysis
- `page-main.html` - Main page structure
- `html-analysis.json` - Parsed element counts
- `research-data.json` - Research findings

## Troubleshooting

### CAPTCHA Blocking Login
- Use manual solving for development
- Integrate 2Captcha for production
- Check for CAPTCHA using `innerHTML` search

### Selectors Not Found
- Verify wait times (use 5-8 seconds)
- Check for minified classes
- Use browser DevTools in Playwright
- Try fallback selectors

### Session Issues
- Verify cookie storage
- Check cookie expiration
- Implement session refresh
- Monitor cookie updates

## Future Enhancements

- Add browser pooling for parallel testing
- Implement queue system for message batching
- Create dashboard for like tracking
- Add metrics and monitoring
- Support additional browser types

## Resources

- Playwright Documentation: https://playwright.dev
- Mamba.ru: https://www.mamba.ru
- Configuration: `src/config/mamba-config.ts`

---

**Status**: Complete - Ready for mambaSessionService implementation
**Last Updated**: 2025-12-05
