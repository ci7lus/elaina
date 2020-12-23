import type { AxiosInstance } from "axios"
import axios from "redaxios"
import { sayaUrl, sayaAuthUser, sayaAuthPass, sayaWSUrl } from "../config"

export const SayaAPI = {
  getHlsUrl: (
    channelServiceId: number,
    preset: "1080p" | "720p" | "360p" = "1080p"
  ) => {
    return `${sayaUrl}/services/${channelServiceId}/hls?preset=${preset}`
  },
  getCommentSocketUrl: (channelServiceId: number) => {
    return `${sayaWSUrl}/comments/${channelServiceId}/stream`
  },
  get isAuthorizationEnabled() {
    return !!(sayaAuthUser && sayaAuthPass)
  },
  get authorizationToken() {
    return `Basic ${btoa(`${sayaAuthUser}:${sayaAuthPass}`)}`
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
}) as AxiosInstance
