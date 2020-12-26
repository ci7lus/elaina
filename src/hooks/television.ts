import { useEffect } from "react"
import { useRecoilState } from "recoil"
import { servicesAtom, programsAtom } from "../atoms/television"
import { SayaAPI } from "../infra/saya"

export const useTelevision = () => {
  const [services, setServices] = useRecoilState(servicesAtom)
  const [programs, setPrograms] = useRecoilState(programsAtom)

  useEffect(() => {
    SayaAPI.getServices().then((services) => setServices(services))
    SayaAPI.getPrograms().then((programs) => setPrograms(programs))
  }, [])

  return { services, programs }
}
