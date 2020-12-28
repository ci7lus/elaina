import { useEffect } from "react"
import { useToasts } from "react-toast-notifications"
import { useRecoilState, useRecoilValue } from "recoil"
import {
  servicesAtom,
  programsAtom,
  filteredServicesSelector,
} from "../atoms/television"
import { SayaAPI } from "../infra/saya"

export const useTelevision = () => {
  const [services, setServices] = useRecoilState(servicesAtom)
  const [programs, setPrograms] = useRecoilState(programsAtom)
  const filteredServices = useRecoilValue(filteredServicesSelector)

  const toast = useToasts()

  useEffect(() => {
    SayaAPI.getServices()
      .then((services) => setServices(services))
      .catch((e) => {
        console.error(e)
        toast.addToast("サービスの取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
    SayaAPI.getPrograms()
      .then((programs) =>
        setPrograms(
          programs.filter((program) => 0 < program.name.trim().length)
        )
      )
      .catch((e) => {
        console.error(e)
        toast.addToast("サービスの取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [])

  return { services, programs, filteredServices }
}
