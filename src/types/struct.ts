export type Program = {
  id: string
  category: "news" | "anime"
  title: string
  fullTitle: string
  start: number
  end: number
  seconds: number
  detail: string
}

export type Channel = {
  channel: string
  name: string
  id: string
  sid: number
  nid: number
  hasLogoData: boolean
  programs: Program[]
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
