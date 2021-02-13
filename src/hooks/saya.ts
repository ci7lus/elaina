import { useEffect } from "react"
import { useState } from "react"
import { useToasts } from "react-toast-notifications"
import { useRecoilValue } from "recoil"
import { sayaSettingAtom } from "../atoms/setting"
import { SayaAPI } from "../infra/saya"
import { ChannelComment } from "../types/saya"
import { useNow } from "./date"

export const useSaya = () => {
  const sayaSetting = useRecoilValue(sayaSettingAtom)
  return new SayaAPI(sayaSetting)
}

export const useChannelComments = () => {
  const saya = useSaya()
  const toast = useToasts()
  const [channelComments, setChannelComments] = useState<
    ChannelComment[] | null
  >(null)
  const now = useNow()

  useEffect(() => {
    saya
      .getChannelComments()
      .then((comments) => setChannelComments(comments))
      .catch(() => {
        toast.addToast("チャンネル勢い情報の取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [now])

  return { channelComments }
}
