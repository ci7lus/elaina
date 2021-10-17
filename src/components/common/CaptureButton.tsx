import React, { useState } from "react"
import { Camera, MessageSquare } from "react-feather"
import { useToasts } from "react-toast-notifications"
import { capturePlayer } from "../../utils/capture"

export const CaptureButton: React.VFC<{ withComment: boolean }> = ({
  withComment,
}) => {
  const toast = useToasts()
  const [isCaptureNow, setIsCaptureNow] = useState(false)

  return (
    <button
      title={withComment ? "コメント付きでキャプチャする" : "キャプチャする"}
      className={`rounded-md ${
        isCaptureNow ? "bg-gray-200 cursor-not-allowed" : "bg-gray-100"
      } p-1 cursor-pointer`}
      disabled={isCaptureNow}
      onClick={async () => {
        try {
          setIsCaptureNow(true)
          const { canvas } = await capturePlayer({ withComment })
          const blob = await new Promise<Blob | null>((res) =>
            canvas.toBlob((blob) => res(blob), "image/png", 1)
          )
          if (!blob) return
          const item = new ClipboardItem({
            "image/png": new Promise((res) => res(blob)),
          })
          await navigator.clipboard.write([item])
          toast.addToast("キャプチャをクリップボードにコピーしました", {
            appearance: "success",
            autoDismiss: true,
          })
        } catch (error) {
          console.error(error)
          toast.addToast("キャプチャに失敗しました", {
            appearance: "error",
            autoDismiss: true,
          })
        } finally {
          setIsCaptureNow(false)
        }
      }}
    >
      {withComment ? <MessageSquare size={18} /> : <Camera size={18} />}
    </button>
  )
}
