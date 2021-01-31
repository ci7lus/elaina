import { useEffect, useState } from "react"
import { useToasts } from "react-toast-notifications"
import { useRecoilState, useRecoilValue } from "recoil"
import {
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

export const useSchedules = () => {
  const [schedules, setSchedules] = useRecoilState(schedulesAtom)
  const filteredSchedules = useRecoilValue(filteredSchedulesSelector)

  const toast = useToasts()
  const backend = useBackend()

  useEffect(() => {
    backend
      .getSchedules({})
      .then((schedules) => setSchedules(schedules))
      .catch((e) => {
        console.error(e)
        toast.addToast("番組表の取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [])

  return { schedules, filteredSchedules }
}
