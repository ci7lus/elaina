export type Program = {
  id: string
  serviceId: number
  name: string
  startAt: number
  endAt: number
  duration: number
  description: string
  flags: string[]
  genres: string[]
}

export type Service = {
  channel: {
    type: "GR"
    group: string
    name: string
    services: number[]
  }
  id: number
  name: string
  serviceId: number
  logoId: number
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
