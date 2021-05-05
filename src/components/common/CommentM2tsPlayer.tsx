import React, { useCallback, useEffect, useRef } from "react"
import DPlayer, {
  DPlayerVideo,
  DPlayerEvents,
  DPlayerVideoQuality,
} from "dplayer"
import { CommentPayload } from "../../types/struct"
import mpegts from "mpegts.js"
import * as aribb24 from "aribb24.js"
import { useUpdateEffect } from "react-use"
import { Spinner } from "@chakra-ui/react"
import { useBackend } from "../../hooks/backend"
import { trimCommentForFlow } from "../../utils/comment"

export const CommentM2tsPlayer: React.VFC<{
  liveUrl: string | null
  comment: CommentPayload | null
  isLive: boolean
  isAutoPlay: boolean
  isLoading?: boolean
  onPositionChange?: React.Dispatch<React.SetStateAction<number>>
  onPauseChange?: (b: boolean) => unknown
}> = ({
  liveUrl,
  comment,
  isLive,
  isAutoPlay,
  isLoading,
  onPositionChange,
  onPauseChange,
}) => {
  const backend = useBackend()
  const mpegTsInstance = useRef<mpegts.Player | null>(null)
  const isPlaying = useRef(false)
  const videoPayload: (hlsUrl: string) => DPlayerVideo = (liveUrl) => ({
    type: "customHls",
    url: liveUrl,
    customType: {
      customHls: (video: HTMLVideoElement, player: DPlayer) => {
        if (mpegTsInstance.current) {
          mpegTsInstance.current.destroy()
          mpegTsInstance.current = null
        }
        const mpegtsPlayer = mpegts.createPlayer(
          {
            type: "mpegts",
            isLive: true,
            url: video.src,
          },
          {
            isLive: true,
            enableWorker: true,
            headers: backend.isAuthorizationEnabled
              ? {
                  Authorization: backend.authorizationToken,
                }
              : {},
          }
        )

        mpegtsPlayer.attachMediaElement(video)
        mpegtsPlayer.load()
        mpegtsPlayer.play()

        const b24Renderer = new aribb24.CanvasB24Renderer({
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
        mpegtsPlayer.on(mpegts.Events.PES_PRIVATE_DATA_ARRIVED, (data) => {
          b24Renderer.pushData(data.pid, data.data, data.pts)
        })
        /*hls.on(Hls.Events.DESTROYING, () => {
          b24Renderer.dispose()
        })*/

        player.on("pause" as DPlayerEvents.pause, () => {
          onPauseChange && onPauseChange(true)
          isPlaying.current = false
        })
        player.on("play" as DPlayerEvents.play, () => {
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
          mpegtsPlayer.destroy()
        })

        mpegTsInstance.current = mpegtsPlayer
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
    if (!player.current || !liveUrl) return
    player.current.pause()
    player.current.switchVideo(videoPayload(liveUrl), danmaku)
    player.current.play()
  }, [liveUrl])

  useEffect(() => {
    if (!player.current || !comment || player.current.video.paused === true)
      return
    const commentText = trimCommentForFlow(comment.text)
    if (commentText.trim().length === 0) return
    const payload = { ...comment, text: commentText }
    player.current.danmaku.draw(payload)
  }, [comment])

  useEffect(() => {
    if (!liveUrl) return
    const playerInstance = new DPlayer({
      container: dplayerElementRef.current,
      live: isLive,
      autoplay: isAutoPlay,
      screenshot: true,
      video: videoPayload(liveUrl),
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
      contextmenu: [],
    })

    player.current = playerInstance

    const timer = setInterval(() => {
      if (isPlaying.current) {
        onPositionChange && onPositionChange((n) => n + 1)
      }
    }, 1000)

    return () => {
      mpegTsInstance.current?.destroy()
      player.current?.destroy()
      player.current = null
      clearInterval(timer)
    }
  }, [liveUrl])
  return (
    <div
      className="relative bg-black"
      style={{ paddingTop: "56.25%" }}
      ref={playerWrapRef}
    >
      {liveUrl && (
        <div className="absolute left-0 top-0 w-full h-full">
          <div ref={dplayerElementRef}></div>
        </div>
      )}
      {(!liveUrl || isLoading) && (
        <div className="absolute left-0 top-0 h-full w-full flex items-center justify-center pointer-events-none">
          <Spinner size="xl" color="gray.100" speed="1s" />
        </div>
      )}
    </div>
  )
}
