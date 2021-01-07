import { Link } from "rocon/react"
import dayjs from "dayjs"
import React, { memo, useState } from "react"
import { ArrowContainer, Popover } from "react-tiny-popover"
import { useRecoilValue } from "recoil"
import { genresAtom, servicesAtom } from "../../atoms/television"
import { Program, Service } from "../../types/struct"
import { genreColors } from "../../utils/genres"
import { programsRoute } from "../../routes"

export const ProgramItem: React.VFC<{
  program: Program
  serviceCol: number
  top: number
  height: number
}> = memo(({ program, serviceCol, top, height }) => {
  const startAt = dayjs(program.startAt * 1000)
  const remain = startAt.diff(dayjs(), "minute")

  const genres = useRecoilValue(genresAtom)
  const services = useRecoilValue(servicesAtom)
  const service = services && services.find((s) => s.id === program.service.id)

  const genre =
    !!program.genres.length &&
    genres?.find((genre) => genre.id === program.genres[0])
  const genreColor =
    genre && (genreColors[genre.sub] || genreColors[genre.main])

  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      key={program.id}
      isOpen={isOpen}
      positions={["bottom", "top", "left", "right"]}
      reposition={true}
      onClickOutside={() => setIsOpen(false)}
      content={({ position, childRect, popoverRect }) => (
        <ArrowContainer
          position={position}
          childRect={childRect}
          popoverRect={popoverRect}
          arrowColor={"rgba(31, 41, 55)"}
          arrowSize={8}
          className="popover-arrow-container"
          arrowClassName="popover-arrow"
        >
          <div className="bg-opacity-90 bg-gray-800 text-gray-100 rounded-md p-2 w-72">
            <div className="py-1 rounded-md w-full bg-gray-200 text-gray-800 text-center">
              <div className="font-bold">
                <span className="text-lg">{startAt.format("MM/DD HH:mm")}</span>
                <span className="text-gray-600 pl-1">
                  +{program.duration / 60}min
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span>
                  {Math.abs(remain)}分{0 < remain ? "後" : "前"}
                </span>
                {service && <span className="ml-1">{service.name}</span>}
              </div>
            </div>
            <div className="mt-2 text-sm leading-relaxed">
              {genre && (
                <span
                  className={`rounded-md px-2 py-1 text-gray-800 ${genreColor} mr-1`}
                >
                  {genre.main}
                </span>
              )}
              <span className="font-semibold">{program.name}</span>
              <div className="mt-1 text-xs">
                {100 < program.description.length
                  ? program.description.substring(0, 100) + "..."
                  : program.description}
              </div>
              <div className="text-gray-400 text-sm">{program.id}</div>
              <Link
                route={programsRoute.anyRoute}
                match={{ id: program.id.toString() }}
              >
                <button className="w-full rounded-md py-1 my-1 text-center bg-indigo-400 hover:bg-indigo-300">
                  詳細
                </button>
              </Link>
            </div>
          </div>
        </ArrowContainer>
      )}
    >
      <div
        onClick={() => setIsOpen((isOpen) => !isOpen)}
        key={program.id}
        style={{
          top: `${top}px`,
          left: `${serviceCol * 9}rem`,
          height: `${height}px`,
        }}
        className={`absolute truncate w-36 ${
          genreColor ? genreColor : "bg-gray-100"
        } border border-gray-400 cursor-pointer`}
        title={[program.name, program.description].join("\n\n")}
      >
        <p className="whitespace-pre-wrap leading-snug">
          {startAt.format("HH:mm")} {program.name}
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
    </Popover>
  )
})

export const ServiceProgramList: React.VFC<{
  programs: Program[]
  service: Service
  startAtInString: string
  serviceCol: number
  client: { left: number; top: number; width: number; height: number }
}> = memo(({ programs, service, startAtInString, serviceCol, client }) => {
  const startAt = dayjs(startAtInString)
  return (
    <React.Fragment>
      {(programs || [])
        .filter(
          (program) =>
            program.service.id === service.id &&
            0 <
              dayjs((program.startAt + program.duration) * 1000).diff(
                startAt,
                "minute"
              ) &&
            dayjs(program.startAt * 1000).diff(startAt, "minute") <= 4320
        )
        .map((program) => {
          const start = dayjs(program.startAt * 1000)
          const diffInMinutes = start.diff(startAt, "minute")
          const top = (diffInMinutes / 60) * 180
          const height = (program.duration / 3600) * 180
          const bottom = top + height
          if (
            bottom < client.top - 180 ||
            client.top + client.height + 180 < top
          ) {
            return <React.Fragment key={program.id} />
          }
          return (
            <ProgramItem
              key={program.id}
              program={program}
              serviceCol={serviceCol}
              top={top}
              height={height}
            />
          )
        })}
    </React.Fragment>
  )
})

export const TimetableProgramList: React.VFC<{
  services: Service[]
  programs: Program[]
  startAtInString: string
  client: { left: number; top: number; width: number; height: number }
}> = memo(({ services, programs, startAtInString, client }) => {
  return (
    <>
      {services.map((service, idx) => {
        const leftPos = idx * 144
        const rightPos = leftPos + 144

        if (
          rightPos < client.left - 144 ||
          client.left + client.width + 144 < leftPos
        ) {
          return <React.Fragment key={idx}></React.Fragment>
        }

        return (
          <ServiceProgramList
            key={idx}
            programs={programs}
            serviceCol={idx}
            service={service}
            startAtInString={startAtInString}
            client={client}
          />
        )
      })}
    </>
  )
})
