import type { AxiosInstance } from "axios"
import axios from "axios"
import { sayaUrl, sayaAuthUser, sayaAuthPass, sayaWSUrl } from "../config"
import { Service, Program } from "../types/struct"

export const SayaAPI = {
  getHlsUrl: (id: number, preset: "1080p" | "720p" | "360p" = "1080p") => {
    return `${sayaUrl}/services/${id}/hls?preset=${preset}&subtitle=true`
  },
  getCommentSocketUrl: (id: number) => {
    return `${sayaWSUrl}/comments/${id}/stream`
  },
  get isAuthorizationEnabled() {
    return !!(sayaAuthUser && sayaAuthPass)
  },
  get authorizationToken() {
    return `Basic ${btoa(`${sayaAuthUser}:${sayaAuthPass}`)}`
  },
  async getServices() {
    const { data } = await client.get<Service[]>("services")
    return data
  },
  async getPrograms() {
    const { data } = await client.get<Program[]>("programs")
    return data
  },
}

const client = axios.create({
  baseURL: sayaUrl,
  headers: {
    ...(SayaAPI.isAuthorizationEnabled
      ? {
          Authorization: SayaAPI.authorizationToken,
        }
      : {}),
  },
  timeout: 5000,
}) as AxiosInstance
