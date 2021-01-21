import dayjs from "dayjs"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronsDown, RefreshCw } from "react-feather"
import { CommentPlayer } from "../../components/common/CommentPlayer"
import { Loading } from "../../components/global/Loading"
import { NotFound } from "../../components/global/NotFound"
import { CommentList } from "../../components/services/CommentList"
import { CommentPayload, ProgramRecord } from "../../types/struct"
import ReconnectingWebSocket from "reconnecting-websocket"
import { useDebounce } from "react-use"
import { Skeleton } from "@chakra-ui/react"
import { useSaya } from "../../hooks/saya"
import { AutoLinkedText } from "../../components/global/AutoLinkedText"
import { PlayerController } from "./PlayerController"

export const RecordIdPage: React.FC<{ id: string }> = ({ id }) => {
  const saya = useSaya()
  const pid = parseInt(id)
  const [record, setRecord] = useState<ProgramRecord | null | false>(null)
  const program = useMemo(() => record && record.program, [record])
  const service = useMemo(() => program && program.service, [program])

  const programStart = program && dayjs(program.startAt * 1000)
  const programEnd =
    program && dayjs((program.startAt + program.duration) * 1000)
  const programDurationInMinutes = program && (program.duration || 0) / 60

  const qualities = useMemo(
    () =>
      program &&
      (["1080p", "720p", "360p"] as const).map((quality) => ({
        name: quality,
        url: saya.getRecordHlsUrl(program.id, quality),
      })),
    [program]
  )

  useEffect(() => {
    saya
      .getRecord(pid)
      .then((record) => setRecord(record))
      .catch((error) => {
        console.error(error)
        setRecord(false)
      })
  }, [])

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

  useEffect(() => {
    if (!program) return
    const wsUrl = saya.getRecordCommentSocketUrl(program.id)
    const s = new ReconnectingWebSocket(wsUrl)
    s.addEventListener("message", (e) => {
      const payload: CommentPayload = JSON.parse(e.data)
      setComment(payload)
      setComments((comments) => [...comments, payload])
    })
    s.addEventListener("open", () => {
      syncToPosition()
      setComments([])
    })
    socket.current = s
    return () => {
      s.close()
    }
  }, [program])

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

  const seek = useCallback((s: number) => {
    // TODO: sayaにシークがついたら追従する
    console.log("seeked", s)
  }, [])

  if (program === false) return <NotFound />
  if (
    program === null ||
    !qualities ||
    !programDurationInMinutes ||
    !programStart ||
    !programEnd
  )
    return <Loading />

  return (
    <div className="md:container mx-auto md:mt-8 md:px-2">
      <div className="flex flex-col md:flex-row items-start justify-around">
        <div className="w-full md:w-2/3" ref={playerContainerRef}>
          <CommentPlayer
            qualities={qualities}
            comment={comment}
            isLive={false}
            isAutoPlay={true}
            onPositionChange={setPosition}
            onPauseChange={setIsPaused}
            reloadRequest={reloadRequest}
          />
          <PlayerController
            position={position}
            duration={program.duration}
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
            <Skeleton isLoaded={!!program}>
              {program ? program.name : "."}
            </Skeleton>
          </div>
          <div className="text-xl mt-1">
            <Skeleton isLoaded={!!(program && service)}>
              {program && service
                ? `${programStart.format(
                    "YYYY/MM/DD HH:mm"
                  )} - ${programEnd.format(
                    "HH:mm"
                  )} (${programDurationInMinutes}分間) / ${service.name}`
                : "."}
            </Skeleton>
          </div>
          <div className="bg-gray-200 whitespace-pre-wrap rounded-md p-4 md:my-2 text-sm leading-relaxed programDescription">
            <AutoLinkedText>{program.description || ""}</AutoLinkedText>
          </div>
        </div>
      </div>
    </div>
  )
}
