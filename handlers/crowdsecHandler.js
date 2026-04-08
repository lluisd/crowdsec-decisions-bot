import CrowdsecLocalApi from "../api/crowdsecLocalApi.js"
import i18n from "../i18n.js"

class CrowdsecHandler {
    async deleteDecisionByIp(callbackQuery, bot) {
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

        let responseMessage
        if (deletedDecisions === 1) {
            responseMessage = i18n.__('one_decision_deleted', { count: deletedDecisions, ip })
        } else if (deletedDecisions > 0) {
            responseMessage = i18n.__('many_decisions_deleted', { count: deletedDecisions, ip })
        } else {
            responseMessage = i18n.__('no_decisions', { ip })
        }

        console.log(responseMessage)
        await bot.answerCallbackQuery(callbackQuery.id)
        await bot.sendMessage(chatId, responseMessage, options)
    }
}

const crowdsecHandler = new CrowdsecHandler()
export default crowdsecHandler