import { useEffect } from "react"
import { useToasts } from "react-toast-notifications"
import { useRecoilState, useRecoilValue } from "recoil"
import {
  servicesAtom,
  programsAtom,
  filteredServicesSelector,
  genresAtom,
} from "../atoms/television"
import { useSaya } from "./saya"

export const useTelevision = () => {
  const [services, setServices] = useRecoilState(servicesAtom)
  const [programs, setPrograms] = useRecoilState(programsAtom)
  const filteredServices = useRecoilValue(filteredServicesSelector)

  const toast = useToasts()

  const saya = useSaya()

  useEffect(() => {
    saya
      .getServices()
      .then((services) => setServices(services))
      .catch((e) => {
        console.error(e)
        toast.addToast("サービスの取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
    saya
      .getPrograms()
      .then((programs) =>
        setPrograms(
          programs.filter((program) => 0 < program.name.trim().length)
        )
      )
      .catch((e) => {
        console.error(e)
        toast.addToast("番組の取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [])

  return { services, programs, filteredServices }
}

export const useGenres = () => {
  const [genres, setGenres] = useRecoilState(genresAtom)

  const toast = useToasts()

  const saya = useSaya()

  useEffect(() => {
    if (genres) return
    saya
      .getGenres()
      .then((genres) => setGenres(genres))
      .catch((e) => {
        console.error(e)
        toast.addToast("ジャンルの取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [])

  return { genres }
}
