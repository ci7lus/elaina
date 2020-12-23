import React, { useEffect, useRef, useState } from "react"
import DPlayer, { DPlayerVideo, DPlayerSubTitle } from "dplayer"
import { RefreshCw } from "react-feather"
import throttle from "just-throttle"
import { Channel, CommentPayload } from "../../types/struct"
import Hls from "hls.js"
import ReconnectingWebSocket from "reconnecting-websocket"
import dayjs from "dayjs"
import { SayaAPI } from "../../infra/saya"

export const Player: React.VFC<{ channel: Channel }> = ({ channel }) => {
  const videoPayload: DPlayerVideo = {
    type: "customHls",
    url: SayaAPI.getHlsUrl(channel.sid),
    customType: {
      customHls: (video: HTMLVideoElement, player: DPlayer) => {
        const hls = new Hls()
        // TODO: Custom loader
        if (SayaAPI.isAuthorizationEnabled) {
          hls.config.xhrSetup = (xhr, url) => {
            xhr.setRequestHeader("Authorization", SayaAPI.authorizationToken)
          }
        }
        hls.loadSource(video.src)
        hls.attachMedia(video)
      },
    },
    quality: (["1080p", "720p", "360p"] as const).map((quality) => ({
      name: quality,
      url: SayaAPI.getHlsUrl(channel.sid, quality),
    })),
    defaultQuality: 0,
  }
  const danmaku = {
    id: "elaina",
    user: "elaina",
    api: "",
    bottom: "10%",
    unlimited: true,
  }
  const playerWrapRef = useRef<HTMLDivElement>(null)
  const dplayerRef = useRef<HTMLDivElement>(null)
  const [playerHeight, setPlayerHeight] = useState(
    dplayerRef.current?.clientHeight || 384
  )
  const player = useRef<DPlayer | null>()
  const socket = useRef<ReconnectingWebSocket | null>()

  const [comments, setComments] = useState<CommentPayload[]>([])
  const commentListRef = useRef<HTMLDivElement>(null)
  const commentScrollEnabled = useRef(true)

  const reload = () => {
    player.current?.switchVideo(videoPayload, danmaku)
  }

  useEffect(() => {
    if (commentListRef.current && commentScrollEnabled.current === true) {
      commentListRef.current.scrollTo({
        top: commentListRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
    if (100 < comments.length) {
      setComments((comments) => comments.splice(comments.length - 100))
    }
  }, [comments])

  useEffect(() => {
    player.current = new DPlayer({
      container: dplayerRef.current,
      live: true,
      autoplay: true,
      screenshot: true,
      video: videoPayload,
      danmaku,
      lang: "ja-jp",
      pictureInPicture: true,
      airplay: true,
      subtitle: ({
        type: "webvtt",
        fontSize: "20px",
        color: "#fff",
        bottom: "40px",
      } as Omit<DPlayerSubTitle, "url">) as any,
      apiBackend: {
        read: (option) => {
          option.success([{}])
        },
        send: (option, item, callback) => {
          callback()
        },
      },
      contextmenu: [
        {
          text: "リロード",
          click: reload,
        },
      ],
    })

    try {
      const wsUrl = SayaAPI.getCommentSocketUrl(channel.sid)
      const s = new ReconnectingWebSocket(wsUrl)
      s.addEventListener("message", (e) => {
        const payload: CommentPayload = JSON.parse(e.data)
        player.current?.danmaku.draw({
          type: payload.type,
          color: payload.color,
          text: payload.text,
        })
        setComments((comments) => [...comments, payload])
      })
      s.addEventListener("close", (e) => {
        console.log("ws disconnected!")
      })
      socket.current = s
    } catch (e) {
      console.error(e)
    }

    const onResize = throttle(() => {
      if (!playerWrapRef.current) return
      setPlayerHeight(playerWrapRef.current.clientHeight)
    }, 100)
    window.addEventListener("resize", onResize)

    return () => {
      player.current?.destroy()
      player.current = null
      socket.current?.close()
      window.removeEventListener("resize", onResize)
    }
  }, [])
  return (
    <div
      className="grid grid-cols-3 grid-rows-1"
      style={{ height: `${playerHeight}px` }}
    >
      <div className="relative col-span-2 row-span-full">
        <div
          className="bg-black"
          style={{ paddingTop: "56.25%" }}
          ref={playerWrapRef}
        >
          <div className="absolute left-0 top-0 w-full h-full">
            <div ref={dplayerRef}></div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 col-span-1 flex flex-col">
        <div className="flex justify-start items-center w-full font-sm p-2 pr-4 border-b-2 border-blue-400">
          <button
            className="rounded-md bg-gray-200 p-1 cursor-pointer"
            onClick={reload}
            title="リロード"
          >
            <RefreshCw size={18} />
          </button>
          {/*`<button className="rounded-md bg-gray-200 p-1 cursor-pointer">
            <Camera size={18} />
          </button>
          <button className="rounded-md bg-blue-400 p-1 cursor-pointer">
            <Twitter fill="#FFF" strokeWidth="0" size={18} />
  </button>`*/}
        </div>
        <div
          className="block overflow-scroll overflow-y-scroll text-sm h-full"
          ref={commentListRef}
        >
          {comments
            .sort((a, b) => (b.time < a.time ? 1 : -1))
            .map((i) => (
              <div
                key={i.no}
                className="flex items-center space-x-1 w-full hover:bg-gray-200 select-none"
                title={i.text}
              >
                <p className="truncate inline-block flex-shrink-0 p-1 border-r border-gray-400 w-20 text-center">
                  {dayjs(i.time * 1000).format("HH:mm:ss")}
                </p>
                <p className="p-1 truncate inline-block">{i.text}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
