import CrowdsecLocalApi from "../api/crowdsecLocalApi.js";

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

        let responseMessage = `No decisions found for IP: ${ip}`
        if (deletedDecisions === 1) {
            responseMessage = `${deletedDecisions} decision deleted for IP: ${ip}`
        }
        else if (deletedDecisions > 0) {
            responseMessage = `${deletedDecisions} decisions deleted for IP: ${ip}`
        }

        console.log(responseMessage)
        await bot.answerCallbackQuery(callbackQuery.id)
        await bot.sendMessage(chatId, responseMessage, options)
    }
}

const crowdsecHandler = new CrowdsecHandler()
export default crowdsecHandler