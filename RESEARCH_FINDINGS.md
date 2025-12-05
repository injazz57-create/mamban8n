# Mamba Authentication Research Findings

## Summary
Research completed on Mamba.ru authentication flow using Playwright. The main findings are captured in `/src/config/mamba-config.ts`.

## Key Findings

### 1. Login URL
- **Auth Endpoint**: `https://www.mamba.ru/auth`
- **Login Form Location**: Direct access to /auth route renders login form

### 2. Form Elements

#### Email Input
- **Selector**: `input[name="login"]`
- **Type**: text
- **Placeholder**: Email

#### Password Input
- **Selector**: `input[name="password"]`
- **Type**: password
- **Placeholder**: Password

#### Login Button
- **Selector**: `button[type="submit"]`
- **Type**: submit

### 3. Anti-Bot Measures

#### reCAPTCHA Detected ⚠️
- **Status**: **IMPORTANT** - reCAPTCHA is present on the login form
- **Impact**: Automated login without manual intervention may be blocked
- **Solution**: 
  - For production automation, use 2Captcha or similar CAPTCHA solving service
  - For development/testing, may need to manually solve CAPTCHA or use browser with manual handling

#### Two-Factor Authentication
- **Status**: NOT detected on the login form itself
- **Note**: May be present after successful login

### 4. Session Management

#### Session Cookies Captured
The following cookies are set after page load and login attempt:
- **Authentication Cookies**:
  - `LOGIN` - User login indicator (httpOnly, secure)
  - `UID` - User identifier (httpOnly, secure)
  - `mmbUID` - Mamba user ID (httpOnly, secure)
  - `SECRET` - Session secret (httpOnly, secure)
  - `mmbSECRET` - Mamba session secret (httpOnly, secure)
  - `LEVEL` - User level (httpOnly, secure)
  - `mmbsid` - Session ID (httpOnly, secure)

#### Tracking & Analytics Cookies
- Yandex tracking cookies (_ym_*, yabs-sid, etc.)
- AppFlyer tracking (af_id, afUserId)
- Adriver advertising (adrcid, adrdel, cid)
- Various third-party service cookies

**Total Cookies**: 40+

### 5. Recommendations for Implementation

#### For Headless Automation:
```javascript
// Realistic delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// After filling form, delay before submit
await delay(1000 + Math.random() * 1000);

// Between fields
await delay(500 + Math.random() * 500);
```

#### Browser Configuration:
- **Headless Mode**: Use `headless: true` with stealth plugin for production
- **Viewport**: 1280x720 or higher (realistic size)
- **User-Agent**: Maintain consistent across requests
- **Cookies**: Persist and reuse session cookies

#### CAPTCHA Handling Strategy:
1. **Manual Testing**: Use `headless: false` with human solving
2. **Production Automation**: Integrate 2Captcha or similar service
3. **Alternative**: Use browser context with persistent storage and manual login once

#### Rate Limiting:
- Respect server rate limits
- Add 1-3 second delays between login attempts
- Don't retry immediately on failure

### 6. Page Structure
- **Framework**: React SPA (Single Page Application)
- **Content Loading**: Requires `domcontentloaded` wait
- **Dynamic Rendering**: Elements render after React initialization (5-8 seconds)

## Testing Credentials Used
- Email: `SandraRobinson2858134@gmail.com`
- Password: `ndJ6jQ9D`

## Files Generated
- `/src/config/mamba-config.ts` - Complete configuration for mambaSessionService
- `/mamba-auth-page.html` - Snapshot of auth page HTML structure
- `/login-page.html` - Additional auth page snapshot

## Next Steps for Implementation

1. **Integrate 2Captcha API** for automated CAPTCHA solving
2. **Implement Session Storage** for cookie persistence
3. **Add Retry Logic** with exponential backoff
4. **Monitor for Changes** in form structure (selectors may change)
5. **Test in Production** with actual credentials and rate limiting in place

---
*Research completed: 2025-12-05*
