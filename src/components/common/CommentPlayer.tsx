import React, { useCallback, useEffect, useRef } from "react"
import DPlayer, {
  DPlayerVideo,
  DPlayerEvents,
  DPlayerVideoQuality,
} from "dplayer"
import { CommentPayload } from "../../types/struct"
import Hls from "@neneka/hls.js"
import * as b24 from "aribb24.js"
import { useUpdateEffect } from "react-use"
import { Spinner } from "@chakra-ui/react"
import { useBackend } from "../../hooks/backend"

export const CommentPlayer: React.VFC<{
  hlsUrl: string | null
  comment: CommentPayload | null
  isLive: boolean
  isAutoPlay: boolean
  isLoading?: boolean
  onPositionChange?: React.Dispatch<React.SetStateAction<number>>
  onPauseChange?: (b: boolean) => unknown
  reloadRequest: number
}> = ({
  hlsUrl,
  comment,
  isLive,
  isAutoPlay,
  isLoading,
  onPositionChange,
  onPauseChange,
  reloadRequest,
}) => {
  const backend = useBackend()
  const hlsInstance = useRef<Hls | null>(null)
  const isPlaying = useRef(false)
  const videoPayload: (hlsUrl: string) => DPlayerVideo = (hlsUrl) => ({
    type: "customHls",
    url: hlsUrl,
    customType: {
      customHls: (video: HTMLVideoElement, player: DPlayer) => {
        if (hlsInstance.current) {
          hlsInstance.current.destroy()
          hlsInstance.current = null
        }
        const hls = new Hls()

        if (backend.isAuthorizationEnabled) {
          hls.config.xhrSetup = (xhr, url) => {
            xhr.setRequestHeader("Authorization", backend.authorizationToken)
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
  })
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
    if (!player.current || !hlsUrl) return
    player.current.pause()
    player.current.switchVideo(videoPayload(hlsUrl), danmaku)
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
    if (!hlsUrl) return
    const playerInstance = new DPlayer({
      container: dplayerElementRef.current,
      live: isLive,
      autoplay: isAutoPlay,
      screenshot: true,
      video: videoPayload(hlsUrl),
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
  }, [hlsUrl])
  return (
    <div
      className="relative bg-black"
      style={{ paddingTop: "56.25%" }}
      ref={playerWrapRef}
    >
      {hlsUrl && (
        <div className="absolute left-0 top-0 w-full h-full">
          <div ref={dplayerElementRef}></div>
        </div>
      )}
      {(!hlsUrl || isLoading) && (
        <div className="absolute left-0 top-0 h-full w-full flex items-center justify-center">
          <Spinner size="xl" color="gray.100" speed="1s" />
        </div>
      )}
    </div>
  )
}
