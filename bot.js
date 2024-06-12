
import { Telegraf, Markup, Context } from "telegraf";

console.log("Token:", process.env.TELEGRAM_BOT_TOKEN)
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "6018859569:AAG17oJTs-GeYr2t8diNiv5VyqOHKT2ELHs");

bot.command('start', ctx => {
  ctx.reply("Welcome to Rock-Paper-Scissors Game!\nHere you can play rock-paper-scissors game.\nClick the button below or go to the chat which you want to send the invitation to, type in @RockPaperScissorsGame_Minibot, and add a space.",
  {
    parse_mode: "Markdown",
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: msg.t("button.play"),
                    switch_inline_query_chosen_chat: {
                        query: "",
                        allow_bot_chats: false,
                        allow_channel_chats: false,
                        allow_group_chats: false,
                        allow_user_chats: true,
                    },
                },
            ],
        ],
    },
  })
});

export default bot;