import { atom } from "recoil"
import { PlayerSetting, SayaSetting } from "../types/setting"
import * as $ from "zod"

const prefix = "elaina:setting"

export const sayaSettingParser = $.object({
  url: $.string(),
  user: $.string().nullable(),
  pass: $.string().nullable(),
})

export const sayaSettingAtom = atom<SayaSetting>({
  key: `${prefix}:saya`,
  default: {
    url: null,
    user: null,
    pass: null,
  },
})

export const playerSettingAtom = atom<PlayerSetting>({
  key: `${prefix}:player`,
  default: { commentDelay: null },
})

export const playerSettingParser = $.object({
  commentDelay: $.number().nullable(),
})
