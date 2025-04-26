import Cti from "../models/cti.js"
import moment from "moment-timezone"

async function updateIp (ip, data) {
    try {
        return Cti.findOneAndUpdate({ip: ip}, data, { upsert: true, new: true})
    } catch (error) {
        throw new Error(`Error adding ip to Mongodb: ${error}`)
    }
}

async function getIp (ip) {
    try {
        return Cti.findOne({ ip: ip }).lean()
    } catch (error) {
        throw new Error(`Error getting ip from Mongodb: ${error}`)
    }
}

async function deleteIp (ip) {
    try {
        return Cti.deleteOne({ ip: ip })
    } catch (error) {
        throw new Error(`Error deleting cti from Mongodb: ${error}`)
    }
}

async function deleteExpiredIps () {
    try {
        return Cti.deleteMany({ expiryDate: { $lt: moment().tz('Europe/Madrid').toDate() } })
    } catch (error) {
        throw new Error(`Error deleting expired cti ip from Mongodb: ${error}`)
    }
}

export default  {
    getIp,
    updateIp,
    deleteExpiredIps,
    deleteIp
}
