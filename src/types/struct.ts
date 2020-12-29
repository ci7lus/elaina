export type Program = {
  id: string
  serviceId: number
  name: string
  startAt: number
  duration: number
  description: string
  flags: string[]
  genres: number[]
}

export type Service = {
  id: number
  name: string
  channel: string
  logoId: number
}

export type Channel = {
  type: "GR"
  group: string
  name: string
  services: number[]
}

export type CommentPayload = {
  channel: "jk5"
  no: number
  time: number
  author: string
  text: string
  color: string
  type: "right"
  commands: []
}
