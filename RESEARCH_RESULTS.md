# Mamba.ru Dialogs, Messages, and Likes Research Results

## Research Completion Summary

### What Was Accomplished
1. ✅ Created comprehensive configuration for Mamba dialogs/messages/likes
2. ✅ Identified all major navigation paths and URLs
3. ✅ Documented selector patterns for all UI components
4. ✅ Analyzed HTML structure and class naming patterns
5. ✅ Created TypeScript interfaces for data structures
6. ✅ Documented anti-bot measures and security requirements

### Key Findings

#### 1. Dialogs/Messages Section
- **Location**: `/contact/list` - main contacts/dialogs list
- **Chat URL Pattern**: `/chats/{userId}/contact`
- **Navigation Selectors**: 
  - Main link: `a[href="/contact/list"]`
  - Chat links: `a[href*="chats"], a[href*="contact"]`

#### 2. Message Input & Send
- **Input Field**: Typically uses `placeholder` containing "Message"
- **Send Button**: Uses `aria-label` with "Send" or "Отправить"
- **Alternatives**: Can use `[contenteditable="true"]` or `textarea`
- **Pattern**: Message input found within chat containers

#### 3. Likes/Ratings
- **Main Page**: `/rating` - Ratings/encounters section
- **Super Likes**: `/rating/super-like`
- **Profile Rating**: `/rating/profile/{profileId}`
- **Like Button**: Uses `aria-label*="Like"` or `class*="like"`

#### 4. HTML Structure Analysis
- **Element Distribution**:
  - List Items: Various (dialog items)
  - Buttons: Multiple for actions
  - Input fields: Message input + search/filter inputs
  - Classes: Heavily minified (e.g., `c1cteck8`, `t1t16o1v`)

- **Discovered URLs**:
  ```
  /contact/list
  /chats/{userId}/contact
  /rating
  /rating/super-like
  /rating/profile/{profileId}
  /profile/{id}
  /search
  /event-list/all
  ```

### Anti-Bot Measures & Security

1. **reCAPTCHA**: Detected on login form
   - Requires manual solving or 2Captcha service integration
   - Prevents automated login attempts

2. **Session Management**:
   - Key cookies: LOGIN, UID, mmbUID, SECRET, mmbSECRET, LEVEL, mmbsid
   - All marked as httpOnly and secure
   - Persistent storage recommended

3. **Rate Limiting**:
   - Implement 500-2000ms delays between interactions
   - Use exponential backoff for retries

### CSS Class Naming Convention

Mamba uses heavily minified class names from build process:
- Classes are 8-12 characters long
- No semantic meaning in names
- **Recommendation**: Use aria-labels, data attributes, or tag names for reliable selectors

### Browser Requirements

- **Wait Times**: 5-8 seconds for DOM elements to render
- **Viewport**: 1280x720+ recommended
- **User Agent**: Consistent across requests
- **Headless Mode**: Supported but may have longer render times

### Configuration Files

Main configuration file: `src/config/mamba-config.ts`

Exports:
- `mambaConfig` - Complete configuration object
- `mambaSelectors` - Typed selector constants
- `mambaSessionService` - Session management config
- `mambaCookies` - Cookie names to track
- `MessageType`, `MessageStatus` - Enums
- `Dialog`, `Message`, `Like` - TypeScript interfaces
- `researchFindings` - Research notes and discoveries

### Usage Examples

```typescript
import { mambaSessionService, mambaSelectors } from './src/config/mamba-config';

// Access URLs
const chatUrl = mambaSessionService.urls.contactList;
const messageInputSelector = mambaSelectors.messageInput;

// Use interfaces
const message: Message = {
  id: '123',
  senderId: 'user456',
  text: 'Hello',
  type: MessageType.TEXT,
  status: MessageStatus.SENT,
  timestamp: new Date(),
  isOwn: true,
};
```

### Next Steps for Implementation

1. **Implement CAPTCHA Solving**:
   - Option A: Use 2Captcha API for automated solving
   - Option B: Manual solving for testing/development

2. **Session Management**:
   - Store LOGIN cookie from successful auth
   - Reuse for subsequent requests
   - Implement refresh logic for expired sessions

3. **Message Sending**:
   - Fill input using selector: `input[placeholder*="Message"]`
   - Click send using selector: `button[aria-label*="Send"]`
   - Verify message appears in DOM

4. **Like Implementation**:
   - Navigate to `/rating`
   - Find profile card
   - Click like button using selector: `button[class*="like"], button[aria-label*="Like"]`
   - Track in-page counter updates

### Research Artifacts

- `src/config/mamba-config.ts` - Complete configuration
- `html-analysis.json` - HTML structure analysis
- `mamba-dialogs-page.html` - Sample dialogs page HTML
- `page-after-login.html` - Login page analysis
- `page-main.html` - Main page HTML

### Notes

- All selectors are based on actual HTML analysis
- Class names are compiled and subject to change with deploys
- Use aria-labels and data attributes for maximum reliability
- Implement proper error handling for missing selectors
- Always use explicit waits for DOM elements

---

**Research Date**: 2025-12-05
**Status**: Complete - Ready for mambaSessionService development
