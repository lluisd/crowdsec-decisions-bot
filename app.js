import 'dotenv/config'
import express from "express"
import { config } from './config.js'
import crowdsecHandler from "./handlers/crowdsecHandler.js"
import TelegramBot from 'node-telegram-bot-api'

const bot = new TelegramBot(config.telegram.token, {polling: !config.telegram.should_use_webhooks})

if (config.telegram.should_use_webhooks)
    await bot.setWebHook(`${config.telegram.externalUrl}/bot${config.telegram.token}`)

const app = express()
app.use(express.json())
app.get('/health', function (req, res) {
    res.json({status: 'UP'})
})

if (config.telegram.should_use_webhooks) {
    app.post(`/bot${config.telegram.token}`, (req, res) => {
        bot.processUpdate(req.body)
        res.sendStatus(200)
    })
}

app.get('/health', function (req, res) {
    res.json({status: 'UP'})
})

app.listen(config.port, async () => {
    console.log('Listening on port ', +config.port)
    console.log(`Telegram bot on ${config.telegram.should_use_webhooks ? 'Webhook' : 'Polling'} mode`)
})

bot.on('callback_query', async (callbackQuery) => {
    try {
        const inlineQuery = callbackQuery.data.split('~')[0]
        if (inlineQuery === 'deleteDecisions') {
            return await crowdsecHandler.deleteDecisionByIp(callbackQuery, bot)
        }
    } catch (error) {
        console.log(error)
    }
})