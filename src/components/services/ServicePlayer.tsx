import React, { useEffect, useRef } from "react"
import DPlayer, { DPlayerVideo, DPlayerEvents } from "dplayer"
import { Service, CommentPayload } from "../../types/struct"
import Hls from "hls-b24.js"
import * as b24 from "b24.js"
import { useUpdateEffect } from "react-use"
import { useSaya } from "../../hooks/saya"

export const ServicePlayer: React.VFC<{
  service: Service
  comment: CommentPayload | null
  reloadRequest: number
}> = ({ service, comment, reloadRequest }) => {
  const saya = useSaya()
  const hlsInstance = useRef<Hls | null>(null)
  const videoPayload: DPlayerVideo = {
    type: "customHls",
    url: saya.getHlsUrl(service.id),
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
      url: saya.getHlsUrl(service.id, quality),
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
  const dplayerElementRef = useRef<HTMLDivElement>(null)
  const player = useRef<DPlayer | null>()

  const reload = () => {
    player.current?.switchVideo(videoPayload, danmaku)
  }

  useUpdateEffect(() => {
    reload()
  }, [reloadRequest])

  useEffect(() => {
    if (!comment) return
    player.current?.danmaku.draw(comment)
  }, [comment])

  useEffect(() => {
    const playerInstance = new DPlayer({
      container: dplayerElementRef.current,
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

    return () => {
      player.current?.destroy()
      player.current = null
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
