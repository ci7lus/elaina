import dayjs from "dayjs"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronsDown, ChevronsRight, RefreshCw } from "react-feather"
import { CommentPlayer } from "../../components/common/CommentPlayer"
import { Loading } from "../../components/global/Loading"
import { NotFound } from "../../components/global/NotFound"
import { CommentList } from "../../components/common/CommentList"
import { CommentPayload, Program, Schedule } from "../../types/struct"
import ReconnectingWebSocket from "reconnecting-websocket"
import { useDebounce, useUpdateEffect } from "react-use"
import { Skeleton } from "@chakra-ui/react"
import { useRecoilValue } from "recoil"
import { playerSettingAtom } from "../../atoms/setting"
import { useSaya } from "../../hooks/saya"
import { StatsWidget } from "../../components/channels/StatsWidget"
import { useNow } from "../../hooks/date"
import { AutoLinkedText } from "../../components/global/AutoLinkedText"
import { useBackend } from "../../hooks/backend"
import { wait } from "../../utils/wait"
import { CaptureButton } from "../../components/common/CaptureButton"
import { useRefState } from "../../hooks/util"
import { CommentM2tsPlayer } from "../../components/common/CommentM2tsPlayer"

export const ChannelIdPage: React.FC<{ id: string }> = ({ id }) => {
  const saya = useSaya()
  const backend = useBackend()
  const sid = parseInt(id)
  const [schedule, setSchedule] = useState<Schedule | null | false>(null)

  const [currentStreamId, setCurrentStream, currentStreamRef] = useRefState(-1)
  const [liveUrl, setLiveUrl] = useState<string | null>(null)
  useUpdateEffect(() => {
    setLiveUrl(backend.getHlsStreamUrl({ id: currentStreamId }))
  }, [currentStreamId])

  const isMounting = useRef(true)

  useEffect(() => {
    backend
      .getChannelSchedules({ channelId: sid, days: 1 })
      .then((schedule) => setSchedule(schedule))
      .catch(() => setSchedule(false))
    isMounting.current = true
    return () => {
      isMounting.current = false
    }
  }, [])

  const now = useNow()
  const [onGoingProgram, setOnGoingProgram] = useState<Program | null>(null)
  const [nextProgram, setNextProgram] = useState<Program | null>(null)
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

  const [isLoading, setIsLoading, isLoadingRef] = useRefState(false)

  const claimChannelStream = useCallback(async () => {
    if (!schedule || isLoadingRef.current) return
    try {
      setIsLoading(true)
      const streamId = await backend.startChannelHlsStream({
        id: schedule.channel.id,
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
      console.error(error)
      return Promise.reject(error)
    } finally {
      setIsLoading(false)
    }
  }, [schedule])

  const socket = useRef<ReconnectingWebSocket | null>()

  useEffect(() => {
    if (!schedule) return
    let s: ReconnectingWebSocket
    if (saya) {
      const wsUrl = saya.getLiveCommentSocketUrl({
        channelType: schedule.channel.channelType,
        serviceId: schedule.channel.serviceId,
      })
      s = new ReconnectingWebSocket(wsUrl)
      s.addEventListener("message", (e) => {
        const payload: CommentPayload = JSON.parse(e.data)
        setTimeout(() => {
          setComment(payload)
          setComments((comments) => [...comments, payload])
        }, Math.abs((playerSetting.commentDelay || 0) * 1000 - payload.timeMs || 0))
      })
      socket.current = s
    }

    if (playerSetting.useMpegTs) {
      setLiveUrl(
        backend.getM2tsStreamUrl({
          id: schedule.channel.id,
          mode: playerSetting.mpegTsMode!,
        })
      )
    } else {
      claimChannelStream()
    }
    return () => {
      s?.close()
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

  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

  if (schedule === null) return <Loading />
  if (schedule === false) return <NotFound />

  return (
    <div className="md:container mx-auto md:mt-8 md:px-2">
      <div className="flex flex-col md:flex-row items-start justify-around">
        <div className="w-full md:w-2/3" ref={playerContainerRef}>
          {playerSetting.useMpegTs ? (
            <CommentM2tsPlayer
              liveUrl={liveUrl}
              comment={comment}
              isLive={true}
              isAutoPlay={true}
              isLoading={isLoading}
            />
          ) : (
            <CommentPlayer
              hlsUrl={liveUrl}
              comment={comment}
              isLive={true}
              isAutoPlay={true}
              isLoading={isLoading}
            />
          )}
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
              onClick={() => claimChannelStream()}
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
            {/*`<button className="rounded-md bg-blue-400 p-1 cursor-pointer">
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
                ? `${dayjs(onGoingProgram.startAt).format("HH:mm")} [${Math.abs(
                    onGoingProgramDiff
                  )}分${0 < onGoingProgramDiff ? "後" : "前"}] - ${dayjs(
                    onGoingProgram.endAt
                  ).format("HH:mm")} (${
                    (onGoingProgram.endAt - onGoingProgram.startAt) / 1000 / 60
                  }分間) / ${schedule.channel.name}`
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
