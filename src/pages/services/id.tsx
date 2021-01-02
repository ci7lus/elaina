import dayjs from "dayjs"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { ChevronsDown, ChevronsRight, RefreshCw } from "react-feather"
import { ServicePlayer } from "../../components/services/ServicePlayer"
import { Loading } from "../../components/global/Loading"
import { NotFound } from "../../components/global/NotFound"
import { CommentList } from "../../components/services/CommentList"
import { useTelevision } from "../../hooks/television"
import { CommentPayload, Program } from "../../types/struct"
import ReconnectingWebSocket from "reconnecting-websocket"
import { useDebounce } from "react-use"
import { Skeleton } from "@chakra-ui/react"
import { useRecoilValue } from "recoil"
import { playerSettingAtom } from "../../atoms/setting"
import { useSaya } from "../../hooks/saya"

export const ServiceIdPage: React.FC<{ id: string }> = ({ id }) => {
  const saya = useSaya()
  const { services, programs } = useTelevision()
  const sid = parseInt(id)
  const service = useMemo(
    () => services && services.find((c) => c.id === sid),
    [services]
  )

  const [onGoingProgram, setOnGoingProgram] = useState<Program | null>(null)
  const [nextProgram, setNextProgram] = useState<Program | null>(null)
  const onGoingProgramStart =
    onGoingProgram && dayjs(onGoingProgram.startAt * 1000).format("HH:mm")
  const onGoingProgramEnd =
    onGoingProgram &&
    dayjs((onGoingProgram.startAt + onGoingProgram.duration) * 1000).format(
      "HH:mm"
    )
  const onGoingProgramDurationInMinutes =
    onGoingProgram && (onGoingProgram.duration || 0) / 60

  useEffect(() => {
    const updateProgram = () => {
      if (!service) return
      const now = dayjs()
      const futurePrograms = (programs || [])
        .filter(
          (p) =>
            p.startAt &&
            p.serviceId === service.id &&
            dayjs((p.startAt + p.duration) * 1000).isAfter(now)
        )
        .sort((a, b) => (b.startAt < a.startAt ? 1 : -1))
      setOnGoingProgram(futurePrograms.shift() || null)

      setNextProgram(futurePrograms.shift() || null)
    }
    updateProgram()
    const timer = setInterval(updateProgram, 60 * 1000)
    return () => {
      clearInterval(timer)
    }
  }, [programs])

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
    if (!service) return
    const wsUrl = saya.getCommentSocketUrl(service.id)
    const s = new ReconnectingWebSocket(wsUrl)
    s.addEventListener("message", (e) => {
      const payload: CommentPayload = JSON.parse(e.data)
      setTimeout(
        () => {
          setComment(payload)
          setComments((comments) => [...comments, payload])
        },
        playerSetting.commentDelay ? playerSetting.commentDelay * 1000 : 0
      )
    })
    socket.current = s
    return () => {
      s.close()
    }
  }, [service])

  useEffect(() => {
    if (!socket.current) return
    const timer = setInterval(() => {
      socket.current?.send(JSON.stringify({ type: "pong" }))
    }, 5000)
    return () => {
      clearInterval(timer)
    }
  }, [socket])

  const [reloadRequest, setReloadRequest] = useState(0)

  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true)

  if (!services || !programs) return <Loading />
  if (!service) return <NotFound />

  return (
    <div className="container mx-auto md:mt-8 md:px-2">
      <div className="flex flex-col md:flex-row items-start justify-around">
        <div className="w-full md:w-2/3">
          <ServicePlayer
            service={service}
            comment={comment}
            reloadRequest={reloadRequest}
          />
          <div className="my-4 px-2 md:px-0">
            <div className="text-xl">
              <Skeleton isLoaded={!!onGoingProgram}>
                {onGoingProgram ? onGoingProgram.name : "."}
              </Skeleton>
            </div>
            <div className="text-lg mt-1">
              <Skeleton isLoaded={!!onGoingProgram}>
                {onGoingProgramStart}〜{onGoingProgramEnd}（
                {onGoingProgramDurationInMinutes}分） / {service.name}
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
          </div>
        </div>
        <div
          className="bg-gray-50 w-full md:w-1/3 flex flex-col"
          style={{ height: "40vw" }}
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
    </div>
  )
}
