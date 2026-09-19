# SKILL: Telegram Bot Development (Node.js + grammY)

**AI agent integration guide for building and extending Telegram bots with this starter.**

Built by [HACODE SOLUTIONS](https://hacode.solutions)

---

## Overview

This skill guide helps AI coding agents (Cursor, GitHub Copilot, Aider, etc.) understand and work with the Telegram bot starter codebase. Use this when:

- Building new Telegram bot features
- Debugging bot commands or handlers
- Integrating external APIs
- Adding database persistence
- Implementing advanced bot functionality

---

## Quick Context

### What This Is

A production-ready Node.js Telegram bot starter using:
- **grammY** — modern, TypeScript-friendly bot framework
- **Express** — web server for webhook endpoint
- **Environment-based config** — secure, flexible deployment

### Key Concepts

**Bot Instance**: Created with `new Bot(token)`, receives updates from Telegram
**Context (ctx)**: Each update handler receives context object with message data and helper methods
**Handlers**: Functions that process commands (`/start`) or messages (`text`, `photo`)
**Webhook vs Polling**: Two modes for receiving updates from Telegram

---

## Architecture Patterns

### File Structure

```
src/
├── index.js              # Entry point, bot initialization
├── config.js             # Environment variable management
└── handlers/
    ├── start.js         # Command handler registration
    ├── help.js
    └── echo.js          # Message handler registration
```

### Handler Pattern

Every handler follows this pattern:

```javascript
// src/handlers/commandname.js

export function registerCommandName(bot) {
  bot.command('commandname', async (ctx) => {
    try {
      // 1. Extract data from ctx
      const userId = ctx.from.id;
      const username = ctx.from.username;
      
      // 2. Process logic
      const result = await someOperation();
      
      // 3. Send response
      await ctx.reply(`Result: ${result}`);
      
    } catch (error) {
      console.error('Error in commandname:', error);
      await ctx.reply('Sorry, something went wrong.');
    }
  });
}
```

**Registration in `src/index.js`**:
```javascript
import { registerCommandName } from './handlers/commandname.js';
registerCommandName(bot);
```

### Configuration Pattern

All config in `src/config.js`:

```javascript
export const config = {
  botToken: process.env.BOT_TOKEN,
  webhookUrl: process.env.WEBHOOK_URL,
  port: parseInt(process.env.PORT || '3000'),
  mode: process.env.WEBHOOK_URL ? 'webhook' : 'polling'
};

// Validation
if (!config.botToken) {
  throw new Error('BOT_TOKEN is required');
}
```

New environment variables:
1. Add to `config.js`
2. Add to `.env.example`
3. Document in `DEVSPEC.md`

---

## Common Tasks

### Task 1: Add a New Command

**User Request**: "Add a /ping command that replies with 'Pong!'"

**Steps**:

1. **Create Handler File**: `src/handlers/ping.js`
```javascript
export function registerPing(bot) {
  bot.command('ping', async (ctx) => {
    await ctx.reply('Pong! 🏓');
  });
}
```

2. **Register in Main**: Add to `src/index.js`
```javascript
import { registerPing } from './handlers/ping.js';
// ... after other imports

// In bot initialization section
registerPing(bot);
```

3. **Update Command List**: Add to `/help` handler in `src/handlers/help.js`
```javascript
const helpText = `
🤖 *Bot Commands*

/start - Welcome message
/help - Show this help
/ping - Test bot responsiveness

...
`.trim();
```

4. **Register with Telegram** (optional, for command menu):
```javascript
// In src/index.js, before starting bot
await bot.api.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'help', description: 'Show help' },
  { command: 'ping', description: 'Test bot' }
]);
```

### Task 2: Add Message Handler

**User Request**: "React to photos with a fire emoji"

**Steps**:

1. **Create Handler**: `src/handlers/photo.js`
```javascript
export function registerPhoto(bot) {
  bot.on('message:photo', async (ctx) => {
    await ctx.reply('🔥 Nice photo!');
  });
}
```

2. **Register**: Add to `src/index.js`
```javascript
import { registerPhoto } from './handlers/photo.js';
registerPhoto(bot);
```

**Available Message Filters**:
- `message:text` — text messages
- `message:photo` — photos
- `message:video` — videos
- `message:document` — files
- `message:sticker` — stickers
- `message:voice` — voice messages

### Task 3: Add External API Integration

**User Request**: "Add /weather command that fetches weather from OpenWeatherMap"

**Steps**:

1. **Install Dependency**:
```bash
npm install axios
```

2. **Add to Config**: `src/config.js`
```javascript
export const config = {
  // ... existing config
  openWeatherApiKey: process.env.OPENWEATHER_API_KEY
};
```

3. **Create Handler**: `src/handlers/weather.js`
```javascript
import axios from 'axios';
import { config } from '../config.js';

export function registerWeather(bot) {
  bot.command('weather', async (ctx) => {
    try {
      // Extract city from command arguments
      const city = ctx.match || 'London';
      
      // Fetch weather data
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: city,
            appid: config.openWeatherApiKey,
            units: 'metric'
          }
        }
      );
      
      const { temp } = response.data.main;
      const { description } = response.data.weather[0];
      
      await ctx.reply(
        `🌤 Weather in ${city}:\n` +
        `Temperature: ${temp}°C\n` +
        `Conditions: ${description}`
      );
      
    } catch (error) {
      console.error('Weather fetch error:', error);
      await ctx.reply('Failed to fetch weather. Try another city.');
    }
  });
}
```

4. **Register**: Add to `src/index.js`

5. **Update .env.example**:
```bash
OPENWEATHER_API_KEY=your_api_key_here
```

### Task 4: Add Database Persistence

**User Request**: "Store user interactions in PostgreSQL"

**Steps**:

1. **Install Dependencies**:
```bash
npm install pg
```

2. **Create Database Module**: `src/database.js`
```javascript
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function saveInteraction(userId, username, command) {
  await pool.query(
    `INSERT INTO user_interactions (user_id, username, command, created_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id) DO UPDATE
     SET last_command = $3, last_seen = NOW()`,
    [userId, username, command]
  );
}

export async function getUserStats(userId) {
  const result = await pool.query(
    `SELECT * FROM user_interactions WHERE user_id = $1`,
    [userId]
  );
  return result.rows[0];
}

// Initialize database
export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_interactions (
      user_id BIGINT PRIMARY KEY,
      username TEXT,
      command TEXT,
      last_seen TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}
```

3. **Initialize in Main**: `src/index.js`
```javascript
import { initDatabase, saveInteraction } from './database.js';

// Before starting bot
await initDatabase();

// Add middleware to log all interactions
bot.use(async (ctx, next) => {
  if (ctx.from) {
    const command = ctx.message?.text?.split(' ')[0];
    await saveInteraction(ctx.from.id, ctx.from.username, command);
  }
  await next();
});
```

4. **Add to Config**:
```javascript
export const config = {
  // ... existing
  databaseUrl: process.env.DATABASE_URL
};
```

5. **Update .env.example**:
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/botdb
```

### Task 5: Add Inline Keyboard

**User Request**: "Add /menu command with interactive buttons"

**Steps**:

1. **Create Handler**: `src/handlers/menu.js`
```javascript
import { InlineKeyboard } from 'grammy';

export function registerMenu(bot) {
  bot.command('menu', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('🌟 About', 'about')
      .text('📚 Help', 'help').row()
      .text('⚙️ Settings', 'settings')
      .url('🌐 Website', 'https://hacode.solutions');
    
    await ctx.reply('Choose an option:', { reply_markup: keyboard });
  });
  
  // Handle button callbacks
  bot.callbackQuery('about', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText('ℹ️ About this bot:\n\nBuilt with grammY by HACODE SOLUTIONS');
  });
  
  bot.callbackQuery('settings', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText('⚙️ Settings menu coming soon!');
  });
}
```

2. **Register**: Add to `src/index.js`

**Keyboard Patterns**:
- `.text(label, callbackData)` — button with callback
- `.url(label, url)` — button that opens URL
- `.row()` — start new row
- `.webApp(label, url)` — open Web App

### Task 6: Add Middleware

**User Request**: "Add rate limiting per user"

**Steps**:

1. **Create Middleware**: `src/middleware/rateLimit.js`
```javascript
const userRequests = new Map();

export function rateLimitMiddleware(maxRequests = 10, windowMs = 60000) {
  return async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next();
    
    const now = Date.now();
    const userWindow = userRequests.get(userId) || { count: 0, resetAt: now + windowMs };
    
    // Reset if window expired
    if (now > userWindow.resetAt) {
      userWindow.count = 0;
      userWindow.resetAt = now + windowMs;
    }
    
    // Check limit
    if (userWindow.count >= maxRequests) {
      await ctx.reply('Too many requests. Please wait a minute.');
      return; // Don't call next()
    }
    
    // Increment and continue
    userWindow.count++;
    userRequests.set(userId, userWindow);
    await next();
  };
}
```

2. **Apply Middleware**: `src/index.js`
```javascript
import { rateLimitMiddleware } from './middleware/rateLimit.js';

bot.use(rateLimitMiddleware(10, 60000)); // 10 requests per minute
```

---

## Context Object (ctx) Reference

Every handler receives a `ctx` object with these key properties:

### Reading Data

```javascript
ctx.message              // Full message object
ctx.message.text         // Text content
ctx.message.photo        // Photo array
ctx.from                 // User who sent message
ctx.from.id              // User ID (number)
ctx.from.username        // Username (string)
ctx.from.first_name      // First name
ctx.chat                 // Chat information
ctx.chat.id              // Chat ID
ctx.match                // Command arguments (e.g., /weather London → "London")
```

### Sending Responses

```javascript
await ctx.reply('Text')                    // Simple reply
await ctx.reply('Text', { parse_mode: 'Markdown' })  // Formatted
await ctx.replyWithPhoto('https://...')    // Send photo
await ctx.replyWithDocument('file_id')     // Send file
await ctx.replyWithSticker('sticker_id')   // Send sticker
```

### Message Editing

```javascript
await ctx.editMessageText('New text')      // Edit message
await ctx.deleteMessage()                  // Delete message
```

### Callback Queries

```javascript
await ctx.answerCallbackQuery()            // Acknowledge button press
await ctx.answerCallbackQuery('Text')      // Show popup notification
```

---

## Error Handling Patterns

### Pattern 1: Try-Catch in Handler

```javascript
bot.command('example', async (ctx) => {
  try {
    const result = await riskyOperation();
    await ctx.reply(`Success: ${result}`);
  } catch (error) {
    console.error('Command failed:', error);
    await ctx.reply('Sorry, something went wrong. Please try again.');
  }
});
```

### Pattern 2: Global Error Handler

```javascript
// In src/index.js
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error handling update ${ctx.update.update_id}:`, err);
  
  // Try to notify user (may fail if error is in reply logic)
  ctx.reply('An error occurred. Please try again later.')
    .catch(() => console.error('Failed to send error message'));
});
```

### Pattern 3: Timeout Handling

```javascript
import { promiseTimeout } from './utils.js';

bot.command('slow', async (ctx) => {
  try {
    const result = await promiseTimeout(
      slowOperation(),
      5000, // 5 second timeout
      'Operation timed out'
    );
    await ctx.reply(result);
  } catch (error) {
    await ctx.reply('Request timed out. Please try again.');
  }
});
```

---

## Testing Patterns

### Manual Testing Checklist

When adding new functionality:

- [ ] Command responds correctly in Telegram
- [ ] Error cases handled gracefully
- [ ] User receives helpful error messages
- [ ] Bot logs errors for debugging
- [ ] Command documented in `/help`
- [ ] Environment variables added to `.env.example`
- [ ] Handler registered in `src/index.js`

### Unit Test Pattern

```javascript
// tests/handlers/ping.test.js
import { describe, it, expect, vi } from 'vitest';
import { registerPing } from '../../src/handlers/ping.js';

describe('Ping Command', () => {
  it('responds with Pong', async () => {
    const mockBot = {
      command: vi.fn((cmd, handler) => {
        if (cmd === 'ping') {
          handler({ reply: vi.fn() });
        }
      })
    };
    
    registerPing(mockBot);
    expect(mockBot.command).toHaveBeenCalledWith('ping', expect.any(Function));
  });
});
```

---

## Debugging Tips

### Enable Debug Logging

```javascript
// src/index.js
bot.use(async (ctx, next) => {
  console.log('Update:', JSON.stringify(ctx.update, null, 2));
  await next();
});
```

### Check Webhook Status

```javascript
// Add to src/index.js
if (config.mode === 'webhook') {
  const webhookInfo = await bot.api.getWebhookInfo();
  console.log('Webhook info:', webhookInfo);
}
```

### Log All Errors

```javascript
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});
```

### Test Webhook Locally

Use ngrok for local webhook testing:

```bash
# Install ngrok
npm install -g ngrok

# Create tunnel
ngrok http 3000

# Set WEBHOOK_URL to ngrok URL
WEBHOOK_URL=https://abc123.ngrok.io npm start
```

---

## Code Style Guidelines

### Naming Conventions

- **Files**: `lowercase-kebab.js`
- **Functions**: `camelCase`
- **Handlers**: `registerCommandName(bot)`
- **Constants**: `UPPER_SNAKE_CASE`

### Handler Structure

```javascript
export function registerCommandName(bot) {
  bot.command('commandname', async (ctx) => {
    // 1. Validate input
    if (!ctx.from) {
      return await ctx.reply('Error: No user information');
    }
    
    // 2. Extract data
    const userId = ctx.from.id;
    const args = ctx.match;
    
    // 3. Process with error handling
    try {
      const result = await processData(args);
      await ctx.reply(result);
    } catch (error) {
      console.error('Error:', error);
      await ctx.reply('Something went wrong');
    }
  });
}
```

### Async/Await Always

```javascript
// ✅ Good
bot.command('test', async (ctx) => {
  await ctx.reply('Hello');
});

// ❌ Bad
bot.command('test', (ctx) => {
  ctx.reply('Hello'); // Missing await!
});
```

---

## Environment Variables Reference

| Variable | Purpose | Required | Example |
|----------|---------|----------|---------|
| `BOT_TOKEN` | Telegram bot token | Yes | `1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ` |
| `WEBHOOK_URL` | Public HTTPS URL | Production | `https://bot.example.com` |
| `PORT` | Server port | No | `3000` |
| `NODE_ENV` | Environment | No | `production` |
| `DATABASE_URL` | Database connection | If using DB | `postgresql://...` |
| `LOG_LEVEL` | Logging verbosity | No | `info` |

**Adding New Variables**:
1. Add to `src/config.js`
2. Add to `.env.example` with description
3. Document in `DEVSPEC.md`
4. Add validation if required

---

## Resources

### Documentation

- **grammY**: [grammy.dev](https://grammy.dev)
- **Telegram Bot API**: [core.telegram.org/bots/api](https://core.telegram.org/bots/api)
- **This Project**: See `DEVSPEC.md` for complete specification

### HACODE SOLUTIONS

- **Website**: [hacode.solutions](https://hacode.solutions)
- **Services**: Custom bot development, consulting
- **Support**: Technical assistance and integration

### Example Extensions

Common additions:
- **Database**: PostgreSQL, MongoDB, Redis
- **APIs**: Weather, translation, image generation
- **Payment**: Telegram Payments, Stripe
- **Authentication**: User verification, admin checks
- **Scheduling**: Cron jobs, reminders
- **Analytics**: User tracking, command metrics

---

## Quick Reference

### Most Common Commands

```javascript
// Reply to message
await ctx.reply('Text');

// Get user ID
const userId = ctx.from.id;

// Get message text
const text = ctx.message.text;

// Command with arguments
bot.command('cmd', async (ctx) => {
  const args = ctx.match; // Everything after /cmd
});

// Message filter
bot.on('message:text', async (ctx) => { });

// Callback query
bot.callbackQuery('btn_id', async (ctx) => {
  await ctx.answerCallbackQuery();
});
```

### Deployment Checklist

- [ ] Set `BOT_TOKEN` in production environment
- [ ] Set `WEBHOOK_URL` for webhook mode
- [ ] Set `NODE_ENV=production`
- [ ] Configure SSL certificate
- [ ] Test webhook with `getWebhookInfo`
- [ ] Monitor logs for errors
- [ ] Set up error tracking (Sentry, etc.)

---

Built with ❤️ by [HACODE SOLUTIONS](https://hacode.solutions)

**Ready to build amazing Telegram bots!** 🤖
