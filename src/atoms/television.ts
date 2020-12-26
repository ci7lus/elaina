import { atom } from "recoil"
import { Program, Service } from "../types/struct"

export const servicesAtom = atom<Service[] | null>({
  key: "services",
  default: null,
})

export const programsAtom = atom<Program[] | null>({
  key: "programs",
  default: null,
})
