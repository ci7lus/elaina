import React, { useCallback, useEffect, useRef } from "react"
import DPlayer, {
  DPlayerVideo,
  DPlayerEvents,
  DPlayerVideoQuality,
} from "dplayer"
import { CommentPayload } from "../../types/struct"
import Hls from "hls-b24.js"
import * as b24 from "aribb24.js"
import { useUpdateEffect } from "react-use"
import { useSaya } from "../../hooks/saya"

export const CommentPlayer: React.VFC<{
  hlsUrl: string
  comment: CommentPayload | null
  isLive: boolean
  isAutoPlay: boolean
  onPositionChange?: React.Dispatch<React.SetStateAction<number>>
  onPauseChange?: (b: boolean) => unknown
  reloadRequest: number
}> = ({
  hlsUrl,
  comment,
  isLive,
  isAutoPlay,
  onPositionChange,
  onPauseChange,
  reloadRequest,
}) => {
  const saya = useSaya()
  const hlsInstance = useRef<Hls | null>(null)
  const isPlaying = useRef(false)
  const videoPayload: () => DPlayerVideo = useCallback(
    () => ({
      type: "customHls",
      url: hlsUrl,
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
          if (saya.isAuthorizationEnabled) {
            hls.config.xhrSetup = (xhr, url) => {
              xhr.setRequestHeader("Authorization", saya.authorizationToken)
            }
          }
          hls.config.autoStartLoad = isLive

          hls.loadSource(video.src)
          hls.attachMedia(video)

          const b24Renderer = new b24.CanvasRenderer({
            forceStrokeColor: "black",
          })
          b24Renderer.attachMedia(video)
          b24Renderer.show()

          player.on("subtitle_show" as DPlayerEvents.subtitle_show, () => {
            b24Renderer.show()
          })
          player.on("subtitle_hide" as DPlayerEvents.subtitle_hide, () => {
            b24Renderer.hide()
          })
          hls.on(Hls.Events.FRAG_PARSING_PRIVATE_DATA, (event, data) => {
            for (const sample of data.samples) {
              b24Renderer.pushData(sample.pid, sample.data, sample.pts)
            }
          })
          hls.on(Hls.Events.DESTROYING, () => {
            b24Renderer.dispose()
          })

          player.on("pause" as DPlayerEvents.pause, () => {
            !isLive && hls.stopLoad()
            onPauseChange && onPauseChange(true)
            isPlaying.current = false
          })
          player.on("play" as DPlayerEvents.play, () => {
            !isLive && hls.startLoad()
            onPauseChange && onPauseChange(false)
            isPlaying.current = true
          })
          player.on("waiting" as DPlayerEvents.stalled, () => {
            onPauseChange && onPauseChange(true)
            isPlaying.current = false
          })
          player.on("canplay" as DPlayerEvents.canplay, () => {
            onPauseChange && onPauseChange(false)
            isPlaying.current = true
          })

          player.on("destroy" as DPlayerEvents.destroy, () => {
            hls.destroy()
          })

          hlsInstance.current = hls
        },
      },
    }),
    [hlsUrl]
  )
  const danmaku = {
    id: "elaina",
    user: "elaina",
    api: "",
    bottom: "10%",
    unlimited: true,
  }
  const playerWrapRef = useRef<HTMLDivElement>(null)
  const dplayerElementRef = useRef<HTMLDivElement>(null)
  const player = useRef<DPlayer | null>()

  const reload = useCallback(() => {
    if (!player.current) return
    player.current.pause()
    player.current.switchVideo(videoPayload(), danmaku)
    player.current.play()
  }, [hlsUrl])

  useUpdateEffect(() => {
    reload()
  }, [reloadRequest, hlsUrl])

  useEffect(() => {
    if (!comment || player.current?.video.paused === true) return
    player.current?.danmaku.draw(comment)
  }, [comment])

  useEffect(() => {
    const playerInstance = new DPlayer({
      container: dplayerElementRef.current,
      live: isLive,
      autoplay: isAutoPlay,
      screenshot: true,
      video: videoPayload(),
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

    player.current = playerInstance
    hlsInstance.current?.stopLoad()

    const timer = setInterval(() => {
      if (isPlaying.current) {
        onPositionChange && onPositionChange((n) => n + 1)
      }
    }, 1000)

    return () => {
      hlsInstance.current?.destroy()
      player.current?.destroy()
      player.current = null
      clearInterval(timer)
    }
  }, [])
  return (
    <div
      className="relative bg-black"
      style={{ paddingTop: "56.25%" }}
      ref={playerWrapRef}
    >
      <div className="absolute left-0 top-0 w-full h-full">
        <div ref={dplayerElementRef}></div>
      </div>
    </div>
  )
}
