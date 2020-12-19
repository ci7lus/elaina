import React, { useEffect, useRef, useState } from "react"
import { Heading } from "@chakra-ui/react"
import schedule from "../schedule.json"
import dayjs from "dayjs"

export const TimetablePage: React.VFC<{}> = () => {
  const channels = (schedule as {
    channel: string
    name: string
    id: string
    sid: number
    nid: number
    hasLogoData: boolean
    programs: {
      id: string
      category: "news" | "anime"
      title: string
      start: number
      end: number
      seconds: number
      detail: string
    }[]
  }[]).filter((channels) => 0 < channels.programs.length)
  const today = dayjs(channels[0].programs[0].start)
    .startOf("day")
    .add(1, "day")

  const [leftPosition, setLeftPosition] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [timeBarPosition, setTimeBarPosition] = useState(0)
  useEffect(() => {
    const now = dayjs()
    scrollRef.current?.scrollTo({ top: now.hour() * 180 - 60 })
    const updateBarPosition = () => {
      const now = dayjs()
      setTimeBarPosition(((now.hour() * 60 + now.minute()) / 60) * 180)
    }
    updateBarPosition()
    const timer = setInterval(updateBarPosition, 60 * 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])
  return (
    <div>
      <div className="bg-gray-800 text-gray-200">
        <div className="px-4 py-2 mx-auto container flex items-center justify-between">
          <Heading as="h2" size="md">
            番組表
          </Heading>
          <div>絞り込みをここら辺に</div>
        </div>
      </div>
      <div
        className="opacity-50 text-gray-200 w-full flex items-center pl-4"
        style={{ transform: `translateX(-${leftPosition}px)` }}
      >
        {channels.map((channel) => (
          <div
            key={channel.id}
            className=" bg-gray-800 w-36 flex-shrink-0 text-center p-1 cursor-pointer border-r-2 border-gray-400 truncate"
          >
            {channel.name}
          </div>
        ))}
      </div>
      <div
        className="relative overflow-auto h-full text-sm"
        style={{ height: "calc(100vh - 162px)" }}
        onScroll={(e) => {
          setLeftPosition(e.currentTarget.scrollLeft)
        }}
        ref={scrollRef}
      >
        <div
          className="relative"
          style={{ width: `${channels.length * 9}rem`, height: "4320px" }}
        >
          <div className="relative block w-full h-full">
            <div className="relative timetable ml-4 overflow-hidden w-full h-full bg-gray-500">
              {channels.map((channel, idx) => {
                return (
                  <React.Fragment key={idx}>
                    {channel.programs
                      .filter((program) =>
                        dayjs(program.start).isSame(today, "day")
                      )
                      .map((program) => {
                        const start = dayjs(program.start)
                        const diffInMinutes = start.diff(today, "minute")
                        return (
                          <div
                            key={program.id}
                            style={{
                              top: `${(diffInMinutes / 60) * 180}px`,
                              left: `${idx * 9}rem`,
                              height: `${(program.seconds / 3600) * 180}px`,
                            }}
                            className={`absolute truncate w-36 bg-${
                              program.category === "anime" ? "pink" : "gray"
                            }-100 border border-gray-400 cursor-pointer`}
                          >
                            <p className="whitespace-pre-wrap leading-snug">
                              {start.format("HH:mm")} {program.title}
                            </p>
                            <p
                              className="whitespace-pre-wrap pt-1 px-2 text-xs text-gray-600"
                              dangerouslySetInnerHTML={{
                                __html: program.detail,
                              }}
                            />
                          </div>
                        )
                      })}
                  </React.Fragment>
                )
              })}
            </div>
            <div
              className="absolute top-0 bg-gray-700 text-gray-200 font-bold "
              style={{ transform: `translateX(${leftPosition}px)` }}
            >
              {[...Array(24).keys()].map((idx) => (
                <div
                  key={idx}
                  className="text-center w-4 whitespace-pre border-t border-gray-200"
                  style={{ height: "180px" }}
                >
                  {idx}
                </div>
              ))}
            </div>
            <div
              className="opacity-50 absolute w-full left-0 border-t-2 border-red-400 transition-all"
              style={{
                top: `${timeBarPosition}px`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
