import { atom } from "recoil"
import { Channel } from "../types/struct"

export const scheduleAtom = atom<Channel[] | null>({
  key: "schedule",
  default: null,
})
