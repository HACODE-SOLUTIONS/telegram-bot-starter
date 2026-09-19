# Telegram Bot Starter

**Free DevSpec pack for AI-powered Telegram bots** — minimal Node.js scaffold with grammY, Express webhook support, and comprehensive documentation for autonomous coding agents.

Built by [HACODE SOLUTIONS](https://hacode.solutions) 🚀

---

## Features

- **grammY bot framework** — modern, type-safe Telegram bot API
- **Dual mode support** — webhook (production) and polling (development)
- **Express server** — webhook endpoint with health checks
- **Environment-based config** — secure credential management
- **Error handling** — graceful degradation and retry logic
- **AI agent ready** — comprehensive DEVSPEC and SKILL documentation
- **Production patterns** — logging, validation, and best practices

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `BOT_TOKEN` — your Telegram bot token from BotFather
- `WEBHOOK_URL` — your public HTTPS URL (production only)
- `PORT` — server port (default: 3000)

### Development (Polling)

```bash
npm run dev
```

Bot will start in polling mode, perfect for local development.

### Production (Webhook)

```bash
npm start
```

Webhook mode requires:
- Public HTTPS URL with valid SSL certificate
- `WEBHOOK_URL` environment variable set
- PORT accessible from internet

## Project Structure

```
telegram-bot-starter/
├── src/
│   ├── index.js           # Main entry point
│   ├── config.js          # Configuration management
│   └── handlers/
│       ├── start.js       # /start command
│       ├── help.js        # /help command
│       └── echo.js        # Echo message handler
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
├── DEVSPEC.md            # Complete development specification
├── SKILL.md              # AI agent integration guide
└── README.md             # This file
```

## Commands

- `/start` — Welcome message and bot introduction
- `/help` — Command list and usage instructions

## Documentation

- **[DEVSPEC.md](./DEVSPEC.md)** — Complete technical specification for developers and AI agents
- **[SKILL.md](./SKILL.md)** — Integration guide for AI coding agents (Cursor, GitHub Copilot, etc.)

## Testing

```bash
# Run acceptance tests
npm test
```

## Deployment

### Vercel / Railway / Render

1. Set environment variables in platform dashboard
2. Deploy from GitHub repository
3. Platform will automatically run `npm start`

### Docker

```bash
docker build -t telegram-bot .
docker run -d --env-file .env -p 3000:3000 telegram-bot
```

## Development

### Adding New Commands

1. Create handler in `src/handlers/yourcommand.js`
2. Export function that receives `bot` instance
3. Register in `src/index.js`

Example:

```javascript
// src/handlers/ping.js
export function registerPing(bot) {
  bot.command('ping', (ctx) => ctx.reply('Pong! 🏓'));
}
```

### Environment Variables

See `.env.example` for all available configuration options.

## Architecture

- **Webhook Mode**: Express server receives updates at `/webhook` endpoint
- **Polling Mode**: Bot polls Telegram API for updates (dev only)
- **Graceful Shutdown**: SIGINT/SIGTERM handlers for clean process termination

## Contributing

Contributions welcome! This is a starter template — fork, customize, and build amazing bots.

## License

MIT License — see [LICENSE](./LICENSE)

## Resources

- [grammY Documentation](https://grammy.dev)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [HACODE SOLUTIONS](https://hacode.solutions)

## Support

Built with ❤️ by [HACODE SOLUTIONS](https://hacode.solutions)

For questions, issues, or custom bot development, visit [hacode.solutions](https://hacode.solutions).

---

**Happy bot building! 🤖**
