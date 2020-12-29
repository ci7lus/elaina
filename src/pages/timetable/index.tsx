import React, { useEffect, useRef, useState } from "react"
import dayjs from "dayjs"
import ScrollContainer from "react-indiana-drag-scroll"
import { useTelevision } from "../../hooks/television"
import { TimetableProgramList } from "../../components/timetable/Programs"
import { LeftTimeBar } from "../../components/timetable/TimetableParts"
import { TimetableServiceList } from "../../components/timetable/Services"
import { useThrottleFn } from "react-use"

export const TimetablePage: React.VFC<{}> = () => {
  const [now, setNow] = useState(dayjs())
  const startAt = now.clone().startOf("hour")
  const startAtInString = startAt.format()
  const [clientLeft, setClientLeft] = useState(0)
  const [clientTop, setClientTop] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)
  const [clientHeight, setClientHeight] = useState(0)
  const client = useThrottleFn(
    (clientLeft, clientTop, clientWidth, clientHeight) => ({
      left: clientLeft,
      top: clientTop,
      width: clientWidth,
      height: clientHeight,
    }),
    50,
    [clientLeft, clientTop, clientWidth, clientHeight]
  )
  const scrollRef = useRef<HTMLDivElement>(null)
  const timeBarPosition = (now.minute() / 60) * 180

  const { programs, filteredServices } = useTelevision()

  useEffect(() => {
    const updateNow = () => {
      setNow(dayjs())
    }
    const onResize = () => {
      setClientWidth(scrollRef.current?.clientWidth || 0)
      setClientHeight(scrollRef.current?.clientHeight || 0)
    }
    const timer = setInterval(updateNow, 60 * 1000)
    onResize()
    window.addEventListener("resize", onResize)

    return () => {
      clearInterval(timer)
      window.removeEventListener("resize", onResize)
    }
  }, [])
  return (
    <div>
      <div className="bg-gray-800 text-gray-200">
        <div className="py-2 mx-auto container flex items-center justify-between">
          <div className="text-xl">番組表</div>
          <div>絞り込みをここら辺に</div>
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
          {filteredServices && (
            <TimetableServiceList services={filteredServices} />
          )}
        </div>
      </div>
      <ScrollContainer
        className="timetableScrollContainer relative overflow-auto h-full text-sm"
        style={{ maxHeight: "calc(100vh - 162px)" }}
        onScroll={(scrollLeft, scrollTop) => {
          setClientLeft(scrollLeft)
          setClientTop(scrollTop)
          setClientWidth(scrollRef.current?.clientWidth || 0)
        }}
        onEndScroll={(scrollLeft, scrollTop) => {
          setClientLeft(scrollLeft)
          setClientTop(scrollTop)
          setClientWidth(scrollRef.current?.clientWidth || 0)
        }}
        innerRef={scrollRef}
        hideScrollbars={false}
      >
        <div
          className="relative"
          style={{
            width: `${(filteredServices || []).length * 9}rem`,
            minWidth: "calc(100vw - 1rem)",
            height: "4320px",
          }}
        >
          <div className="relative block w-full h-full">
            <div className="relative timetable ml-4 overflow-hidden w-full h-full bg-gray-500">
              {programs && filteredServices && client && (
                <TimetableProgramList
                  programs={programs}
                  services={filteredServices}
                  startAtInString={startAtInString}
                  client={client}
                />
              )}
            </div>
            <div
              className="absolute top-0 bg-gray-700 text-gray-200 font-bold "
              style={{ transform: `translateX(${clientLeft}px)` }}
            >
              <LeftTimeBar startAtInString={startAtInString} />
            </div>
            <div
              className="ml-4 opacity-50 absolute w-full left-0 border-t-4 border-red-400 transition-all"
              style={{
                top: `${timeBarPosition}px`,
              }}
            />
          </div>
        </div>
      </ScrollContainer>
    </div>
  )
}
