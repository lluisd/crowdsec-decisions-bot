import moment from 'moment'
import { config } from '../config.js'

let tokenData = {
    token: null,
    expiresAt: null
}

async function login() {
    console.log(`Calling /v1/watchers/login`)
    const endpoint = `${config.crowdsec.lapi.url}/v1/watchers/login`
    const options = {
        headers: _getHeaders(),
        method: 'POST',
        body: JSON.stringify({
            machine_id: config.crowdsec.lapi.login,
            password: config.crowdsec.lapi.password
        })
    }

    try {
        const response = await fetch(endpoint, options)
        if (!response.ok) {
            throw new Error(`crowdsec lapi login status: ${response.status}`)
        }
        const { token, expire } = await response.json()

        tokenData.token = token
        tokenData.expiresAt = moment.utc(expire).valueOf()
        return token
    } catch (error) {
        throw error
    }
}

async function getValidToken() {
    if (!tokenData.token || moment.utc().valueOf() >= tokenData.expiresAt) {
        await login()
    }
    return tokenData.token
}

async function deleteDecisionsByIP(ip) {
    console.log(`Calling /v1/decisions?ip=${ip}`)
    const token = await getValidToken()
    const endpoint = `${config.crowdsec.lapi.url}/v1/decisions?ip=${ip}`
    const options = {
        headers: _getHeaders(token),
        method: 'DELETE',
    }

    try {
        const response = await fetch(endpoint, options)
        if (!response.ok) {
            throw new Error(`HTTP Error on crowdsec lapi deletedecision status: ${response.status}`)
        }
        const { nbDeleted } = await response.json()
        return nbDeleted
    } catch (error) {
        throw error
    }
}

function _getHeaders(token) {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'user-agent': 'decisionsBot/5.0',
        ...(token && {'Authorization': `Bearer ${token}`})
    }
}

export default {
    deleteDecisionsByIP
}
