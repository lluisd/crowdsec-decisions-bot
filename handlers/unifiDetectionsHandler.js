import CrowdsecLocalApi from "../api/crowdsecLocalApi.js"
import GeoipApi from "../api/geoipApi.js"
import {countryCodeToFlagEmoji} from '../helpers/emoji.js'
import CrowdsecCTIApi from '../api/crowdsecCTIApi.js'
import Mongo from '../api/mongoApi.js'
import moment from "moment-timezone"
import mongoApi from "../api/mongoApi.js"
import { config } from '../config.js'

class UnifiDetectionsHandler {
    async notifyDetection({srcIp, protocol, dstPort}, bot) {
        let text = ''
        const currentDecisions = await CrowdsecLocalApi.getDecisionsByIP(srcIp)
        let origins = []
        if (currentDecisions && currentDecisions.length > 0) {
            origins = currentDecisions.map(decision => decision.origin)
        }
        text = origins.length > 0 ? `<i>In ${origins[0]}<\i>` : '<i>Not in crowdsec</i>'

        const countryCode = await GeoipApi.getIPCountry(srcIp)
        const countryEmoji = countryCode !== 'nil' ? countryCodeToFlagEmoji(countryCode) : '🏴‍☠️'
        text += ` ${countryEmoji}`

        let ctiInfo = (await Mongo.getIp(srcIp))?.info
        if (!ctiInfo) {
            ctiInfo = await CrowdsecCTIApi.getSmoke(srcIp)
            await Mongo.updateIp(srcIp, {
                ip: srcIp,
                info: ctiInfo,
                expiryDate: moment().tz('Europe/Madrid').add(24, 'hours').toDate()
            })
        }

        if (ctiInfo && !ctiInfo.message) {
            if (ctiInfo.location?.city) text += ` ${ctiInfo.location.city}`
            text += ` ${srcIp} on ${dstPort}/${protocol}`
            if (ctiInfo.as_name) text += ` (${ctiInfo.as_name})`
            if (ctiInfo.reputation) text += ` Reputation: <b>${ctiInfo.reputation}</b>`
            if (ctiInfo.background_noise) text += ` Noise: <b>${ctiInfo.background_noise}</b>`
        }

        console.log(text)
        await bot.sendMessage(config.telegram.chatId, text, {
            parse_mode: 'html',
            message_thread_id: config.telegram.threadId,
        })
    }

    async removeExpiredCtiIps() {
        return await mongoApi.deleteExpiredIps()
    }
}

const unifiDetectionsHandler = new UnifiDetectionsHandler()
export default unifiDetectionsHandler