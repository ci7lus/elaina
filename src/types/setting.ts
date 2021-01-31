type UpstreamSetting = {
  url: string | null
  user: string | null
  pass: string | null
}

export type SayaSetting = UpstreamSetting

export type BackendSetting = SayaSetting

export type PlayerSetting = {
  commentDelay: number | null
}
