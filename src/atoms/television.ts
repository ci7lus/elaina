import { atom, selector } from "recoil"
import { ApiDocs } from "../types/epgstation"
import { Channel, Schedule } from "../types/struct"

const prefix = "elaina:television"

export const apiDocsAtom = atom<ApiDocs | null>({
  key: `${prefix}.apidocs`,
  default: null,
})

export const channelsAtom = atom<Channel[] | null>({
  key: `${prefix}:channels`,
  default: null,
})

export const schedulesAtom = atom<Schedule[] | null>({
  key: `${prefix}:schedules`,
  default: null,
})

export const filteredSchedulesSelector = selector<Schedule[] | null>({
  key: `${prefix}:filtered-schedules`,
  get: ({ get }) => {
    const schedules = get(schedulesAtom)
    if (!schedules) return null

    return schedules.filter((schedule) => 0 < schedule.programs.length)
  },
})
