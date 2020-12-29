import dayjs, { Dayjs } from "dayjs"
import React, { memo } from "react"
import { Program, Service } from "../../types/struct"

export const ProgramItem: React.VFC<{
  program: Program
  serviceCol: number
  top: number
  height: number
}> = memo(({ program, serviceCol, top, height }) => {
  const startAt = dayjs(program.startAt)
  return (
    <div
      key={program.id}
      style={{
        top: `${top}px`,
        left: `${serviceCol * 9}rem`,
        height: `${height}px`,
      }}
      className={`absolute truncate w-36 bg-gray-100 border border-gray-400 cursor-pointer`}
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
            program.serviceId === service.id &&
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
          if (bottom < client.top || client.top + client.height < top) {
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

        if (rightPos < client.left || client.left + client.width < leftPos) {
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
