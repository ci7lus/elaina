import {
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react"
import React, { memo } from "react"
import { RotateCcw, RotateCw, SkipBack } from "react-feather"

export const PlayerController: React.VFC<{
  position: number
  duration: number
  seek: (n: number) => unknown
  isSeeking: boolean
}> = memo(({ position, duration, seek, isSeeking }) => (
  <div className="bg-gray-50 rounded-md flex items-center space-x-3 py-1 px-2">
    <button
      onClick={() => !isSeeking && seek(0)}
      disabled={isSeeking}
      className={`${isSeeking && "opacity-50 cursor-not-allowed"}`}
    >
      <SkipBack size={16} />
    </button>
    <button
      onClick={() => !isSeeking && seek(position - 60)}
      title="1分戻る"
      disabled={isSeeking}
      className={`${isSeeking && "opacity-50 cursor-not-allowed"}`}
    >
      <RotateCcw size={16} />
    </button>
    <button
      onClick={() => !isSeeking && seek(position + 60)}
      title="1分進める"
      disabled={isSeeking}
      className={`${isSeeking && "opacity-50 cursor-not-allowed"}`}
    >
      <RotateCw size={16} />
    </button>
    <div className="mx-2 text-sm font-bold font-mono">
      {Math.floor(position / 60)
        .toString()
        .padStart(2, "0")}
      :{(position % 60).toString().padStart(2, "0")}
    </div>
    <Slider
      className="mx-2"
      min={0}
      max={duration}
      onClick={(event) => {
        const { left, width } = event.currentTarget.getBoundingClientRect()
        const pos = event.pageX - left - window.pageXOffset
        const seekTo = Math.round((pos / width) * duration)
        seek(seekTo)
      }}
      value={position}
      focusThumbOnChange={false}
    >
      <SliderTrack
        className={`${isSeeking && "opacity-50 cursor-not-allowed"}`}
      >
        <SliderFilledTrack className={`${isSeeking && "cursor-not-allowed"}`} />
      </SliderTrack>
      <SliderThumb className={`${isSeeking && "cursor-not-allowed"}`} />
    </Slider>
  </div>
))
