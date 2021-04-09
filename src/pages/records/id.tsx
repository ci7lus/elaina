import dayjs from "dayjs"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronsDown, RefreshCw } from "react-feather"
import { CommentPlayer } from "../../components/common/CommentPlayer"
import { Loading } from "../../components/global/Loading"
import { NotFound } from "../../components/global/NotFound"
import { CommentList } from "../../components/common/CommentList"
import { CommentPayload, ProgramRecord } from "../../types/struct"
import ReconnectingWebSocket from "reconnecting-websocket"
import { useDebounce, useUpdateEffect } from "react-use"
import { useSaya } from "../../hooks/saya"
import { AutoLinkedText } from "../../components/global/AutoLinkedText"
import { PlayerController } from "../../components/records/PlayerController"
import { useBackend } from "../../hooks/backend"
import { useChannels } from "../../hooks/television"
import { wait } from "../../utils/wait"
import { useRefState } from "../../hooks/util"
import { useToasts } from "react-toast-notifications"
import { CaptureButton } from "../../components/common/CaptureButton"
import { useRecoilValue } from "recoil"
import { playerSettingAtom } from "../../atoms/setting"

export const RecordIdPage: React.FC<{ id: string }> = ({ id }) => {
  const saya = useSaya()
  const backend = useBackend()
  const pid = parseInt(id)
  const toast = useToasts()
  const { channels } = useChannels()
  const [record, setRecord] = useState<ProgramRecord | null | false>(null)
  const channel = useMemo(
    () =>
      record &&
      channels &&
      channels.find((channel) => channel.id === record.channelId),
    [record]
  )

  const isMounting = useRef(true)

  useEffect(() => {
    backend
      .getRecord({ id: pid })
      .then((record) => setRecord(record))
      .catch((error) => {
        console.error(error)
        setRecord(false)
      })
    isMounting.current = true
    return () => {
      isMounting.current = false
    }
  }, [])

  const [currentStreamId, setCurrentStream, currentStreamRef] = useRefState(-1)
  const [hlsUrl, setHlsUrl] = useState<string | null>(null)
  useUpdateEffect(() => {
    setHlsUrl(backend.getHlsStreamUrl({ id: currentStreamId }))
  }, [currentStreamId])

  const playerSetting = useRecoilValue(playerSettingAtom)

  const [comments, setComments] = useState<CommentPayload[]>([])
  const [comment, setComment] = useState<CommentPayload | null>(null)

  useDebounce(
    () => {
      if (100 < comments.length) {
        setComments((comments) => comments.splice(comments.length - 100))
      }
    },
    50,
    [comments]
  )

  const [position, setPosition, positionRef] = useRefState(0)
  const socket = useRef<ReconnectingWebSocket | null>()

  const syncToPosition = () =>
    send({
      action: "Sync",
      seconds: Math.max(
        positionRef.current - (playerSetting.recordCommentDelay ?? 1),
        0
      ),
    })

  const [isLoading, setIsLoading, isLoadingRef] = useRefState(false)

  const claimRecordStream = useCallback(
    async (ss: number) => {
      if (!record || isLoadingRef.current) return
      setIsLoading(true)
      try {
        const streamId = await backend.startRecordHlsStream({
          id: record.videoFiles[0].id,
          ss,
        })
        while (isMounting.current) {
          const streams = await backend.getStreams()
          const stream = streams.find((stream) => stream.streamId === streamId)
          if (stream) {
            await backend.keepStream({ id: streamId })
            if (stream.isEnable === true) break
          }
          await wait(1000)
        }
        setCurrentStream(streamId)
        ;(async () => {
          while (isMounting.current) {
            await backend.keepStream({ id: streamId })
            if (streamId !== currentStreamRef.current) break
            await wait(1000)
          }
          await backend.dropStream({ id: streamId })
        })()
      } catch (error) {
        toast.addToast("番組ストリームの読み込みに失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
        return Promise.reject(error)
      } finally {
        setIsLoading(false)
      }
    },
    [record]
  )

  useUpdateEffect(() => {
    if (!record) return
    let s: ReconnectingWebSocket
    if (saya) {
      const wsUrl = saya.getRecordCommentSocketUrl({
        id: record.channelId,
        startAt: record.startAt / 1000,
        endAt: record.endAt / 1000,
      })

      let isFirst = true
      s = new ReconnectingWebSocket(wsUrl)
      s.reconnect()
      s.addEventListener("message", (e) => {
        const payload: CommentPayload = JSON.parse(e.data)
        setComment(payload)
        setComments((comments) => [...comments, payload])
      })
      s.addEventListener("open", () => {
        if (isFirst) {
          isFirst = false
          return
        }
        syncToPosition()
        send({ action: "Ready" })
      })
      socket.current = s
    }

    claimRecordStream(positionRef.current).then(() => {
      send({ action: "Ready" })
    })

    return () => {
      s?.close()
    }
  }, [record])

  const playerContainerRef = useRef<HTMLDivElement>(null)
  const [commentsHeight, setCommentsHeight] = useState(
    playerContainerRef.current?.clientHeight
  )
  useEffect(() => {
    const onResize = () => {
      setCommentsHeight(playerContainerRef.current?.clientHeight)
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [playerContainerRef.current])

  const send = (arg: Object) => {
    if (!socket.current) return
    socket.current.send(JSON.stringify(arg))
  }

  const [isPaused, setIsPaused] = useState(false)
  useEffect(() => {
    if (isPaused) {
      send({ action: "Pause" })
    } else {
      syncToPosition()
      send({ action: "Resume" })
    }
  }, [isPaused])

  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

  const seek = useCallback(
    async (s: number) => {
      if (!record || isLoadingRef.current) return
      try {
        setIsLoading(true)
        await claimRecordStream(s)
        setPosition(s)
      } catch (error) {
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    },
    [record]
  )

  if (record === false) return <NotFound />
  if (record === null || !channel) return <Loading />

  const duration = (record.endAt - record.startAt) / 1000

  return (
    <div className="md:container mx-auto md:mt-8 md:px-2">
      <div className="flex flex-col md:flex-row items-start justify-around">
        <div className="w-full md:w-2/3" ref={playerContainerRef}>
          <CommentPlayer
            hlsUrl={hlsUrl}
            comment={comment}
            isLive={false}
            isAutoPlay={true}
            isLoading={isLoading}
            onPositionChange={setPosition}
            onPauseChange={setIsPaused}
          />
          <PlayerController
            position={position}
            duration={duration}
            seek={seek}
            isSeeking={isLoading}
          />
        </div>
        <div
          className="bg-gray-50 w-full md:w-1/3 flex flex-col"
          style={{ height: commentsHeight }}
        >
          <div className="flex justify-start items-center w-full font-sm p-2 pr-4 border-b-2 border-blue-400 space-x-2">
            <CaptureButton withComment={true} />
            <CaptureButton withComment={false} />
            <button
              className="rounded-md bg-gray-100 hover:bg-gray-200 p-1 cursor-pointer"
              title="映像リロード"
              onClick={() => {
                seek(positionRef.current)
              }}
            >
              <RefreshCw size={18} />
            </button>
            <button
              className={`rounded-md ${
                isAutoScrollEnabled ? "bg-gray-200" : "bg-gray-100"
              } p-1 cursor-pointer`}
              title="コメントのオートスクロール切り替え"
              onClick={() => {
                setIsAutoScrollEnabled(
                  (isAutoScrollEnabled) => !isAutoScrollEnabled
                )
              }}
            >
              <ChevronsDown size={18} />
            </button>
            {/*<button className="rounded-md bg-blue-400 p-1 cursor-pointer">
            <Twitter fill="#FFF" strokeWidth="0" size={18} />
  </button>`*/}
          </div>
          <CommentList
            comments={comments}
            isAutoScrollEnabled={isAutoScrollEnabled}
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-start justify-around">
        <div className="w-full my-2 mb-4 px-2 md:px-0 md:mr-2">
          <div className="text-2xl">{record.name}</div>
          <div className="text-xl mt-1">
            {`${dayjs(record.startAt).format("YYYY/MM/DD HH:mm")} - ${dayjs(
              record.endAt
            ).format("HH:mm")} (${duration / 60}分間) / ${channel.name}`}
          </div>
          <div className="bg-gray-200 whitespace-pre-wrap rounded-md p-4 md:my-2 text-sm leading-relaxed programDescription">
            <AutoLinkedText>
              {[record.description, record.extended]
                .filter((s) => !!s)
                .join("\n\n")}
            </AutoLinkedText>
          </div>
        </div>
      </div>
    </div>
  )
}
