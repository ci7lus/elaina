import { MutableSnapshot } from "recoil"
import {
  backendSettingAtom,
  playerSettingAtom,
  playerSettingParser,
  sayaSettingAtom,
  upstreamSettingParser,
} from "./setting"

export const initializeState = (mutableSnapShot: MutableSnapshot) => {
  const savedSayaSetting = localStorage.getItem(sayaSettingAtom.key)
  if (savedSayaSetting) {
    try {
      const parsed = upstreamSettingParser.parse(JSON.parse(savedSayaSetting))
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

  const savedBackendSetting = localStorage.getItem(backendSettingAtom.key)
  if (savedBackendSetting) {
    try {
      const parsed = upstreamSettingParser.parse(
        JSON.parse(savedBackendSetting)
      )
      mutableSnapShot.set(backendSettingAtom, parsed)
    } catch {}
  } else {
    const url = process.env.BACKEND_URL
    const user = process.env.BACKEND_AUTH_USER || null
    const pass = process.env.BACKEND_AUTH_PASS || null
    if (url) {
      mutableSnapShot.set(backendSettingAtom, {
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
