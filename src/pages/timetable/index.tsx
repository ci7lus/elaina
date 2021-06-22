import React, { useEffect, useRef, useState } from "react"
import { Heading } from "@chakra-ui/react"
import ScrollContainer, { ScrollEvent } from "react-indiana-drag-scroll"
import { useSchedules } from "../../hooks/television"
import { TimetableProgramList } from "../../components/timetable/Programs"
import { LeftTimeBar } from "../../components/timetable/TimetableParts"
import { TimetableChannel } from "../../components/timetable/Channels"
import { useThrottleFn } from "react-use"
import { useNow } from "../../hooks/date"
import { Loading } from "../../components/global/Loading"

export const TimetablePage: React.VFC<{}> = () => {
  const now = useNow()
  const [add, setAdd] = useState(0)
  const startAt = now.clone().add(add, "day").startOf("hour")
  const startAtInString = startAt.format()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [clientLeft, setClientLeft] = useState(0)
  const [clientTop, setClientTop] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  const client = useThrottleFn(
    (clientLeft, clientTop, clientWidth, clientHeight) => ({
      left: clientLeft,
      top: clientTop,
      width: Math.max(clientWidth, scrollRef.current?.clientWidth || 0),
      height: Math.max(clientHeight, scrollRef.current?.clientHeight || 0),
    }),
    200,
    [clientLeft, clientTop, clientWidth, clientHeight]
  )

  const timeBarPosition = (now.minute() / 60) * 180

  const { filteredSchedules } = useSchedules({
    startAt: startAt.toDate().getTime(),
  })

  const onResize = () => {
    const el = scrollRef.current
    if (!el) return
    setClientWidth(el.clientWidth || 0)
    setClientHeight(el.clientHeight || 0)
  }

  const onScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setClientLeft(el.scrollLeft)
    setClientTop(el.scrollTop)
    onResize()
  }

  useEffect(() => {
    onResize()
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [])
  return (
    <div>
      <div className="bg-gray-800 text-gray-200">
        <div className="py-2 mx-auto container px-2 flex items-center justify-between space-x-4">
          <Heading as="h2" size="md" flexShrink={0}>
            番組表
          </Heading>
          <ScrollContainer
            className="flex overflow-auto scrollbar-h-2-200-600"
            hideScrollbars={false}
          >
            {[...Array(7).keys()].map((i) => {
              const date = now.clone().add(i, "day")
              const weekday = date.format("dd")
              const color =
                weekday === "日"
                  ? "text-red-400"
                  : weekday === "土"
                  ? "text-blue-400"
                  : ""
              return (
                <button
                  key={i}
                  className={`flex-shrink-0 text-center px-2 border-r-2 border-gray-600 truncate select-none font-semibold ${
                    add === i && "bg-gray-600"
                  } ${color}`}
                  type="button"
                  onClick={() => {
                    setAdd(i)
                  }}
                  disabled={add === i}
                >
                  {date.format("D (dd)")}
                </button>
              )
            })}
          </ScrollContainer>
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          className="text-gray-200 w-full flex items-center pl-4 bg-gray-700"
          style={{
            transform: `translateX(-${clientLeft}px)`,
            height: "40px",
          }}
        >
          {filteredSchedules &&
            filteredSchedules.map((schedule) => (
              <TimetableChannel schedule={schedule} key={schedule.channel.id} />
            ))}
        </div>
      </div>
      <ScrollContainer
        className="timetableScrollContainer scrollbar-wh-4-200-600 relative overflow-auto h-full text-sm overscroll-none bg-gray-500"
        style={{ height: "calc(100vh - 162px)" }}
        onScroll={onScroll}
        onEndScroll={onScroll}
        innerRef={scrollRef}
        hideScrollbars={false}
      >
        {filteredSchedules && client ? (
          <div
            className="relative"
            style={{
              width: `${(filteredSchedules || []).length * 9}rem`,
              minWidth: "calc(100vw - 1rem)",
              height: "4320px",
            }}
          >
            <div className="relative block w-full h-full">
              <div className="relative timetable ml-4 overflow-hidden w-full h-full">
                <TimetableProgramList
                  schedules={filteredSchedules}
                  startAtInString={startAtInString}
                  client={client}
                />
              </div>
              <div
                className="absolute top-0 bg-gray-700 text-gray-200 font-bold "
                style={{ transform: `translateX(${clientLeft}px)` }}
              >
                <LeftTimeBar startAtInString={startAtInString} />
              </div>
              <div
                className={`ml-4 opacity-50 absolute w-full left-0 border-t-4 ${
                  add === 0 ? "border-red-400" : "border-red-200"
                } transition-all pointer-events-none"`}
                style={{
                  top: `${timeBarPosition}px`,
                }}
              />
            </div>
          </div>
        ) : (
          <Loading />
        )}
      </ScrollContainer>
    </div>
  )
}
