import { useEffect } from "react"
import { useToasts } from "react-toast-notifications"
import { useRecoilState } from "recoil"
import { servicesAtom, programsAtom } from "../atoms/television"
import { SayaAPI } from "../infra/saya"

export const useTelevision = () => {
  const [services, setServices] = useRecoilState(servicesAtom)
  const [programs, setPrograms] = useRecoilState(programsAtom)

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
      .then((programs) => setPrograms(programs))
      .catch((e) => {
        console.error(e)
        toast.addToast("サービスの取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [])

  return { services, programs }
}
