import dayjs from "dayjs"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { ChevronsDown, ChevronsRight, RefreshCw } from "react-feather"
import { CommentPlayer } from "../../components/common/CommentPlayer"
import { Loading } from "../../components/global/Loading"
import { NotFound } from "../../components/global/NotFound"
import { CommentList } from "../../components/services/CommentList"
import { CommentPayload, Program, Schedule } from "../../types/struct"
import ReconnectingWebSocket from "reconnecting-websocket"
import { useDebounce } from "react-use"
import { Skeleton } from "@chakra-ui/react"
import { useRecoilValue } from "recoil"
import { playerSettingAtom } from "../../atoms/setting"
import { useSaya } from "../../hooks/saya"
import { StatsWidget } from "../../components/services/StatsWidget"
import { useNow } from "../../hooks/date"
import { AutoLinkedText } from "../../components/global/AutoLinkedText"
import { useBackend } from "../../hooks/backend"
import { wait } from "../../utils/wait"

export const ServiceIdPage: React.FC<{ id: string }> = ({ id }) => {
  const saya = useSaya()
  const backend = useBackend()
  const sid = parseInt(id)
  const [schedule, setSchedule] = useState<Schedule | null | false>(null)

  const [hlsUrl, setHlsUrl] = useState(backend.getHlsStreamUrl({ id: -1 }))

  useEffect(() => {
    backend
      .getChannelSchedules({ channelId: sid, days: 1 })
      .then((schedule) => setSchedule(schedule))
      .catch(() => setSchedule(false))
  }, [])

  const now = useNow()
  const [onGoingProgram, setOnGoingProgram] = useState<Program | null>(null)
  const [nextProgram, setNextProgram] = useState<Program | null>(null)
  const onGoingProgramStart =
    onGoingProgram && dayjs(onGoingProgram.startAt).format("HH:mm")
  const onGoingProgramEnd =
    onGoingProgram && dayjs(onGoingProgram.endAt).format("HH:mm")
  const onGoingProgramDurationInMinutes =
    onGoingProgram &&
    (onGoingProgram.endAt - onGoingProgram.startAt) / 1000 / 60
  const onGoingProgramDiff =
    onGoingProgram && dayjs(onGoingProgram.startAt).diff(now, "minute")

  useEffect(() => {
    if (!schedule) return
    const futurePrograms = schedule.programs
      .filter((p) => p.startAt && dayjs(p.endAt).isAfter(now))
      .sort((a, b) => (b.startAt < a.startAt ? 1 : -1))
    setOnGoingProgram(futurePrograms.shift() || null)

    setNextProgram(futurePrograms.shift() || null)
  }, [schedule, now])

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

  const socket = useRef<ReconnectingWebSocket | null>()

  useEffect(() => {
    if (!schedule) return
    const wsUrl = saya.getLiveCommentSocketUrl({
      id: schedule.channel.id,
    })
    const s = new ReconnectingWebSocket(wsUrl)
    s.addEventListener("message", (e) => {
      const payload: CommentPayload = JSON.parse(e.data)
      setTimeout(() => {
        setComment(payload)
        setComments((comments) => [...comments, payload])
      }, (playerSetting.commentDelay ?? 0) * 1000)
    })
    socket.current = s

    let isComponentContinue = true
    ;(async () => {
      const streamId = await backend.startChannelHlsStream({
        id: schedule.channel.id,
      })
      while (isComponentContinue) {
        const streams = await backend.getStreams()
        const stream = streams.find((stream) => stream.streamId === streamId)
        if (stream) {
          await backend.keepStream({ id: streamId })
          if (stream.isEnable === true) break
        }
        await wait(1000)
      }
      setHlsUrl(backend.getHlsStreamUrl({ id: streamId }))
      while (isComponentContinue) {
        await backend.keepStream({ id: streamId })
        await wait(1000 * 5)
      }
      await backend.dropStream({ id: streamId })
    })()
    return () => {
      s.close()
      isComponentContinue = false
    }
  }, [schedule])

  useEffect(() => {
    if (!socket.current) return
    const timer = setInterval(() => {
      socket.current?.send(JSON.stringify({ type: "pong" }))
    }, 5000)
    return () => {
      clearInterval(timer)
    }
  }, [socket.current])

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

  const [reloadRequest, setReloadRequest] = useState(0)

  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

  if (schedule === null) return <Loading />
  if (schedule === false) return <NotFound />

  return (
    <div className="md:container mx-auto md:mt-8 md:px-2">
      <div className="flex flex-col md:flex-row items-start justify-around">
        <div className="w-full md:w-2/3" ref={playerContainerRef}>
          <CommentPlayer
            hlsUrl={hlsUrl}
            comment={comment}
            isLive={true}
            isAutoPlay={true}
            reloadRequest={reloadRequest}
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
        <div className="w-full _md:w-2/3 my-4 px-2 md:px-0 md:mr-2">
          <div className="text-2xl">
            <Skeleton isLoaded={!!onGoingProgram}>
              {onGoingProgram ? onGoingProgram.name : "."}
            </Skeleton>
          </div>
          <div className="text-xl mt-1">
            <Skeleton
              isLoaded={!!(onGoingProgram && onGoingProgramDiff !== null)}
            >
              {onGoingProgram && onGoingProgramDiff !== null
                ? `${onGoingProgramStart} [${Math.abs(onGoingProgramDiff)}分${
                    0 < onGoingProgramDiff ? "後" : "前"
                  }] - ${onGoingProgramEnd} (${onGoingProgramDurationInMinutes}分間) / ${
                    schedule.channel.name
                  }`
                : "."}
            </Skeleton>
          </div>
          <div>
            Next
            <ChevronsRight className="inline mx-1" size={18} />
            {nextProgram ? (
              nextProgram.name
            ) : (
              <span className="text-gray-600">不明</span>
            )}
          </div>
          <div className="bg-gray-200 whitespace-pre-wrap rounded-md p-4 md:my-2 text-sm leading-relaxed programDescription">
            <AutoLinkedText>
              {[onGoingProgram?.description, onGoingProgram?.extended]
                .filter((s) => !!s)
                .join("\n\n")}
            </AutoLinkedText>
          </div>
        </div>
        {/*<div className="w-full md:w-1/3 mb-2 md:mb-0 md:my-4 px-2 md:px-0">
          <StatsWidget serviceId={schedule.channel.id} socket={socket} />
              </div>*/}
      </div>
    </div>
  )
}
