/**
 * From ZenzaWatch & TVRemotePlus
 * https://greasyfork.org/ja/scripts/367968-zenzawatch-dev%E7%89%88
 * https://github.com/tsukumijima/TVRemotePlus
 */

export const capturePlayer = async ({
  withComment,
}: {
  withComment: boolean
}) => {
  const video = document.querySelector<HTMLVideoElement>(
    "video.dplayer-video-current"
  )
  const danmaku = document.querySelectorAll(".dplayer-danmaku-move")

  let html = document.querySelector(".dplayer-danmaku")?.outerHTML

  if (!video || !danmaku || !html) throw new Error()

  for (let i = 0; i < danmaku.length; i++) {
    const position =
      danmaku[i].getBoundingClientRect().left -
      video.getBoundingClientRect().left
    html = html.replace(
      /transform: translateX\(.*?\)\;/,
      "left: " + position + "px;"
    )
  }
  // twemoji 対処
  html = html.replace(/<img.+?alt=\"(.+?)\".+?\>/g, (_, match) => match)

  let scale = 1
  const minHeight = 1080

  let width = Math.max(video.videoWidth, (video.videoHeight * 16) / 9)
  let height = video.videoHeight
  if (height < minHeight) {
    scale = Math.floor(minHeight / height)
    width *= scale
    height *= scale
  }

  const canvas = document.createElement("canvas")
  const canvasContext = canvas.getContext("2d", { alpha: false })
  if (!canvasContext) throw new Error("canvasContext")
  canvas.width = width
  canvas.height = height
  const videoCanvas = videoToCanvas(video)
  canvasContext.fillStyle = "rgb(0, 0, 0)"
  canvasContext.fillRect(0, 0, width, height)
  canvasContext.drawImage(
    videoCanvas,
    (width - video.videoWidth * scale) / 2,
    (height - video.videoHeight * scale) / 2,
    video.videoWidth * scale,
    video.videoHeight * scale
  )
  if (withComment) {
    const { canvas } = await htmlToCanvas(html, width, height, scale)
    canvasContext.drawImage(canvas, 0, 0, width, height)
  }
  return { canvas }
}

const videoToCanvas = (video: HTMLVideoElement) => {
  const canvas = document.createElement("canvas")
  const caption = document.querySelector<HTMLCanvasElement>(
    "div.dplayer-video-wrap > canvas"
  )
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const context = canvas.getContext("2d")
  if (!context) throw new Error("canvasContext")

  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  if (caption) {
    context.drawImage(caption, 0, 0, canvas.width, canvas.height)
  }

  return canvas
}

const htmlToSvg = (
  html: string,
  width: number,
  height: number,
  scale: number
) => {
  const data = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='${
    width * scale
  }' height='${height * scale}'>
                    <foreignObject width='100%' height='100%'>
                        <div xmlns="http://www.w3.org/1999/xhtml">
                            <style>
                            .dplayer-danmaku {
                                position: absolute;
                                left: 0;
                                right: 0;
                                top: 0;
                                bottom: 0;
                                font-size: 29px;
                                font-family: sans-serif;
                                color: #fff;
                            }
                            .dplayer-danmaku .dplayer-danmaku-item {
                                display: inline-block;
                                pointer-events: none;
                                user-select: none;
                                cursor: default;
                                white-space: nowrap;
                                font-weight: 600;
                                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                            }
                            .dplayer-danmaku .dplayer-danmaku-item--demo {
                                position: absolute;
                                visibility: hidden;
                            }
                            .dplayer-danmaku .dplayer-danmaku-right {
                                position: absolute;
                                left: 0;
                            }
                            .dplayer-danmaku .dplayer-danmaku-top,
                            .dplayer-danmaku .dplayer-danmaku-bottom {
                                position: absolute;
                                width: 100%;
                                text-align: center;
                            }
                            @keyframes danmaku-center {
                                from {
                                    visibility: visible;
                                }
                                to {
                                    visibility: visible;
                                }
                            }
                            </style>
                            ${html}
                        </div>
                    </foreignObject>
        </svg>`.trim()
  const svg = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data)
  return { svg, data }
}

const htmlToCanvas = async (
  html: string,
  width: number,
  height: number,
  scale: number
) => {
  const imageW = (height * 16) / 9
  const imageH = (imageW * 9) / 16
  const { svg } = htmlToSvg(html, 640, 360 + 20, scale)
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")
  if (!context) throw new Error("canvasContext")
  canvas.width = width
  canvas.height = height
  const img = new Image()
  img.width = 640
  img.height = 360
  await new Promise<void>((res, rej) => {
    img.onload = () => {
      context.drawImage(
        img,
        (width - imageW) / 2,
        (height - imageH) / 2 - 20,
        imageW,
        imageH + 40
      )
      res()
    }
    img.onerror = (err) => rej(err)
    img.src = svg
  })

  return { canvas, img }
}
