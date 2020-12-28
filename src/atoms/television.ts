import { atom, selector } from "recoil"
import { Program, Service } from "../types/struct"

export const servicesAtom = atom<Service[] | null>({
  key: "services",
  default: null,
})

export const filteredServicesSelector = selector<Service[] | null>({
  key: "filtered-servicws",
  get: ({ get }) => {
    const services = get(servicesAtom)
    const programs = get(programsAtom)
    if (!services || !programs) return null

    return services.filter(
      (service) =>
        0 <
        programs.filter((program) => program.serviceId === service.id).length
    )
  },
})

export const programsAtom = atom<Program[] | null>({
  key: "programs",
  default: null,
})
