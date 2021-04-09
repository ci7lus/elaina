import { ChannelType } from "./struct"

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

export type ChannelComment = {
  channel: {
    name: string
    type: ChannelType
    serviceIds: number[]
    nicojkId: number
    hasOfficialNicolive: boolean
    nicoliveTags: string[]
    nicoliveCommunityIds: string[]
    miyoutvId: string
    twitterKeywords: string[]
    boardId: string
    threadKeywords: string[]
  }
  service: {
    id: number
    name: string
    logoId: number | null
    keyId: number
    channel: string
    type: ChannelType
  } | null
  force: number
  last: string
}
