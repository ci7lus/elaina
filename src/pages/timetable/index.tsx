import React, { useEffect, useRef, useState } from "react"
import dayjs from "dayjs"
import { Link } from "rocon/react"
import { channelsRoute } from "../../routes"
import ScrollContainer from "react-indiana-drag-scroll"
import { useTelevision } from "../../hooks/television"

export const TimetablePage: React.VFC<{}> = () => {
  const [now, setNow] = useState(dayjs())
  const today = now.clone().startOf("hour")
  const [leftPosition, setLeftPosition] = useState(0)
  const [clientWidth, setClientWidth] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timeBarPosition = (now.minute() / 60) * 180

  const { services, programs } = useTelevision()

  useEffect(() => {
    const updateNow = () => {
      setNow(dayjs())
    }
    const timer = setInterval(updateNow, 60 * 1000)
    setClientWidth(scrollRef.current?.clientWidth || 0)

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
          {services?.map((service) => (
            <Link
              route={channelsRoute.anyRoute}
              match={{ id: service.id.toString() }}
              key={service.id}
            >
              <div
                key={service.id}
                className="bg-gray-700 w-36 flex-shrink-0 text-center p-1 cursor-pointer border-r-2 border-gray-400 truncate"
                title={service.name}
              >
                {service.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <ScrollContainer
        className="relative overflow-auto h-full text-sm"
        style={{ maxHeight: "calc(100vh - 162px)" }}
        onScroll={(scrollLeft) => {
          setLeftPosition(scrollLeft)
          setClientWidth(scrollRef.current?.clientWidth || 0)
        }}
        onEndScroll={(scrollLeft) => {
          setLeftPosition(scrollLeft)
          setClientWidth(scrollRef.current?.clientWidth || 0)
        }}
        innerRef={scrollRef}
        hideScrollbars={false}
      >
        <div
          className="relative"
          style={{
            width: `${(services || []).length * 9}rem`,
            minWidth: "100vw",
            height: "4320px",
          }}
        >
          <div className="relative block w-full h-full">
            <div className="relative timetable ml-4 overflow-hidden w-full h-full bg-gray-500">
              {services?.map((service, idx) => {
                const leftPos = idx * 144
                const rightPos = leftPos + 144

                if (
                  !scrollRef.current ||
                  rightPos < leftPosition ||
                  leftPosition + clientWidth < leftPos
                ) {
                  return <React.Fragment key={idx}></React.Fragment>
                }
                return (
                  <React.Fragment key={idx}>
                    {(programs || [])
                      .filter(
                        (program) =>
                          program.serviceId === service.serviceId &&
                          0 <
                            dayjs(program.endAt * 1000).diff(today, "minute") &&
                          dayjs(program.startAt * 1000).diff(today, "minute") <=
                            4320
                      )
                      .map((program) => {
                        const start = dayjs(program.startAt * 1000)
                        const diffInMinutes = start.diff(today, "minute")
                        return (
                          <div
                            key={program.id}
                            style={{
                              top: `${(diffInMinutes / 60) * 180}px`,
                              left: `${idx * 9}rem`,
                              height: `${(program.duration / 3600) * 180}px`,
                            }}
                            className={`absolute truncate w-36 bg-${
                              // bg-pink-100 bg-pink-100
                              program.genres[0] === "Anime" ? "pink" : "gray"
                            }-100 border border-gray-400 cursor-pointer`}
                            title={[program.name, program.description].join(
                              "\n\n"
                            )}
                          >
                            <p className="whitespace-pre-wrap leading-snug">
                              {start.format("HH:mm")} {program.name}
                            </p>
                            <p
                              className="whitespace-pre-wrap pt-1 px-2 text-xs text-gray-600"
                              /*dangerouslySetInnerHTML={{
                                __html: program.detail,
                              }}*/
                            >
                              {program.description}
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
              {[...Array(24).keys()].map((idx) => {
                const hour = today.clone().add(idx, "hour")
                return (
                  <div
                    key={idx}
                    className="text-center w-4 whitespace-pre border-t border-gray-200"
                    style={{ height: "180px" }}
                  >
                    {hour.hour()}
                  </div>
                )
              })}
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
