import React, { useEffect, useRef, useState } from "react"
import DPlayer, { DPlayerVideo, DPlayerEvents } from "dplayer"
import { RefreshCw } from "react-feather"
import throttle from "just-throttle"
import { Service, CommentPayload } from "../../types/struct"
import Hls from "hls-b24.js"
import ReconnectingWebSocket from "reconnecting-websocket"
import dayjs from "dayjs"
import * as b24 from "b24.js"
import { SayaAPI } from "../../infra/saya"
import { useDebounce } from "react-use"
import twemoji from "twemoji"

export const Player: React.VFC<{ service: Service }> = ({ service }) => {
  const hlsInstance = useRef<Hls | null>(null)
  const videoPayload: DPlayerVideo = {
    type: "customHls",
    url: SayaAPI.getHlsUrl(service.id),
    customType: {
      customHls: (video: HTMLVideoElement, player: DPlayer) => {
        if (hlsInstance.current) {
          hlsInstance.current.destroy()
          hlsInstance.current = null
        }
        const hls = new Hls()
        // TODO: Custom loader
        // Workaround https://github.com/video-dev/hls.js/issues/2064
        hls.config.enableWorker = false
        if (SayaAPI.isAuthorizationEnabled) {
          hls.config.xhrSetup = (xhr, url) => {
            xhr.setRequestHeader("Authorization", SayaAPI.authorizationToken)
          }
        }
        hls.loadSource(video.src)
        hls.attachMedia(video)
        const b24Renderer = new b24.WebVTTRenderer()
        b24Renderer.init().then(() => {
          b24Renderer.attachMedia(video)
          b24Renderer.show()
        })
        hls.on(Hls.Events.FRAG_PARSING_PRIVATE_DATA, (event, data) => {
          for (const sample of data.samples) {
            b24Renderer.pushData(sample.pid, sample.data, sample.pts)
          }
        })
        player.on("destroy" as DPlayerEvents.destroy, () => {
          hls.destroy()
        })
        hlsInstance.current = hls
      },
    },
    quality: (["1080p", "720p", "360p"] as const).map((quality) => ({
      name: quality,
      url: SayaAPI.getHlsUrl(service.id, quality),
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

  useDebounce(
    () => {
      if (commentListRef.current && commentScrollEnabled.current === true) {
        commentListRef.current.scrollTo({
          top: commentListRef.current.scrollHeight,
          behavior: "smooth",
        })
      }
      if (100 < comments.length) {
        setComments((comments) => comments.splice(comments.length - 100))
      }
    },
    50,
    [comments]
  )

  useEffect(() => {
    const playerInstance = new DPlayer({
      container: dplayerRef.current,
      live: true,
      autoplay: true,
      screenshot: true,
      video: videoPayload,
      danmaku,
      lang: "ja-jp",
      pictureInPicture: true,
      airplay: true,
      subtitle: {
        type: "webvtt",
        fontSize: "20px",
        color: "#fff",
        bottom: "40px",
        // TODO: Typing correctly
      } as any,
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

    playerInstance.on("canplay" as DPlayerEvents.canplay, () => {
      // TODO: Typing correctly
      // @ts-ignore
      playerInstance.subtitle.toggle()
      // @ts-ignore
      playerInstance.subtitle.toggle()
    })

    player.current = playerInstance

    try {
      const wsUrl = SayaAPI.getCommentSocketUrl(service.id)
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
    onResize()

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
          className="playerCommentList block overflow-scroll overflow-y-scroll text-sm h-full"
          ref={commentListRef}
        >
          {comments
            .sort((a, b) => (b.no < a.no ? 1 : -1))
            .map((i) => {
              const time = dayjs(i.time * 1000)
              // emoji
              return (
                <div
                  key={i.no}
                  className="flex items-center space-x-1 w-full hover:bg-gray-200 select-none"
                >
                  <p
                    className="truncate inline-block flex-shrink-0 p-1 border-r border-gray-400 w-20 text-center"
                    title={time.format()}
                  >
                    {time.format("HH:mm:ss")}
                  </p>
                  <p
                    className="p-1 truncate inline-block"
                    title={i.text}
                    dangerouslySetInnerHTML={{ __html: twemoji.parse(i.text) }}
                  ></p>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
