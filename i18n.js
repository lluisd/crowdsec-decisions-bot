import { I18n } from 'i18n'
import { config } from './config.js'
import en from './locales/en.json' with { type: 'json' }
import es from './locales/es.json' with { type: 'json' }

const i18n = new I18n({
    locales: ['en', 'es'],
    defaultLocale: config.language,
    staticCatalog: { en, es }
})

export default i18n
