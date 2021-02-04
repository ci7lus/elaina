import axios from "axios"
import type { BackendSetting } from "../types/setting"
import type {
  Genre,
  ProgramRecord,
  Channel,
  Schedule,
  Program,
} from "../types/struct"
import querystring from "querystring"
import dayjs from "dayjs"
import { Stream } from "../types/epgstation"

export class EPGStationAPI {
  public url: string
  public user: string | null
  public pass: string | null
  constructor({ url, user, pass }: BackendSetting) {
    if (!url) throw new Error("EPGStation url is not provided")
    this.url = url.endsWith("/") ? url.substr(0, url.length - 1) : url
    this.user = user
    this.pass = pass
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

  async startChannelHlsStream({ id, mode = 0 }: { id: number; mode?: number }) {
    const { data } = await this.client.get<{ streamId: number }>(
      `${this.url}/api/streams/live/${id}/hls?${querystring.stringify({
        mode,
      })}`
    )
    return data.streamId
  }
  async getStreams() {
    const { data } = await this.client.get<{ items: Stream[] }>("api/streams", {
      params: {
        isHalfWidth: true,
      },
    })
    return data.items
  }
  async keepStream({ id }: { id: number }) {
    await this.client.put(`api/streams/${id}/keep`, {})
  }
  async dropStream({ id }: { id: number }) {
    await this.client.delete(`api/streams/${id}`)
  }
  getHlsStreamUrl({ id }: { id: number }) {
    return `${this.url}/streamfiles/stream${id}.m3u8`
  }
  async startRecordHlsStream({
    id,
    ss = 0,
    mode = 0,
  }: {
    id: number
    ss?: number
    mode?: number
  }) {
    const { data } = await this.client.get<{ streamId: number }>(
      `${this.url}/api/streams/recorded/${id}/hls?${querystring.stringify({
        mode,
        ss,
      })}`
    )
    return data.streamId
  }
  get isAuthorizationEnabled() {
    return !!(this.user && this.pass)
  }
  get authorizationToken() {
    return `Basic ${btoa(`${this.user}:${this.pass}`)}`
  }
  async getChannels() {
    const { data } = await this.client.get<Channel[]>("api/channels")
    return data.map((channel) => ({
      ...channel,
      name: channel.halfWidthName.trim() ? channel.halfWidthName : channel.name,
    }))
  }
  async getProgram({ id }: { id: number }) {
    const { data } = await this.client.get<Program>(
      `api/schedules/detail/${id}`,
      {
        params: {
          isHalfWidth: true,
        },
      }
    )
    return data
  }
  async getSchedules({
    startAt = dayjs().toDate().getTime(),
    endAt = dayjs().add(1, "day").toDate().getTime(),
    GR = true,
    BS = true,
    CS = true,
    SKY = true,
  }: {
    startAt?: number
    endAt?: number
    GR?: boolean
    BS?: boolean
    CS?: boolean
    SKY?: boolean
  }) {
    const { data } = await this.client.get<Schedule[]>("api/schedules", {
      params: {
        isHalfWidth: true,
        startAt,
        endAt,
        GR,
        BS,
        CS,
        SKY,
      },
    })
    return data
  }
  async getChannelSchedules({
    channelId,
    startAt = dayjs().toDate().getTime(),
    days,
  }: {
    channelId: number
    startAt?: number
    days: number
  }) {
    const { data } = await this.client.get<[Schedule]>(
      `api/schedules/${channelId}`,
      {
        params: {
          isHalfWidth: true,
          startAt,
          days,
        },
      }
    )
    return data[0]
  }
  async getRecords({
    offset = 0,
    limit = 24,
    isReverse,
    ruleId,
    channelId,
    genre,
    keyword,
    hasOriginalFile,
  }: {
    offset?: number
    limit?: number
    isReverse?: boolean
    ruleId?: number
    channelId?: number
    genre?: number
    keyword?: string
    hasOriginalFile?: boolean
  }) {
    const { data } = await this.client.get<{
      records: ProgramRecord[]
      total: number
    }>("api/recorded", {
      params: {
        isHalfWidth: true,
        offset,
        limit,
        isReverse,
        ruleId,
        channelId,
        genre,
        keyword,
        hasOriginalFile,
      },
    })
    return data
  }
  async getRecord({ id }: { id: number }) {
    const { data } = await this.client.get<ProgramRecord>(
      `api/recorded/${id}`,
      {
        params: { isHalfWidth: true },
      }
    )
    return data
  }
}
