
import { Telegraf, Markup, Context } from "telegraf";
import { createRoom, joinRoom } from "./server.js";
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

bot.on('inline_query', async(ctx) => {
    const results = [{
        type: 'article',
        id: 'newgame',
        title: 'New Game',
        description: 'Create a new room to start a game with opponent',
        thumbnail_url: process.env.HOST_URL + 'thumbnail.jpeg',
        input_message_content: {
            message_text: 'Creating a gaming session.\n\n_Please wait a moment..._',
            parse_mode: "Markdown",
        },
        reply_markup: {
            inline_keyboard: [[{ text: 'Wait', callback_data: 'wait_action'}]],
        },
    }]

    await ctx.answerInlineQuery(results, {
        cache_time: 0
    })
})

bot.on('chosen_inline_result', async(ctx) => {
    const roomID = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
    const fromId = ctx.chosenInlineResult.from.id;
    // createRoom(roomID)
    const messageID = ctx.chosenInlineResult.inline_message_id;
    const gameName = "rps_game"
    const gameUrl = `https://t.me/${bot.botInfo.username}/${gameName}?startapp=${roomID}`;
    await ctx.telegram.editMessageText(undefined, undefined, messageID, `Room created with ID: ${roomID}, Please join to start a game`, {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Join', 
                        url: gameUrl
                    }
                ]
            ]
        }
    });
})

export default bot;