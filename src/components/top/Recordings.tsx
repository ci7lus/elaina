import { Progress, Spinner } from "@chakra-ui/react"
import dayjs from "dayjs"
import React, { useState } from "react"
import { useEffect } from "react"
import { RefreshCw } from "react-feather"
import { useToasts } from "react-toast-notifications"
import { Link, useNavigate } from "rocon/react"
import { useBackend } from "../../hooks/backend"
import { useNow } from "../../hooks/date"
import { useChannels } from "../../hooks/television"
import { channelsRoute, programsRoute } from "../../routes"
import { ProgramRecord } from "../../types/struct"

export const RecordingsWidget: React.VFC<{}> = () => {
  const [loading, setLoading] = useState(true)
  const [recordings, setRecordings] = useState<ProgramRecord[] | null>(null)
  const backend = useBackend()
  const toast = useToasts()
  const reload = () => {
    setLoading(true)
    backend
      .getRecordings({})
      .then((recordings) => {
        setRecordings(recordings)
      })
      .finally(() => setLoading(false))
  }
  useEffect(() => reload(), [])
  const now = useNow()
  const { channels } = useChannels()
  const navigate = useNavigate()

  return (
    <div className="w-full rounded-md bg-gray-50">
      <div className="w-full px-2 py-1 border-b-2 border-red-300 flex items-center justify-between">
        <div>録画中</div>
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
      {!recordings || recordings.length === 0 ? (
        <div className="w-full bg-gray-50 py-16 flex items-center justify-center rounded-md">
          {loading ? (
            <Spinner size="lg" color="gray.400" />
          ) : (
            <p className="text-gray-400 text-sm">
              {recordings === null
                ? "読み込みに失敗しました"
                : "録画中の番組はありません"}
            </p>
          )}
        </div>
      ) : (
        <div>
          {recordings.map((recording) => {
            const channel = channels?.find(
              (channel) => channel.id === recording.channelId
            )
            const duration = (recording.endAt - recording.startAt) / 1000 / 60
            const diff = now.diff(recording.startAt, "minute")
            return (
              <Link
                key={recording.id}
                route={programsRoute.anyRoute}
                match={{ id: recording.programId.toString() }}
              >
                <div className="p-2 border-b border-red-300 leading-relaxed">
                  <h2 className="truncate text-lg">
                    <span
                      className={`pr-2 ${
                        recording.isRecording ? "text-red-500" : "text-gray-600"
                      }`}
                      title={
                        recording.isRecording ? "録画中" : "録画中ではない"
                      }
                    >
                      ●
                    </span>
                    {recording.name}
                  </h2>
                  <p className="truncate text-gray-600">
                    {`${dayjs(recording.startAt).format("HH:mm")} [${Math.abs(
                      diff
                    )}分前] - ${dayjs(recording.endAt).format(
                      "HH:mm"
                    )} (${duration}分間) / `}
                    {channel ? (
                      <button
                        className="text-blue-400"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          navigate(channelsRoute.anyRoute, {
                            id: channel.id.toString(),
                          })
                        }}
                      >
                        {channel.name}
                      </button>
                    ) : (
                      <span className="text-gray-600">不明</span>
                    )}
                  </p>
                  <p className="truncate text-sm">{recording.description}</p>
                  <Progress
                    value={Math.floor((diff / duration) * 100)}
                    size="xs"
                    my={2}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
