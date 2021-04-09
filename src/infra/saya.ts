import axios from "axios"
import type { SayaSetting } from "../types/setting"
import querystring from "querystring"
import type { ChannelComment, CommentStats } from "../types/saya"
import { ChannelType } from "../types/struct"

export class SayaAPI {
  public url: string
  public user: string | null
  public pass: string | null
  constructor({ url, user, pass }: SayaSetting) {
    if (!url) throw new Error("Saya url is not provided")
    this.url = url.endsWith("/") ? url.substr(0, url.length - 1) : url
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
      timeout: 1000 * 30,
    })
  }

  getLiveCommentSocketUrl({
    channelType,
    serviceId,
  }: {
    channelType: ChannelType
    serviceId: number
  }) {
    return `${this.wsUrl}/comments/${channelType}_${serviceId}/live`
  }
  getRecordCommentSocketUrl({
    channelType,
    serviceId,
    startAt,
    endAt,
  }: {
    channelType: ChannelType
    serviceId: number
    startAt: number
    endAt: number
  }) {
    return `${
      this.wsUrl
    }/comments/${channelType}_${serviceId}/timeshift?${querystring.stringify({
      startAt,
      endAt,
    })}`
  }
  get isAuthorizationEnabled() {
    return !!(this.user && this.pass)
  }
  get authorizationToken() {
    return `Basic ${btoa(`${this.user}:${this.pass}`)}`
  }
  async getCommentStatus(serviceId: number) {
    const { data } = await this.client.get<CommentStats>(
      `status/comments/${serviceId}`
    )
    return data
  }
  async getChannelComments() {
    const { data } = await this.client.get<ChannelComment[]>("comments")
    return data
  }
  async getChannelComment({
    channelType,
    serviceId,
  }: {
    channelType: ChannelType
    serviceId: number
  }) {
    const { data } = await this.client.get<ChannelComment>(
      `comments/${channelType}_${serviceId}/info`
    )
    return data
  }
}
