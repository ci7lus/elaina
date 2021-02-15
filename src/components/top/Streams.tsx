import { Spinner } from "@chakra-ui/react"
import dayjs from "dayjs"
import React, { useState } from "react"
import { useEffect } from "react"
import { RefreshCw } from "react-feather"
import { useToasts } from "react-toast-notifications"
import { Link } from "rocon/react"
import { useBackend } from "../../hooks/backend"
import { useChannels } from "../../hooks/television"
import { channelsRoute } from "../../routes"
import { Stream } from "../../types/epgstation"

export const StreamsWidget: React.VFC<{}> = () => {
  const [loading, setLoading] = useState(true)
  const [streams, setStreams] = useState<Stream[] | null>(null)
  const backend = useBackend()
  const toast = useToasts()
  const reload = () => {
    setLoading(true)
    backend
      .getStreams()
      .then((streams) => {
        setStreams(streams)
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => reload(), [])
  const { channels } = useChannels()

  return (
    <div className="w-full rounded-md bg-gray-50">
      <div className="w-full px-2 py-1 border-b-2 border-yellow-300 flex items-center justify-between">
        <div>ストリーム一覧</div>
        <button
          type="button"
          className={`rounded-md bg-gray-100 hover:bg-gray-200 p-1 cursor-pointer transition-colors`}
          title="リロード"
          disabled={loading}
          onClick={reload}
        >
          <RefreshCw size={18} />
        </button>
      </div>
      {!streams || streams.length === 0 ? (
        <div className="w-full bg-gray-50 py-16 flex items-center justify-center rounded-md">
          {loading ? (
            <Spinner size="lg" color="gray.400" />
          ) : (
            <p className="text-gray-400 text-sm">
              {streams === null
                ? "読み込みに失敗しました"
                : "アクティブなストリームはありません"}
            </p>
          )}
        </div>
      ) : (
        <div>
          {streams.map((stream) => {
            const channel = channels?.find(
              (channel) => channel.id === stream.channelId
            )
            return (
              <div
                key={stream.streamId}
                className="p-2 border-b border-yellow-300 leading-relaxed"
              >
                <h2 className="truncate text-lg">
                  <span
                    className={`pr-2 ${
                      stream.isEnable ? "text-red-500" : "text-gray-600"
                    }`}
                    title={
                      stream.isEnable ? "有効なストリーム" : "無効なストリーム"
                    }
                  >
                    ●
                  </span>
                  {stream.name}
                </h2>
                <p className="truncate text-gray-600">
                  {`${dayjs(stream.startAt).format(
                    "YYYY/MM/DD HH:mm"
                  )} - ${dayjs(stream.endAt).format("HH:mm")} (${
                    (stream.endAt - stream.startAt) / 1000 / 60
                  }分間) / `}
                  {channel ? (
                    <Link
                      className="text-blue-400"
                      route={channelsRoute.anyRoute}
                      match={{ id: channel.id.toString() }}
                    >
                      {channel.name}
                    </Link>
                  ) : (
                    <span className="text-gray-600">不明</span>
                  )}
                </p>
                <h4 className="truncate text-gray-600">
                  {`${stream.type} - ストリーム: ${stream.streamId} - モード: ${stream.mode}`}
                </h4>
                <div className="flex items-center justify-end">
                  <button
                    disabled={loading}
                    type="button"
                    className="rounded-md bg-red-400 py-1 px-2 text-gray-100"
                    onClick={() => {
                      setLoading(true)
                      backend
                        .dropStream({ id: stream.streamId })
                        .then(() => {
                          toast.addToast("ストリームの削除に成功しました", {
                            appearance: "success",
                            autoDismiss: true,
                          })
                        })
                        .catch(() => {
                          toast.addToast("ストリームの削除に失敗しました", {
                            appearance: "error",
                            autoDismiss: true,
                          })
                        })
                        .finally(() => {
                          reload()
                        })
                    }}
                  >
                    停止
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
