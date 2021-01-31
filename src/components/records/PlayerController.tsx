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
}> = memo(({ position, duration, seek }) => (
  <div className="bg-gray-50 rounded-md flex items-center space-x-2 py-1 px-2">
    <button onClick={() => seek(0)}>
      <SkipBack size={16} />
    </button>
    <button onClick={() => seek(position - 60)} title="1分戻る">
      <RotateCcw size={16} />
    </button>
    <button onClick={() => seek(position + 60)} title="1分進める">
      <RotateCw size={16} />
    </button>
    <div className="mx-2 text-sm font-bold">
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
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
  </div>
))
