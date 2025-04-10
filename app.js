import 'dotenv/config'
import express from "express"
import { config } from './config.js'
import CrowdsecLocalApi from "./api/crowdsecLocalApi.js"
import TelegramBot from 'node-telegram-bot-api'

let bot
if (config.telegram.should_use_webhooks) {
    bot = new TelegramBot(config.telegram.token, {webHook: {port: config.port}})
    await bot.setWebHook(config.externalUrl + '/bot' + config.telegram.token)
} else {
    bot = new TelegramBot(config.telegram.token, {polling: true})
}

const app = express()
app.use(express.json())
app.get('/health', function(req, res) {
    res.json({ status: 'UP' })
})

const listener = app.listen(process.env.PORT, async ()=>  {
    console.log('Listening on port ', + listener.address().port)
})

bot.on('callback_query', async (callbackQuery) =>  {
    try {
        const inlineQuery = callbackQuery.data.split('~')[0]
        if (inlineQuery === 'deleteDecisions') {
            let ip = callbackQuery.data.split('~')[1]
            const deletedDecisions = parseInt(await CrowdsecLocalApi.deleteDecisionsByIP(ip))

            const chatId = callbackQuery.message.chat.id
            const messageThreadId = callbackQuery.message.message_thread_id

            const options = {
                reply_to_message_id: callbackQuery.message.message_id
            };

            if (messageThreadId !== undefined) {
                options.message_thread_id = messageThreadId
            }

            let responseMessage = `No decisions found for IP: ${ip}`
            if (deletedDecisions > 0) {
                responseMessage = `${deletedDecisions} decisions deleted for IP: ${ip}`
            }

            await bot.sendMessage(chatId, responseMessage, options)
        }
    } catch (error) {
        console.log(error)
    }
});






