import React, { useEffect, useRef } from "react"
import DPlayer from "dplayer"

const PlayerPage: React.VFC<{}> = () => {
  const ref = useRef<HTMLDivElement>(null)
  const player = useRef<DPlayer | null>()
  useEffect(() => {
    player.current = new DPlayer({
      container: ref.current,
      autoplay: true,
      video: {
        type: "auto",
        url: "",
      },
      live: true,
    })
    return () => {
      player.current?.destroy()
      player.current = null
    }
  }, [])
  return (
    <div className="relative w-full h-0" style={{ paddingTop: "56.25%" }}>
      <div className="absolute left-0 top-0 w-full h-full">
        <div ref={ref}></div>
      </div>
    </div>
  )
}

export { PlayerPage }
