export const sayaUrl = process.env.SAYA_URL

export const chinachuUrl = process.env.CHINACHU_URL

if (!sayaUrl || !chinachuUrl) throw new Error("Invalid Chinachu/Saya Url")

const sayaWS = new URL(sayaUrl)
sayaWS.protocol = "wss:"
export const sayaWSUrl = sayaWS.href

export const chinachuAuthUser = process.env.CHINACHU_AUTH_USER
export const chinachuAuthPass = process.env.CHINACHU_AUTH_PASS

export const sayaAuthUser = process.env.SAYA_AUTH_USER
export const sayaAuthPass = process.env.SAYA_AUTH_PASS
