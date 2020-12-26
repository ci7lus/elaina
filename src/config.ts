export const sayaUrl = process.env.SAYA_URL

if (!sayaUrl) throw new Error("Invalid Chinachu/Saya Url")

const sayaWS = new URL(sayaUrl)
sayaWS.protocol = "wss:"
export const sayaWSUrl = sayaWS.href

export const sayaAuthUser = process.env.SAYA_AUTH_USER
export const sayaAuthPass = process.env.SAYA_AUTH_PASS
