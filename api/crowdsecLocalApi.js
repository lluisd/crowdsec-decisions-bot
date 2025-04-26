import moment from 'moment'
import {config} from '../config.js'

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
        headers: _getHeadersWithAuthToken(token),
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

async function getDecisionsByIP(ip) {
    console.log(`Calling GET /v1/decisions?ip=${ip}`)
    const endpoint = `${config.crowdsec.lapi.url}/v1/decisions?ip=${ip}`
    const options = {
        headers: _getHeadersWithXApiKey(),
    }

    try {
        const response = await fetch(endpoint, options)
        if (!response.ok) {
            throw new Error(`HTTP Error on crowdsec lapi get decision status: ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        throw error
    }
}

function _getHeaders(token) {
    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'user-agent': 'decisionsBot/5.0'
    }
}

function _getHeadersWithAuthToken(token) {
    return {
        ..._getHeaders(),
        'Authorization': `Bearer ${token}`
    }
}

function _getHeadersWithXApiKey() {
    return {
        ..._getHeaders(),
        'x-api-key': config.crowdsec.lapi.apiKey
    }
}

export default {
    deleteDecisionsByIP,
    getDecisionsByIP
}
