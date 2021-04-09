export type Program = {
  id: number
  channelId: number
  startAt: number
  endAt: number
  isFree: boolean
  name: string
  description?: string
  extended?: string
  genre1: number
  subGenre1: number
  genre2: number
  subGenre2: number
  genre3: number
  subGenre3: number
  videoType: "mpeg2"
  videoResolution: string
  videoStreamContent: number
  videoComponentType: number
  audioSamplingRate: number
  audioComponentType: number
}

export type ProgramRecord = {
  id: number
  ruleId: number
  programId: number
  channelId: number
  startAt: number
  endAt: number
  name: string
  description?: string
  extended?: string
  genre1: number
  subGenre1: number
  genre2: number
  subGenre2: number
  genre3: number
  subGenre3: number
  videoType: "mpeg2"
  videoResolution: string
  videoStreamContent: number
  videoComponentType: number
  audioSamplingRate: number
  audioComponentType: number
  isRecording: boolean
  thumbnails: [number]
  videoFiles: {
    id: number
    name: string
    type: "ts"
    size: number
  }[]
  dropLog: {
    id: number
    errorCnt: number
    dropCnt: number
    scramblingCnt: number
  }
  tags: {
    id: number
    name: string
    color: string
  }[]
  isEncoding: boolean
  isProtected: boolean
}

export type ChannelType = "GR" | "BS" | "SKY"

export type Channel = {
  id: number
  serviceId: number
  networkId: number
  name: string
  halfWidthName: string
  hasLogoData: boolean
  channelType: ChannelType
  channel: string
}

export type Schedule = {
  channel: Channel
  programs: Program[]
}

export type CommentPayload = {
  sourceUrl: string | null
  source: string
  no: number
  time: number
  timeMs: number
  author: string
  text: string
  color: string
  type: "right"
  commands: []
}

export type Genre = {
  id: number
  main: string
  sub: string
  count: number
}
