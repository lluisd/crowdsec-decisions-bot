export const config = {
    port: process.env.PORT || 3000,
    telegram: {
        token: process.env.TELEGRAM_TOKEN,
        should_use_webhooks: process.env.USE_WEBHOOKS || false,
        externalUrl: process.env.EXTERNAL_URL,
    },
    crowdsec: {
        lapi: {
            url: process.env.LAPI_URL || 'http://crowdsec:8080',
            login: process.env.LAPI_LOGIN || 'crowdsec',
            password: process.env.LAPI_PASSWORD,
        }
    }
}
