export const config = {
    port: process.env.PORT || 3000,
    telegram: {
        token: process.env.TELEGRAM_TOKEN,
        channelId: process.env.TELEGRAM_CHAT_ID,
        should_use_webhooks: process.env.USE_WEBHOOKS || false,
        externalUrl: process.env.EXTERNAL_URL,
    },
    crowdsec: {
        lapi: {
            url: process.env.LAPI_URL,
            login: process.env.LAPI_LOGIN,
            password: process.env.LAPI_PASSWORD,
        }
    }
}
