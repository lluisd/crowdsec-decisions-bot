export const config = {
    port: process.env.PORT || 3000,
    telegram: {
        token: process.env.TELEGRAM_TOKEN,
        should_use_webhooks: process.env.USE_WEBHOOKS || false,
        externalUrl: process.env.EXTERNAL_URL,
        chatId: process.env.CHAT_ID,
        threadId: process.env.CHAT_THREAD_ID
    },
    crowdsec: {
        lapi: {
            url: process.env.LAPI_URL || 'http://crowdsec:8080',
            login: process.env.LAPI_LOGIN || 'crowdsec',
            password: process.env.LAPI_PASSWORD,
            apiKey: process.env.LAPI_API_KEY
        },
        cti: {
            url: process.env.CTI_URL || 'https://cti.api.crowdsec.net',
            apiKey: process.env.CTI_API_KEY
        }
    },
    database: process.env.MONGODB_URI,
}
