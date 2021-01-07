export type Program = {
  id: number
  service: Service
  name: string
  startAt: number
  duration: number
  description: string
  flags: string[]
  genres: number[]
  episode?: {
    number: number | null
    title: string
  }
  video: {
    component: number
    content: number
    resolution: string
    type: string
  }
  audio: {
    component: 2
    samplingRate: number
  }
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

export type Genre = {
  id: number
  main: string
  sub: string
  count: number
}

export type CommentStats = {
  nico?: {
    source: string
    comments: number
    commentsPerMinute: number
    viewers: number
    adPoints: number
    giftPoints: number
  }
  twitter: { source: string; comments: number; commentsPerMinute: number }[]
}
