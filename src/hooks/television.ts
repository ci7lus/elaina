import dayjs from "dayjs"
import { useEffect, useState } from "react"
import { useToasts } from "react-toast-notifications"
import { useRecoilState, useRecoilValue } from "recoil"
import {
  configAtom,
  channelsAtom,
  filteredSchedulesSelector,
  schedulesAtom,
} from "../atoms/television"
import { Program } from "../types/struct"
import { useBackend } from "./backend"

export const useChannels = () => {
  const [channels, setChannels] = useRecoilState(channelsAtom)
  const toast = useToasts()
  const backend = useBackend()

  useEffect(() => {
    backend
      .getChannels()
      .then((schedules) => setChannels(schedules))
      .catch((e) => {
        console.error(e)
        toast.addToast("番組表の取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [])

  return { channels }
}

export const useProgram = ({ id }: { id: number }) => {
  const [program, setProgram] = useState<Program | null | false>(null)
  const backend = useBackend()

  useEffect(() => {
    backend
      .getProgram({ id })
      .then((program) => setProgram(program))
      .catch(() => setProgram(false))
  }, [])

  return { program }
}

export const useSchedules = ({ startAt }: { startAt?: number }) => {
  const [schedules, setSchedules] = useRecoilState(schedulesAtom)
  const filteredSchedules = useRecoilValue(filteredSchedulesSelector)
  const config = useRecoilValue(configAtom)

  const toast = useToasts()
  const backend = useBackend()

  useEffect(() => {
    if (!config) return
    const endAt = startAt && dayjs(startAt).add(1, "day").toDate().getTime()

    backend
      .getSchedules({
        startAt,
        endAt,
        types: config.broadcast,
      })
      .then((schedules) => setSchedules(schedules))
      .catch((e) => {
        console.error(e)
        toast.addToast("番組表の取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [startAt, config])

  return { schedules, filteredSchedules }
}
