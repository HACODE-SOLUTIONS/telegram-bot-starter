export function registerStart(bot) {
  bot.command('start', async (ctx) => {
    const username = ctx.from.first_name || 'there';
    
    const message = `
👋 Welcome, ${username}!

I'm a Telegram bot starter built with grammY.

*Available Commands:*
/start - Show this welcome message
/help - Get help and command list

*About:*
Built by [HACODE SOLUTIONS](https://hacode.solutions) 🚀

Ready to be customized for your needs!
    `.trim();
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
  });
}
