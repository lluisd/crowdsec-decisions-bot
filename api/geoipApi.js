async function getIPCountry(ip) {
    const url = `https://get.geojs.io/v1/ip/country/${ip}`

    try {
        const response = await fetch(url)
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`)
        }
        const result = await response.text()
        return result.replace('\n', '')
    } catch (error) {
        throw error
    }
}

export default {
    getIPCountry
}
