
import { Telegraf, Markup, Context } from "telegraf";
console.log("Token:", process.env.TELEGRAM_BOT_TOKEN)
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");

bot.command('start', ctx => {
  ctx.reply("Welcome to Rock-Paper-Scissors Game!\nHere you can play rock-paper-scissors game.\nClick the button below or go to the chat which you want to send the invitation to, type in @RockPaperScissorsGame\\_Minibot, and add a space.",
  {
    parse_mode: "Markdown",
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "Play",
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

bot.on('inline_query', async({inlineQuery, answerInlineQuery}) => {
    console.log(inlineQuery)
    const results = {
        type: 'article',
        id: 'newgame',
        title: 'New Game',
        description: 'Send invitation to start a game with opponent',
        thumbnail_url: process.env.HOST_URL + 'thumbnail.jpeg',
        input_message_content: {
            message_text: 'Creating a gaming session.\n\n_Please wait a moment..._',
            parse_mode: "Markdown",
        },
        reply_markup: {
            inline_keyboard: [{ text: 'Wait'}],
        },
    }

    await answerInlineQuery(results, {
        cache_time: 0
    })
})

export default bot;