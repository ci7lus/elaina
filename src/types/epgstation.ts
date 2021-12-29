export type Stream = {
  streamId: number
  type: "LiveHLS" | "RecordedHLS"
  mode: number
  isEnable: boolean
  channelId: number
  name: string
  startAt: number
  endAt: number
}

export type ApiDocs = {
  components: { schemas: { ChannelType: { enum: string[] } } }
}

export type Config = {
  broadcast: { [key: string]: boolean }
}
