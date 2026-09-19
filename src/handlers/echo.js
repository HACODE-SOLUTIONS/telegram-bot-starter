export function registerEcho(bot) {
  bot.on('message:text', async (ctx) => {
    const text = ctx.message.text;
    
    if (text.startsWith('/')) {
      return;
    }
    
    await ctx.reply(`You said: ${text}`);
  });
}
