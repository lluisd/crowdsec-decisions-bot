export function countryCodeToFlagEmoji(code) {
    if (!code || code.length !== 2) return '';
    const OFFSET = 127397; // Unicode offset for regional indicators
    return code
        .toUpperCase()
        .split('')
        .map(char => String.fromCodePoint(char.charCodeAt(0) + OFFSET))
        .join('');
}