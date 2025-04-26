import {config} from '../config.js'

async function getSmoke(ip) {
    console.log(`Calling /v2/smoke/${ip}`)
    const endpoint = `${config.crowdsec.cti.url}/v2/smoke/${ip}`
    const options = {
        headers: _getHeaders(),
        method: 'GET'
    }

    try {
        const response = await fetch(endpoint, options)
        if (!response.ok) {
            throw new Error(`crowdsec cti smoke: ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        throw error
    }
}

function _getHeaders() {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'user-agent': 'decisionsBot/5.0',
        'x-api-key': config.crowdsec.cti.apiKey
    }
}

export default {
    getSmoke
}
