import React, { useEffect, useRef, useState } from "react"
import dayjs from "dayjs"
import { useRecoilValue } from "recoil"
import { scheduleAtom } from "../../atoms/schedule"
import { Link } from "rocon/react"
import { channelsRoute } from "../../routes"

export const TimetablePage: React.VFC<{}> = () => {
  const channels = useRecoilValue(scheduleAtom)
  const [now, setNow] = useState(dayjs())
  const today = now.clone().startOf("day")
  const [leftPosition, setLeftPosition] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timeBarPosition = ((now.hour() * 60 + now.minute()) / 60) * 180
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: timeBarPosition - 30 })
    const updateNow = () => {
      setNow(dayjs())
    }
    const timer = setInterval(updateNow, 60 * 1000)
    return () => {
      clearInterval(timer)
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
            transform: `translateX(-${leftPosition}px)`,
            height: "40px",
          }}
        >
          {channels?.map((channel) => (
            <Link
              route={channelsRoute.anyRoute}
              match={{ id: channel.sid.toString() }}
              key={channel.id}
            >
              <div
                key={channel.id}
                className="bg-gray-700 w-36 flex-shrink-0 text-center p-1 cursor-pointer border-r-2 border-gray-400 truncate"
                title={channel.name}
              >
                {channel.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div
        className="relative overflow-auto h-full text-sm"
        style={{ maxHeight: "calc(100vh - 162px)" }}
        onScroll={(e) => {
          setLeftPosition(e.currentTarget.scrollLeft)
        }}
        ref={scrollRef}
      >
        <div
          className="relative"
          style={{
            width: `${(channels || []).length * 9}rem`,
            minWidth: "100vw",
            height: "4320px",
          }}
        >
          <div className="relative block w-full h-full">
            <div className="relative timetable ml-4 overflow-hidden w-full h-full bg-gray-500">
              {channels?.map((channel, idx) => {
                return (
                  <React.Fragment key={idx}>
                    {channel.programs
                      .filter(
                        (program) =>
                          dayjs(program.start).isSame(today, "day") ||
                          dayjs(program.end).isSame(today, "day")
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
                              // bg-pink-100 bg-pink-100
                              program.category === "anime" ? "pink" : "gray"
                            }-100 border border-gray-400 cursor-pointer`}
                            title={[program.fullTitle, program.detail].join(
                              "\n\n"
                            )}
                          >
                            <p className="whitespace-pre-wrap leading-snug">
                              {start.format("HH:mm")} {program.title}
                            </p>
                            <p
                              className="whitespace-pre-wrap pt-1 px-2 text-xs text-gray-600"
                              /*dangerouslySetInnerHTML={{
                                __html: program.detail,
                              }}*/
                            >
                              {program.detail}
                            </p>
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
              className="ml-4 opacity-50 absolute w-full left-0 border-t-4 border-red-400 transition-all"
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
