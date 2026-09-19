import 'dotenv/config';

export const config = {
  botToken: process.env.BOT_TOKEN,
  webhookUrl: process.env.WEBHOOK_URL,
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  isProduction: process.env.NODE_ENV === 'production',
  mode: process.env.WEBHOOK_URL ? 'webhook' : 'polling'
};

if (!config.botToken) {
  throw new Error('BOT_TOKEN environment variable is required');
}

if (config.webhookUrl && !config.webhookUrl.startsWith('https://')) {
  throw new Error('WEBHOOK_URL must be an HTTPS URL');
}

console.log(`[CONFIG] Bot mode: ${config.mode}`);
console.log(`[CONFIG] Environment: ${config.nodeEnv}`);
