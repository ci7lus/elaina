import dayjs from "dayjs"
import React, { memo, useState } from "react"
import { ArrowContainer, Popover } from "react-tiny-popover"
import { Link } from "rocon/react"
import { Genre, SubGenre } from "../../constants"
import { programsRoute } from "../../routes"
import { Channel, Program, Schedule } from "../../types/struct"
import { genreColors } from "../../utils/genres"

export const ProgramItem: React.VFC<{
  channel: Channel
  program: Program
  channelCol: number
  top: number
  height: number
}> = memo(({ channel, program, channelCol, top, height }) => {
  const startAt = dayjs(program.startAt)
  const remain = startAt.diff(dayjs(), "minute")
  const duration = (program.endAt - program.startAt) / 1000

  const genre = Genre[program.genre1]
  const subGenre = genre && SubGenre[program.genre1][program.subGenre1]
  const genreColor =
    genre && ((subGenre && genreColors[subGenre]) || genreColors[genre])

  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      key={program.id}
      isOpen={isOpen}
      positions={["bottom", "top", "left", "right"]}
      reposition={true}
      onClickOutside={() => setIsOpen(false)}
      content={({ position, childRect, popoverRect }) => {
        if (position === "custom") return <></>
        return (
          <ArrowContainer
            position={position}
            childRect={childRect}
            popoverRect={popoverRect}
            arrowColor={"rgba(31, 41, 55, 0.9)"}
            arrowSize={5}
          >
            <div className="bg-opacity-90 bg-gray-800 text-gray-100 rounded-md p-2 w-72">
              <div className="py-1 rounded-md w-full bg-gray-200 text-gray-800 text-center">
                <div className="font-bold">
                  <span className="text-lg">
                    {startAt.format("MM/DD HH:mm")}
                  </span>
                  <span className="text-gray-600 pl-1">
                    +{duration / 60}min
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span>
                    {Math.abs(remain)}分{0 < remain ? "後" : "前"}
                  </span>
                  {channel && <span className="ml-1">{channel.name}</span>}
                </div>
              </div>
              <div className="mt-2 text-sm leading-relaxed">
                {genre && (
                  <span
                    className={`rounded-md px-2 py-1 text-gray-800 ${
                      genreColor || "bg-gray-100"
                    } mr-1`}
                  >
                    {genre}
                    {subGenre && ` / ${subGenre}`}
                  </span>
                )}
                <span className="font-semibold">{program.name}</span>
                <div className="mt-1 text-xs">
                  {program.description && 100 < program.description.length
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
        )
      }}
    >
      <div
        onClick={() => setIsOpen((isOpen) => !isOpen)}
        style={{
          top: `${Math.max(top, 0)}px`,
          left: `${channelCol * 9}rem`,
          height: `${0 < top ? height : height + top}px`,
        }}
        className={`absolute truncate w-36 ${
          genreColor || "bg-gray-100"
        } border border-gray-400 cursor-pointer select-none`}
        title={[program.name, program.description]
          .filter((s) => !!s)
          .join("\n\n")}
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

export const ChannelProgramList: React.VFC<{
  programs: Program[]
  channel: Channel
  startAtInString: string
  channelCol: number
  client: { left: number; top: number; width: number; height: number }
}> = memo(({ programs, channel, startAtInString, channelCol, client }) => {
  const startAt = dayjs(startAtInString)
  return (
    <React.Fragment>
      {(programs || [])
        .filter(
          (program) =>
            0 < dayjs(program.endAt).diff(startAt, "minute") &&
            dayjs(program.startAt).diff(startAt, "minute") <= 4320
        )
        .map((program) => {
          const start = dayjs(program.startAt)
          const diffInMinutes = start.diff(startAt, "minute")
          const top = (diffInMinutes / 60) * 180
          const height = ((program.endAt - program.startAt) / 1000 / 3600) * 180
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
              channel={channel}
              channelCol={channelCol}
              top={top}
              height={height}
            />
          )
        })}
    </React.Fragment>
  )
})

export const TimetableProgramList: React.VFC<{
  schedules: Schedule[]
  startAtInString: string
  client: { left: number; top: number; width: number; height: number }
}> = memo(({ schedules, startAtInString, client }) => {
  return (
    <>
      {schedules.map((schedule, idx) => {
        const leftPos = idx * 144
        const rightPos = leftPos + 144

        if (
          rightPos < client.left - 144 ||
          client.left + client.width + 144 < leftPos
        ) {
          return <React.Fragment key={idx}></React.Fragment>
        }

        return (
          <ChannelProgramList
            key={idx}
            channelCol={idx}
            channel={schedule.channel}
            programs={schedule.programs}
            startAtInString={startAtInString}
            client={client}
          />
        )
      })}
    </>
  )
})
