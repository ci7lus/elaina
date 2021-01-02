import { atom, selector } from "recoil"
import { Genre, Program, Service } from "../types/struct"

const prefix = "elaina:television"

export const servicesAtom = atom<Service[] | null>({
  key: `${prefix}:services`,
  default: null,
})

export const filteredServicesSelector = selector<Service[] | null>({
  key: `${prefix}:filtered-services`,
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
  key: `${prefix}:programs`,
  default: null,
})

export const genresAtom = atom<Genre[] | null>({
  key: `${prefix}:genres`,
  default: null,
})
