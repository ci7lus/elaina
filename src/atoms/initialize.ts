import { MutableSnapshot } from "recoil"
import {
  playerSettingAtom,
  playerSettingParser,
  sayaSettingAtom,
  sayaSettingParser,
} from "./setting"

export const initializeState = (mutableSnapShot: MutableSnapshot) => {
  const savedSayaSetting = localStorage.getItem(sayaSettingAtom.key)
  if (savedSayaSetting) {
    try {
      const parsed = sayaSettingParser.parse(JSON.parse(savedSayaSetting))
      mutableSnapShot.set(sayaSettingAtom, parsed)
    } catch {}
  } else {
    const url = process.env.SAYA_URL
    const user = process.env.SAYA_AUTH_USER || null
    const pass = process.env.SAYA_AUTH_PASS || null
    if (url) {
      mutableSnapShot.set(sayaSettingAtom, {
        url,
        user,
        pass,
      })
    }
  }

  const savedPlayerSetting = localStorage.getItem(playerSettingAtom.key)
  if (savedPlayerSetting) {
    try {
      const parsed = playerSettingParser.parse(JSON.parse(savedPlayerSetting))
      mutableSnapShot.set(playerSettingAtom, parsed)
    } catch {}
  }
}
