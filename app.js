import 'dotenv/config'
import express from "express"
import { config } from './config.js'
import crowdsecHandler from "./handlers/crowdsecHandler.js"
import unifiDetectionsHandler from "./handlers/unifiDetectionsHandler.js"
import TelegramBot from 'node-telegram-bot-api'
import mongoose from 'mongoose'
import cron from 'node-cron'

mongoose.connect(config.database, {dbName: 'cti'}).then(async () => {
    console.log('Connected')

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

    app.post('/detection', async function (req, res, next) {
        try {
            const detections = req.body
            console.log('Received unifi detection: ' + JSON.stringify(detections, null, 2))
            for (const detection of detections) {
                await unifiDetectionsHandler.notifyDetection(detection, bot)
            }
            const response = {
                message: detections,
                status: 'success'
            };
            res.json(response)
        } catch (error) {
            next(error)
        }
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

    cron.schedule('*/10 * * * *', async () => {
        await unifiDetectionsHandler.removeExpiredCtiIps()
    })
})