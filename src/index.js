import { Bot } from 'grammy';
import express from 'express';
import { config } from './config.js';
import { registerStart } from './handlers/start.js';
import { registerHelp } from './handlers/help.js';
import { registerEcho } from './handlers/echo.js';

const bot = new Bot(config.botToken);
const app = express();

app.use(express.json());

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`[ERROR] Error while handling update ${ctx.update.update_id}:`, err);
  
  ctx.reply('Sorry, something went wrong. Please try again later.')
    .catch(() => console.error('[ERROR] Failed to send error message to user'));
});

registerStart(bot);
registerHelp(bot);
registerEcho(bot);

if (config.mode === 'webhook') {
  console.log('[INFO] Starting bot in webhook mode...');
  
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', mode: 'webhook' });
  });
  
  app.use(bot.webhookCallback('/webhook'));
  
  app.listen(config.port, async () => {
    await bot.api.setWebhook(`${config.webhookUrl}/webhook`);
    console.log(`[INFO] Webhook set to ${config.webhookUrl}/webhook`);
    console.log(`[INFO] Server listening on port ${config.port}`);
    console.log(`[INFO] Bot started successfully in webhook mode`);
  });
} else {
  console.log('[INFO] Starting bot in polling mode...');
  
  await bot.api.deleteWebhook();
  
  bot.start({
    onStart: () => {
      console.log('[INFO] Bot started successfully in polling mode');
      console.log('[INFO] Press Ctrl+C to stop');
    }
  });
}

process.once('SIGINT', async () => {
  console.log('[INFO] Received SIGINT, stopping bot...');
  await bot.stop();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  console.log('[INFO] Received SIGTERM, stopping bot...');
  await bot.stop();
  process.exit(0);
});
