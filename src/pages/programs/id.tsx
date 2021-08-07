import dayjs from "dayjs"
import React from "react"
import { Link } from "rocon/react"
import { AutoLinkedText } from "../../components/global/AutoLinkedText"
import { Loading } from "../../components/global/Loading"
import { NotFound } from "../../components/global/NotFound"
import { Genre, SubGenre } from "../../constants"
import { useNow } from "../../hooks/date"
import { useChannels, useProgram } from "../../hooks/television"
import { channelsRoute } from "../../routes"

export const ProgramIdPage: React.FC<{ id: string }> = ({ id }) => {
  const pid = parseInt(id)
  const { program } = useProgram({ id: pid })
  const { channels } = useChannels()
  const channel =
    program &&
    channels &&
    channels.find((channel) => channel.id === program.channelId)
  const now = useNow()

  if (program === null) return <Loading />
  if (program === false) return <NotFound />

  const startAt = dayjs(program.startAt)
  const diff = startAt.diff(now, "minute")
  const endAt = dayjs(program.endAt)
  const isNow = now.isBefore(endAt) && diff <= 0
  const duration = (program.endAt - program.startAt) / 1000

  const genre1 = Genre[program.genre1]
  const subGenre1 = genre1 && SubGenre[program.genre1][program.subGenre1]
  const genre2 = Genre[program.genre2]
  const subGenre2 = genre2 && SubGenre[program.genre2][program.subGenre2]
  const genre3 = Genre[program.genre3]
  const subGenre3 = genre3 && SubGenre[program.genre3][program.subGenre3]

  return (
    <div className="container mx-auto px-2 mt-4 flex flex-col md:flex-row md:space-x-4">
      <div className="w-full md:w-2/3">
        <div className="text-2xl">{program.name}</div>
        <div className="text-xl my-1 text-gray-600">
          {startAt.format("MM/DD HH:mm")}
          <span className={`mx-1 ${isNow && "text-red-400"}`}>
            [{Math.abs(diff)}分{0 < diff ? "後" : "前"}]
          </span>
          - {endAt.format("HH:mm")}
          <span className="ml-1">({duration / 60}分間)</span>
        </div>
        <div className="text-gray-600 leading-relaxed">
          {[
            [genre1, subGenre1],
            [genre2, subGenre2],
            [genre3, subGenre3],
          ]
            .filter(([genre]) => !!genre)
            .map(([genre, subGenre]) => (
              <p>
                {genre}
                {subGenre && ` / ${subGenre}`}
              </p>
            ))}
        </div>
        <div className="my-4 whitespace-pre-wrap leading-relaxed programDescription">
          <AutoLinkedText>
            {[program.description, program.extended]
              .filter((s) => !!s)
              .join("\n\n")}
          </AutoLinkedText>
        </div>
      </div>
      <div className="w-full md:w-1/3">
        <div className="w-full p-4 bg-gray-200 rounded-md my-2 md:my-0">
          {channel ? (
            <div>
              <div className="text-lg">{channel.name}</div>
              <div className="flex justify-end pt-2">
                <Link
                  route={channelsRoute.anyRoute}
                  match={{ id: channel.id.toString() }}
                >
                  <button className="bg-indigo-400 text-gray-100 rounded-md px-2 p-1">
                    視聴
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">サービス不明</div>
          )}
        </div>
      </div>
    </div>
  )
}
