export function registerHelp(bot) {
  bot.command('help', async (ctx) => {
    const helpText = `
🤖 *Bot Commands*

/start - Welcome message and introduction
/help - Show this help message

*About This Bot*
Built with grammY framework by HACODE SOLUTIONS

*Resources*
• Website: https://hacode.solutions
• Documentation: See DEVSPEC.md
• Framework: https://grammy.dev

*Need Help?*
Visit hacode.solutions for support and custom development.
    `.trim();
    
    await ctx.reply(helpText, { parse_mode: 'Markdown' });
  });
}
