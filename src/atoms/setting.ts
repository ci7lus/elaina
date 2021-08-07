import { atom } from "recoil"
import * as $ from "zod"
import { BackendSetting, PlayerSetting, SayaSetting } from "../types/setting"

const prefix = "elaina:setting"

export const upstreamSettingParser = $.object({
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

export const backendSettingAtom = atom<BackendSetting>({
  key: `${prefix}:backend`,
  default: {
    url: null,
    user: null,
    pass: null,
  },
})

export const playerSettingAtom = atom<PlayerSetting>({
  key: `${prefix}:player`,
  default: {
    commentDelay: null,
    recordCommentDelay: 1,
    useMpegTs: false,
    mpegTsMode: 1,
  },
})

export const playerSettingParser = $.object({
  commentDelay: $.number().nullable().optional(),
  recordCommentDelay: $.number().nullable().optional(),
  useMpegTs: $.boolean().optional(),
  mpegTsMode: $.number().nullable(),
})
