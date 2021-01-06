import { Spinner } from "@chakra-ui/react"
import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { RefreshCw } from "react-feather"
import { useNow } from "../../hooks/date"
import { useSaya } from "../../hooks/saya"
import { CommentStats } from "../../types/struct"

export const StatsWidget: React.VFC<{
  serviceId: number
  socket: React.MutableRefObject<unknown>
}> = ({ serviceId, socket }) => {
  const saya = useSaya()
  const [updated, setUpdated] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<CommentStats | null>(null)
  const reload = () => {
    setLoading(true)
    saya
      .getCommentStatus(serviceId)
      .then((stats) => {
        setStats(stats)
        setUpdated(dayjs().format("HH:mm:ss"))
      })
      .finally(() => setLoading(false))
  }
  const now = useNow()
  useEffect(() => {
    reload()
  }, [socket.current, now])

  return (
    <div className="w-full rounded-md bg-gray-50">
      <div className="w-full px-2 py-1 border-b-2 border-indigo-400 flex items-center justify-between">
        <div>コメントソース{updated && ` (${updated})`}</div>
        <button
          className={`rounded-md bg-gray-100 hover:bg-gray-200 p-1 cursor-pointer transition-colors`}
          title="データリロード"
          disabled={loading}
          onClick={reload}
        >
          <RefreshCw size={18} />
        </button>
      </div>
      {stats === null ? (
        <div className="w-full bg-gray-50 py-8 flex items-center justify-center">
          {loading ? (
            <Spinner size="lg" color="gray.400" />
          ) : (
            <p className="text-gray-400 text-sm">読み込みに失敗しました</p>
          )}
        </div>
      ) : (
        <div className="p-2">
          {stats.nico ? (
            <div className="flex space-x-2 px-2">
              <div className="flex items-center justify-center">
                <a
                  className="text-blue-400 hover:text-blue-600 hover:underline"
                  href={`https://live.nicovideo.jp/watch/${stats.nico.source}`}
                  target="_blank"
                >
                  {stats.nico.source}
                </a>
              </div>
              <div className="w-full text-right leading-relaxed">
                <div>来場{stats.nico.viewers.toLocaleString()}人</div>
                <div>{stats.nico.comments.toLocaleString()}コメント</div>
                <div>
                  {stats.nico.commentsPerMinute.toLocaleString()}コメント/分
                </div>
                {0 < stats.nico.adPoints && (
                  <div>{stats.nico.adPoints.toLocaleString()}広告pt</div>
                )}
                {0 < stats.nico.giftPoints && (
                  <div>{stats.nico.giftPoints.toLocaleString()}ギフトpt</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8 text-gray-600">
              対象の生放送がありません
            </div>
          )}
          {stats.twitter.map((twitter, idx) => (
            <div key={idx} className="flex space-x-2 px-2">
              <div className="w-1/2 flex items-center">
                <a
                  className="text-blue-400 hover:text-blue-600 hover:underline"
                  href={`https://twitter.com/hashtag/${encodeURIComponent(
                    twitter.source.replace("#", "")
                  )}`}
                  target="_blank"
                >
                  {twitter.source}
                </a>
              </div>
              <div className="w-1/2 text-right">
                <div>{twitter.comments.toLocaleString()}コメント</div>
                <div>
                  {twitter.commentsPerMinute.toLocaleString()}コメント/分
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
