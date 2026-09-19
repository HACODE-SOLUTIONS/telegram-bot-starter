# DevSpec: Telegram Bot Starter

**Comprehensive development specification for AI coding agents and human developers.**

Built by [HACODE SOLUTIONS](https://hacode.solutions)

---

## Overview

This is a production-ready Telegram bot starter built with Node.js and grammY. It supports both webhook (production) and polling (development) modes, includes Express server for webhooks, and follows best practices for error handling, logging, and configuration management.

### Technology Stack

- **Runtime**: Node.js 18+
- **Bot Framework**: grammY (modern, TypeScript-friendly)
- **Web Server**: Express 4.x
- **Environment**: dotenv for configuration

### Design Goals

1. **Simplicity**: Minimal dependencies, clear structure
2. **Flexibility**: Easy to extend with new commands and features
3. **Production-Ready**: Webhook support, error handling, logging
4. **AI-Friendly**: Comprehensive documentation for autonomous agents

---

## Architecture

### Bot Modes

#### Polling Mode (Development)

- Bot actively polls Telegram API for updates
- No public URL required
- Ideal for local development
- Triggered by: `NODE_ENV=development` or absence of `WEBHOOK_URL`

```javascript
// Polling initialization
await bot.start();
```

#### Webhook Mode (Production)

- Telegram sends updates to your HTTPS endpoint
- Requires public URL with valid SSL certificate
- More efficient for high-traffic bots
- Triggered by: `WEBHOOK_URL` environment variable

```javascript
// Webhook initialization
await bot.api.setWebhook(`${WEBHOOK_URL}/webhook`);
app.use(bot.webhookCallback('/webhook'));
```

### Application Flow

```
Start → Load Config → Initialize Bot → Register Handlers → Start Server/Polling → Handle Updates
```

1. **Initialization**: Load environment variables and validate configuration
2. **Bot Creation**: Create grammY bot instance with token
3. **Handler Registration**: Register command and message handlers
4. **Mode Selection**: Choose webhook or polling based on environment
5. **Event Loop**: Process incoming updates and send responses

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BOT_TOKEN` | Yes | - | Telegram bot token from @BotFather |
| `WEBHOOK_URL` | Production | - | Public HTTPS URL for webhook |
| `PORT` | No | 3000 | Server port for webhook mode |
| `NODE_ENV` | No | development | Environment (development/production) |
| `LOG_LEVEL` | No | info | Logging level (error/warn/info/debug) |

### Configuration Loading

```javascript
// src/config.js
export const config = {
  botToken: process.env.BOT_TOKEN,
  webhookUrl: process.env.WEBHOOK_URL,
  port: process.env.PORT || 3000,
  isProduction: process.env.NODE_ENV === 'production',
  mode: process.env.WEBHOOK_URL ? 'webhook' : 'polling'
};
```

### Validation

- `BOT_TOKEN` must be present or throw error
- `WEBHOOK_URL` must be valid HTTPS URL if provided
- Port must be valid number between 1-65535

---

## Bot Commands

### Standard Commands

#### `/start`

**Purpose**: Welcome new users and introduce bot functionality

**Handler**: `src/handlers/start.js`

**Response**:
```
👋 Welcome to [Bot Name]!

I'm a Telegram bot starter built with grammY.

Available commands:
/help - Show this help message
/start - Restart the bot

Built by HACODE SOLUTIONS 🚀
```

**Implementation**:
```javascript
export function registerStart(bot) {
  bot.command('start', async (ctx) => {
    await ctx.reply(
      '👋 Welcome to [Bot Name]!\n\n' +
      'I\'m a Telegram bot starter built with grammY.\n\n' +
      'Available commands:\n' +
      '/help - Show this help message\n' +
      '/start - Restart the bot\n\n' +
      'Built by HACODE SOLUTIONS 🚀'
    );
  });
}
```

#### `/help`

**Purpose**: Display available commands and usage instructions

**Handler**: `src/handlers/help.js`

**Response**: Command list with descriptions

**Implementation**:
```javascript
export function registerHelp(bot) {
  bot.command('help', async (ctx) => {
    const helpText = `
🤖 *Bot Commands*

/start - Welcome message
/help - Show this help

*About*
Built with grammY by HACODE SOLUTIONS
Learn more: https://hacode.solutions
    `.trim();
    
    await ctx.reply(helpText, { parse_mode: 'Markdown' });
  });
}
```

### Message Handlers

#### Echo Handler

**Purpose**: Respond to text messages (example handler)

**Handler**: `src/handlers/echo.js`

**Behavior**: Echoes back received text with confirmation

**Implementation**:
```javascript
export function registerEcho(bot) {
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;
    await ctx.reply(`You said: ${text}`);
  });
}
```

### Adding New Commands

1. **Create Handler File**: `src/handlers/commandname.js`
2. **Export Registration Function**:
   ```javascript
   export function registerCommandName(bot) {
     bot.command('commandname', async (ctx) => {
       await ctx.reply('Response');
     });
   }
   ```
3. **Import and Register** in `src/index.js`:
   ```javascript
   import { registerCommandName } from './handlers/commandname.js';
   registerCommandName(bot);
   ```

---

## Error Handling

### Strategy

1. **Graceful Degradation**: Bot continues running even if individual handlers fail
2. **Error Logging**: All errors logged with context
3. **User Feedback**: Inform users when something goes wrong
4. **Retry Logic**: Automatic retries for transient failures

### Implementation

#### Global Error Handler

```javascript
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`, err);
  
  // Attempt to notify user
  ctx.reply('Sorry, something went wrong. Please try again later.')
    .catch(() => console.error('Failed to send error message to user'));
});
```

#### Handler-Specific Error Handling

```javascript
bot.command('example', async (ctx) => {
  try {
    // Command logic
    await riskyOperation();
    await ctx.reply('Success!');
  } catch (error) {
    console.error('Command failed:', error);
    await ctx.reply('Failed to process command. Please try again.');
  }
});
```

#### Process-Level Error Handling

```javascript
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to external service
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
```

### Webhook-Specific Errors

- **Invalid Update**: Log and return 200 to acknowledge
- **Timeout**: Telegram expects response within 60 seconds
- **Connection Errors**: Express retry middleware

---

## Webhook vs Polling

### When to Use Webhook

✅ **Use Webhook When**:
- Deploying to production environment
- Have stable public HTTPS URL
- Bot receives high volume of messages
- Need to minimize polling overhead
- Using serverless/cloud platform (Vercel, AWS Lambda)

**Pros**:
- More efficient (Telegram pushes updates)
- Lower latency
- Better for high-traffic bots
- No constant polling overhead

**Cons**:
- Requires public HTTPS URL
- SSL certificate required
- More complex deployment
- Must handle incoming HTTP requests

### When to Use Polling

✅ **Use Polling When**:
- Developing locally
- Behind firewall/NAT
- No public URL available
- Low-traffic bot
- Testing and prototyping

**Pros**:
- Simple setup
- Works anywhere
- No SSL required
- Easy local development

**Cons**:
- Constant API polling
- Higher latency
- Less efficient at scale
- Not suitable for serverless

### Switching Modes

Bot automatically selects mode based on environment:

```javascript
if (config.webhookUrl) {
  // Webhook mode
  await bot.api.setWebhook(`${config.webhookUrl}/webhook`);
  app.listen(config.port);
} else {
  // Polling mode
  await bot.start();
}
```

**Manual Mode Switch**:
1. **To Polling**: Remove `WEBHOOK_URL`, restart bot
2. **To Webhook**: Set `WEBHOOK_URL`, deploy to public URL
3. **Delete Webhook**: `await bot.api.deleteWebhook()`

---

## Prompts for AI Agents

### Example AI Coding Tasks

#### Add New Command

**Prompt**:
```
Add a /weather command that responds with a weather emoji and message.
Handler should be in src/handlers/weather.js
```

**Expected Steps**:
1. Create `src/handlers/weather.js`
2. Implement `registerWeather(bot)` function
3. Add `bot.command('weather', async (ctx) => {...})`
4. Import and register in `src/index.js`

#### Implement Database Integration

**Prompt**:
```
Add PostgreSQL database to store user interactions.
Track: user_id, username, last_command, timestamp.
Use environment variable DATABASE_URL.
```

**Expected Steps**:
1. Add `pg` dependency to package.json
2. Create `src/database.js` with connection pool
3. Add migration for users table
4. Update handlers to log interactions
5. Add DATABASE_URL to .env.example

#### Add Rate Limiting

**Prompt**:
```
Implement per-user rate limiting: 10 requests per minute.
Return friendly message when limit exceeded.
```

**Expected Steps**:
1. Add rate-limit middleware
2. Track user request timestamps
3. Add rate limit check before command handling
4. Return error message when exceeded
5. Add tests for rate limiting

### AI Agent Guidelines

When working on this codebase:

1. **Read DEVSPEC First**: Understand architecture before making changes
2. **Follow Patterns**: New handlers follow existing structure
3. **Update Documentation**: Modify README and DEVSPEC when adding features
4. **Environment Variables**: Add new vars to `.env.example`
5. **Error Handling**: Wrap async operations in try-catch
6. **Testing**: Add tests for new functionality

---

## Testing

### Acceptance Tests

#### Test 1: Bot Startup

**Given**: Valid BOT_TOKEN in environment
**When**: Bot starts
**Then**: Bot connects successfully and logs "Bot started in [mode] mode"

**Command**: `npm start`

**Success Criteria**:
- Process starts without errors
- Console shows startup message
- Bot responds to /start command in Telegram

#### Test 2: Start Command

**Given**: Bot is running
**When**: User sends `/start`
**Then**: Bot replies with welcome message

**Manual Test**:
1. Open Telegram
2. Send `/start` to bot
3. Verify welcome message received

**Expected Response**: Contains "Welcome", "grammY", "HACODE SOLUTIONS"

#### Test 3: Help Command

**Given**: Bot is running
**When**: User sends `/help`
**Then**: Bot replies with command list

**Expected Response**: Contains `/start`, `/help`, formatted list

#### Test 4: Echo Functionality

**Given**: Bot is running
**When**: User sends text message "Hello"
**Then**: Bot echoes back "You said: Hello"

#### Test 5: Webhook Setup (Production)

**Given**: `WEBHOOK_URL` set to valid HTTPS URL
**When**: Bot starts
**Then**: 
- Webhook registered with Telegram
- Express server listening
- Health check endpoint responds

**Command**: `curl https://your-bot.com/health`

**Expected**: `{"status":"ok"}`

#### Test 6: Error Handling

**Given**: Invalid command sent
**When**: Bot encounters error
**Then**: 
- Error logged to console
- User receives friendly error message
- Bot continues running

#### Test 7: Graceful Shutdown

**Given**: Bot is running
**When**: SIGINT signal received (Ctrl+C)
**Then**: 
- Bot stops gracefully
- Webhook deleted (if in webhook mode)
- Pending requests completed
- Process exits with code 0

### Automated Testing

```javascript
// tests/bot.test.js
import { describe, it, expect } from 'vitest';
import { Bot } from 'grammy';

describe('Bot Commands', () => {
  it('responds to /start command', async () => {
    // Test implementation
  });
  
  it('responds to /help command', async () => {
    // Test implementation
  });
});
```

**Run Tests**: `npm test`

### Manual Testing Checklist

- [ ] Bot starts in polling mode locally
- [ ] Bot starts in webhook mode when deployed
- [ ] `/start` command responds correctly
- [ ] `/help` command shows all commands
- [ ] Text messages trigger echo handler
- [ ] Invalid commands handled gracefully
- [ ] Bot survives error scenarios
- [ ] Graceful shutdown works (Ctrl+C)
- [ ] Health endpoint responds (webhook mode)
- [ ] Logs show proper information

---

## Deployment

### Prerequisites

1. **Telegram Bot Token**: Get from [@BotFather](https://t.me/BotFather)
2. **Public HTTPS URL**: Required for webhook mode
3. **SSL Certificate**: Must be valid (not self-signed)

### Environment Setup

**Required Variables**:
```bash
BOT_TOKEN=your_token_here
WEBHOOK_URL=https://your-domain.com
PORT=3000
NODE_ENV=production
```

### Platform-Specific Guides

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add BOT_TOKEN
vercel env add WEBHOOK_URL
```

**Note**: Vercel Serverless Functions have 10s timeout

#### Railway

1. Create new project from GitHub repo
2. Add environment variables in dashboard
3. Deploy automatically on push

#### Render

1. Create new Web Service
2. Connect GitHub repository
3. Add environment variables
4. Deploy

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t telegram-bot .
docker run -d --env-file .env -p 3000:3000 telegram-bot
```

### Post-Deployment Verification

1. Check webhook status: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Test health endpoint: `curl https://your-domain.com/health`
3. Send `/start` to bot in Telegram
4. Monitor logs for errors

---

## Security Best Practices

### Token Security

- **Never commit** `BOT_TOKEN` to version control
- Use environment variables or secrets management
- Rotate token if compromised
- Use `.gitignore` for `.env` files

### Webhook Security

- **Validate Requests**: Verify requests come from Telegram
- **Use HTTPS**: Never expose webhook on HTTP
- **Secret Token**: Set webhook secret for validation
- **Rate Limiting**: Prevent abuse

```javascript
// Validate webhook secret
app.post('/webhook', (req, res, next) => {
  const secret = req.headers['x-telegram-bot-api-secret-token'];
  if (secret !== process.env.WEBHOOK_SECRET) {
    return res.status(403).send('Forbidden');
  }
  next();
});
```

### Input Validation

- Sanitize user input before processing
- Validate command parameters
- Limit message length
- Escape special characters in responses

### Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100 // requests per window
});

app.use('/webhook', limiter);
```

---

## Monitoring and Logging

### Logging Strategy

**Log Levels**:
- **ERROR**: Critical failures requiring attention
- **WARN**: Non-critical issues, degraded functionality
- **INFO**: Normal operations, bot started/stopped
- **DEBUG**: Detailed information for troubleshooting

**What to Log**:
- Bot startup and shutdown
- Command invocations
- Errors with stack traces
- Webhook registrations
- User interactions (anonymized)

**Implementation**:
```javascript
const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
  debug: (msg, ...args) => console.debug(`[DEBUG] ${msg}`, ...args)
};
```

### Production Monitoring

**Recommended Tools**:
- **Sentry**: Error tracking and performance monitoring
- **Datadog**: Infrastructure and application monitoring
- **LogRocket**: Session replay and user analytics
- **Prometheus**: Metrics collection

**Key Metrics**:
- Request rate (updates per second)
- Response time (processing latency)
- Error rate (failed requests percentage)
- Uptime (availability percentage)

---

## Performance Optimization

### Best Practices

1. **Async Operations**: Always use async/await
2. **Connection Pooling**: Reuse database connections
3. **Caching**: Cache frequent responses
4. **Batch Processing**: Group API calls when possible
5. **Timeout Handling**: Set reasonable timeouts

### grammY Performance

```javascript
// Enable auto-retry
bot.api.config.use(autoRetry());

// Set request timeout
bot.api.config.use((prev, method, payload) => {
  return prev(method, payload, { timeout: 5000 });
});
```

### Webhook Performance

- **Keep handlers fast**: Respond within 60 seconds
- **Offload heavy work**: Use queues for long tasks
- **Return quickly**: Acknowledge update, process async
- **Minimize cold starts**: Keep functions warm

---

## Troubleshooting

### Common Issues

#### Bot Not Responding

**Symptom**: Commands sent but no response

**Diagnosis**:
1. Check bot token: `console.log(config.botToken)`
2. Verify bot is running: Check process/logs
3. Test webhook: `getWebhookInfo` API call
4. Check network: Firewall blocking Telegram?

**Solutions**:
- Verify `BOT_TOKEN` is correct
- Restart bot process
- Delete and re-register webhook
- Check logs for errors

#### Webhook Not Working

**Symptom**: Webhook registered but updates not received

**Diagnosis**:
1. Check webhook info: `getWebhookInfo`
2. Verify URL is HTTPS with valid certificate
3. Test endpoint: `curl https://your-domain.com/webhook`
4. Check firewall and port accessibility

**Solutions**:
- Ensure URL is publicly accessible
- Verify SSL certificate is valid
- Check webhook registration status
- Review server logs for errors

#### "Conflict: terminated by other getUpdates request"

**Symptom**: Bot crashes with conflict error

**Diagnosis**: Multiple bot instances or polling while webhook active

**Solutions**:
1. Stop all running bot instances
2. Delete webhook: `await bot.api.deleteWebhook()`
3. Start single bot instance

#### Commands Not Registered

**Symptom**: Commands work but don't show in Telegram menu

**Solutions**:
```javascript
// Set bot commands
await bot.api.setMyCommands([
  { command: 'start', description: 'Start the bot' },
  { command: 'help', description: 'Show help message' }
]);
```

---

## Advanced Topics

### Multi-Language Support

```javascript
const messages = {
  en: { welcome: 'Welcome!' },
  es: { welcome: '¡Bienvenido!' }
};

bot.command('start', async (ctx) => {
  const lang = ctx.from.language_code || 'en';
  await ctx.reply(messages[lang]?.welcome || messages.en.welcome);
});
```

### Database Integration

```javascript
// src/database.js
import pg from 'pg';

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

export async function saveInteraction(userId, command) {
  await pool.query(
    'INSERT INTO interactions (user_id, command, created_at) VALUES ($1, $2, NOW())',
    [userId, command]
  );
}
```

### Inline Keyboards

```javascript
import { InlineKeyboard } from 'grammy';

bot.command('menu', async (ctx) => {
  const keyboard = new InlineKeyboard()
    .text('Option 1', 'opt1')
    .text('Option 2', 'opt2');
  
  await ctx.reply('Choose an option:', { reply_markup: keyboard });
});

bot.callbackQuery('opt1', async (ctx) => {
  await ctx.answerCallbackQuery('You selected Option 1');
});
```

### Middleware

```javascript
// Logging middleware
bot.use(async (ctx, next) => {
  console.log(`Update: ${ctx.update.update_id}`);
  await next();
});

// Authentication middleware
bot.use(async (ctx, next) => {
  const allowedUsers = [123456, 789012];
  if (allowedUsers.includes(ctx.from?.id)) {
    await next();
  } else {
    await ctx.reply('Unauthorized');
  }
});
```

---

## Resources

### Official Documentation

- [grammY Documentation](https://grammy.dev)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Express.js](https://expressjs.com)
- [Node.js](https://nodejs.org)

### HACODE SOLUTIONS

- **Website**: [hacode.solutions](https://hacode.solutions)
- **Services**: Custom bot development, AI integration, cloud deployment
- **Support**: Technical consulting for Telegram bots

### Related Projects

- [telegraf](https://github.com/telegraf/telegraf) - Alternative bot framework
- [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api) - Lower-level API wrapper

---

## Changelog

### v1.0.0 (Initial Release)

- grammY bot framework integration
- Webhook and polling mode support
- Express server for webhooks
- Basic command handlers (/start, /help)
- Echo message handler
- Environment-based configuration
- Error handling and logging
- Comprehensive documentation
- MIT License

---

## License

MIT License - see [LICENSE](./LICENSE)

Built with ❤️ by [HACODE SOLUTIONS](https://hacode.solutions)
