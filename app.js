import 'dotenv/config'
import express from "express"
import { config } from './config.js'
import CrowdsecLocalApi from "./api/crowdsecLocalApi.js"
import TelegramBot from 'node-telegram-bot-api'

let bot
if (config.telegram.should_use_webhooks) {
    bot = new TelegramBot(config.telegram.token, {webHook: {port: 443}})
    await bot.setWebHook(`${config.externalUrl}/bot${config.telegram.token}`)
    console.log(`Webhook mode enabled, listening on ${config.externalUrl}/bot${config.telegram.token}`)
} else {
    bot = new TelegramBot(config.telegram.token, {polling: true})
    console.log('Polling mode enabled')
}

const app = express()
app.use(express.json())
app.get('/health', function(req, res) {
    res.json({ status: 'UP' })
})

// We are receiving updates at the route below!
app.post(`/bot${config.telegram.token}`, (req, res) => {
    bot.processUpdate(req.body)
    res.sendStatus(200)
})

const listener = app.listen(config.port, async ()=>  {
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
            if (deletedDecisions === 1) {
                responseMessage = `${deletedDecisions} decision deleted for IP: ${ip}`
            }
            else if (deletedDecisions > 0) {
                responseMessage = `${deletedDecisions} decisions deleted for IP: ${ip}`
            }

            await bot.sendMessage(chatId, responseMessage, options)
        }
    } catch (error) {
        console.log(error)
    }
})