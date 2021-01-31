import dayjs from "dayjs"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronsDown, RefreshCw } from "react-feather"
import { CommentPlayer } from "../../components/common/CommentPlayer"
import { Loading } from "../../components/global/Loading"
import { NotFound } from "../../components/global/NotFound"
import { CommentList } from "../../components/services/CommentList"
import { CommentPayload, ProgramRecord } from "../../types/struct"
import ReconnectingWebSocket from "reconnecting-websocket"
import { useDebounce, useUpdateEffect } from "react-use"
import { Skeleton } from "@chakra-ui/react"
import { useSaya } from "../../hooks/saya"
import { AutoLinkedText } from "../../components/global/AutoLinkedText"
import { PlayerController } from "../../components/records/PlayerController"
import { useBackend } from "../../hooks/backend"
import { useChannels } from "../../hooks/television"
import { wait } from "../../utils/wait"
import { useRefState } from "../../hooks/util"
import { useToasts } from "react-toast-notifications"

export const RecordIdPage: React.FC<{ id: string }> = ({ id }) => {
  const saya = useSaya()
  const backend = useBackend()
  const pid = parseInt(id)
  const toast = useToasts()
  const { channels } = useChannels()
  const [record, setRecord] = useState<ProgramRecord | null | false>(null)
  const service = useMemo(
    () =>
      record &&
      channels &&
      channels.find((channel) => channel.id === record.channelId),
    [record]
  )

  const programStart = record && dayjs(record.startAt)
  const programEnd = record && dayjs(record.endAt)
  const duration = record && (record.endAt - record.startAt) / 1000
  const programDurationInMinutes = duration && duration / 60

  const isMounting = useRef(true)

  useEffect(() => {
    backend
      .getRecord({ id: pid })
      .then((record) => setRecord(record))
      .catch((error) => {
        console.error(error)
        setRecord(false)
      })
    return () => {
      isMounting.current = false
    }
  }, [])

  const [currentStreamId, setCurrentStream, currentStreamRef] = useRefState(-1)
  const [hlsUrl, setHlsUrl] = useState(backend.getHlsStreamUrl({ id: -1 }))
  useUpdateEffect(() => {
    setHlsUrl(backend.getHlsStreamUrl({ id: currentStreamId }))
  }, [currentStreamId])

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

  const [position, setPosition] = useState(0)
  const socket = useRef<ReconnectingWebSocket | null>()

  const syncToPosition = useCallback(() => {
    if (!socket.current) return
    socket.current.send(JSON.stringify({ action: "Sync", seconds: position }))
    console.log("sync to", position)
  }, [socket.current, position])

  const claimRecordStream = async (record: ProgramRecord, ss: number) => {
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
        await wait(1000 * 5)
      }
      await backend.dropStream({ id: streamId })
    })()
  }

  const isSeeking = useRef(false)

  useUpdateEffect(() => {
    if (!record) return
    const wsUrl = saya.getRecordCommentSocketUrl({
      id: record.channelId,
      startAt: record.startAt / 1000,
      endAt: record.endAt / 1000,
    })
    let s: null | ReconnectingWebSocket = null

    isSeeking.current = true
    claimRecordStream(record, position)
      .then(() => {
        const _s = new ReconnectingWebSocket(wsUrl)
        _s.reconnect()
        _s.addEventListener("message", (e) => {
          const payload: CommentPayload = JSON.parse(e.data)
          setComment(payload)
          setComments((comments) => [...comments, payload])
        })
        _s.addEventListener("open", () => {
          syncToPosition()
          setComments([])
        })
        s = _s
        socket.current = _s
      })
      .catch(() => {
        toast.addToast("番組ストリームの読み込みに失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
      .finally(() => {
        isSeeking.current = false
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

  const [isPaused, setIsPaused] = useState(false)
  useEffect(() => {
    if (isPaused === false) {
      syncToPosition()
    }
  }, [isPaused])

  const [reloadRequest, setReloadRequest] = useState(0)

  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

  const seek = useCallback(
    async (s: number) => {
      if (!record || isSeeking.current) return
      try {
        isSeeking.current = true
        await claimRecordStream(record, s)
        setPosition(s)
      } catch (error) {
        console.error(error)
      } finally {
        isSeeking.current = false
      }
    },
    [record, isSeeking.current]
  )

  if (record === false) return <NotFound />
  if (
    record === null ||
    !programDurationInMinutes ||
    !programStart ||
    !programEnd ||
    !duration
  )
    return <Loading />

  return (
    <div className="md:container mx-auto md:mt-8 md:px-2">
      <div className="flex flex-col md:flex-row items-start justify-around">
        <div className="w-full md:w-2/3" ref={playerContainerRef}>
          <CommentPlayer
            hlsUrl={hlsUrl}
            comment={comment}
            isLive={false}
            isAutoPlay={true}
            onPositionChange={setPosition}
            onPauseChange={setIsPaused}
            reloadRequest={reloadRequest}
          />
          <PlayerController
            position={position}
            duration={duration}
            seek={seek}
          />
        </div>
        <div
          className="bg-gray-50 w-full md:w-1/3 flex flex-col"
          style={{ height: commentsHeight }}
        >
          <div className="flex justify-start items-center w-full font-sm p-2 pr-4 border-b-2 border-blue-400 space-x-2">
            <button
              className="rounded-md bg-gray-100 hover:bg-gray-200 p-1 cursor-pointer"
              title="映像リロード"
              onClick={() => {
                setReloadRequest(new Date().getTime())
                if (socket.current) {
                  syncToPosition()
                  setComments([])
                }
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
            {/*`<button className="rounded-md bg-gray-200 p-1 cursor-pointer">
            <Camera size={18} />
          </button>
          <button className="rounded-md bg-blue-400 p-1 cursor-pointer">
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
          <div className="text-2xl">
            <Skeleton isLoaded={!!record}>
              {record ? record.name : "."}
            </Skeleton>
          </div>
          <div className="text-xl mt-1">
            <Skeleton isLoaded={!!(record && service)}>
              {record && service
                ? `${programStart.format(
                    "YYYY/MM/DD HH:mm"
                  )} - ${programEnd.format(
                    "HH:mm"
                  )} (${programDurationInMinutes}分間) / ${service.name}`
                : "."}
            </Skeleton>
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
