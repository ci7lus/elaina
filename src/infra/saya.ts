import axios from "axios"
import type { SayaSetting } from "../types/setting"
import type { Service, Program, Genre, CommentStats } from "../types/struct"

export class SayaAPI {
  public url: string
  public user: string | null
  public pass: string | null
  constructor({ url, user, pass }: SayaSetting) {
    if (!url) throw new Error("Saya url is not provided")
    this.url = url
    this.user = user
    this.pass = pass
  }

  get wsUrl() {
    const sayaWS = new URL(
      this.url.startsWith("/")
        ? `http://${location.hostname}${this.url}`
        : this.url
    )
    sayaWS.protocol = "wss:"
    return sayaWS.href
  }
  get client() {
    return axios.create({
      baseURL: this.url,
      headers: {
        ...(this.isAuthorizationEnabled
          ? {
              Authorization: this.authorizationToken,
            }
          : {}),
      },
      timeout: 5000,
    })
  }

  getHlsUrl(id: number, preset: "1080p" | "720p" | "360p" = "1080p") {
    return `${this.url}/services/${id}/hls?preset=${preset}&subtitle=true`
  }
  getServiceCommentSocketUrl(id: number) {
    return `${this.wsUrl}/services/${id}/comments`
  }
  get isAuthorizationEnabled() {
    return !!(this.user && this.pass)
  }
  get authorizationToken() {
    return `Basic ${btoa(`${this.user}:${this.pass}`)}`
  }
  async getServices() {
    const { data } = await this.client.get<Service[]>("services")
    return data
  }
  async getPrograms() {
    const { data } = await this.client.get<Program[]>("programs")
    return data
  }
  async getGenres() {
    const { data } = await this.client.get<Genre[]>("genres")
    return data
  }
  async getCommentStatus(serviceId: number) {
    const { data } = await this.client.get<CommentStats>(
      `status/comments/${serviceId}`
    )
    return data
  }
}
