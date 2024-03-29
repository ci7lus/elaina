import { Spinner } from "@chakra-ui/react"
import * as aribb24 from "aribb24.js"
// eslint-disable-next-line import/no-unresolved
import DPlayer, { DPlayerVideo, DPlayerEvents } from "dplayer"
import Hls from "hls-b24.js"
import React, { useEffect, useRef } from "react"
import { useUpdateEffect } from "react-use"
import { useBackend } from "../../hooks/backend"
import { CommentPayload } from "../../types/struct"
import { trimCommentForFlow } from "../../utils/comment"

export const CommentPlayer: React.VFC<{
  hlsUrl: string | null
  comment: CommentPayload | null
  isLive: boolean
  isAutoPlay: boolean
  isLoading?: boolean
  onPositionChange?: React.Dispatch<React.SetStateAction<number>>
  onPauseChange?: (b: boolean) => unknown
}> = ({
  hlsUrl,
  comment,
  isLive,
  isAutoPlay,
  isLoading,
  onPositionChange,
  onPauseChange,
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
          hls.config.xhrSetup = (xhr) => {
            xhr.setRequestHeader("Authorization", backend.authorizationToken)
          }
        }
        hls.config.autoStartLoad = isLive

        hls.loadSource(video.src)
        hls.attachMedia(video)

        const b24Renderer = new aribb24.CanvasRenderer({
          keepAspectRatio: true,
          normalFont: "'Rounded M+ 1m for ARIB'",
          gaijiFont: "'Rounded M+ 1m for ARIB'",
          drcsReplacement: true,
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

  useUpdateEffect(() => {
    if (!player.current || !hlsUrl) return
    player.current.pause()
    player.current.switchVideo(videoPayload(hlsUrl), danmaku)
    player.current.play()
  }, [hlsUrl])

  useEffect(() => {
    if (!player.current || !comment || player.current.video.paused === true)
      return
    const commentText = trimCommentForFlow(comment.text)
    if (commentText.trim().length === 0) return
    const payload = { ...comment, text: commentText }
    player.current.danmaku.draw(payload)
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
      } as never,
      apiBackend: {
        read: (option) => {
          option.success([{}])
        },
        send: (option, item, callback) => {
          callback()
        },
      },
      contextmenu: [],
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
        <div className="absolute left-0 top-0 h-full w-full flex items-center justify-center pointer-events-none">
          <Spinner size="xl" color="gray.100" speed="1s" />
        </div>
      )}
    </div>
  )
}
