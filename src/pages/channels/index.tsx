import {
  Progress,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react"
import dayjs from "dayjs"
import React from "react"
import { ChevronsRight } from "react-feather"
import { Link } from "rocon/react"
import { Genre, SubGenre } from "../../constants"
import { useNow } from "../../hooks/date"
import { useChannelComments } from "../../hooks/saya"
import { useSchedules } from "../../hooks/television"
import { channelsRoute } from "../../routes"
import { genreColors } from "../../utils/genres"

export const ChannelsPage: React.VFC<{}> = () => {
  const now = useNow()
  const startAt = now.clone().startOf("hour")

  const { filteredSchedules } = useSchedules({
    startAt: startAt.toDate().getTime(),
  })
  const channelTypes = Array.from(
    new Set(filteredSchedules?.map((schedule) => schedule.channel.channelType))
  )

  const { channelComments } = useChannelComments()

  const _selected = { color: "white", bg: "blue.400" }

  return (
    <div className="container mx-auto px-2">
      <Tabs isFitted variant="enclosed" mt={4}>
        <TabList>
          {channelTypes.map((channelType) => (
            <Tab key={channelType} _selected={_selected}>
              {channelType}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          {channelTypes.map((channelType) => (
            <TabPanel key={channelType}>
              {filteredSchedules
                ?.filter(
                  (schedule) => schedule.channel.channelType === channelType
                )
                .map((schedule) => {
                  const channel = schedule.channel
                  const programs = schedule.programs
                    .filter((program) => now.isBefore(program.endAt))
                    .sort((a, b) => (b.startAt < a.startAt ? 1 : -1))
                  const _program = programs.shift()
                  const program =
                    _program && now.isAfter(_program.startAt) ? _program : null
                  const nextProgram =
                    program === null ? _program : programs.shift()
                  const programDiff =
                    (program && now.diff(program.startAt, "minute")) || 0
                  const genre = program && Genre[program.genre1]
                  const subGenre =
                    program &&
                    genre &&
                    SubGenre[program.genre1][program?.subGenre1]
                  const duration =
                    (program &&
                      (program.endAt - program.startAt) / 1000 / 60) ||
                    1
                  const programColor = program
                    ? genre
                      ? genreColors[genre]
                      : ""
                    : "bg-gray-200"
                  const channelComment = channelComments?.find((ch) =>
                    ch.channel.serviceIds.includes(channel.serviceId)
                  )
                  return (
                    <Link
                      key={channel.id}
                      route={channelsRoute.anyRoute}
                      match={{ id: channel.id.toString() }}
                    >
                      <div
                        className={`w-full p-4 border-gray-400 border shadow-sm mx-auto my-2 rounded-md ${programColor}`}
                      >
                        <h2 className="text-xl">{channel.name}</h2>
                        {program ? (
                          <div className="mt-2 leading-relaxed">
                            <h3 className="text-lg truncate">{program.name}</h3>
                            <h4 className="text-gray-600 truncate">{`${dayjs(
                              program.startAt
                            ).format("HH:mm")} [${Math.abs(
                              programDiff
                            )}分前] - ${dayjs(program.endAt).format(
                              "HH:mm"
                            )} (${duration}分間)${
                              genre
                                ? ` - ${genre}${
                                    subGenre ? ` / ${subGenre}` : ""
                                  }`
                                : ""
                            }`}</h4>
                            <p className="truncate">{program.description}</p>
                            <Progress
                              value={Math.floor((programDiff / duration) * 100)}
                              size="xs"
                              my={2}
                            />
                          </div>
                        ) : (
                          <p className="text-gray-400 my-1 italic">
                            放送中の番組はありません
                          </p>
                        )}
                        <div className="leading-normal truncate">
                          Next
                          <ChevronsRight className="inline mx-1" size={18} />
                          {nextProgram
                            ? `${dayjs(nextProgram.startAt).format(
                                "HH:mm"
                              )} [${Math.abs(
                                now.diff(nextProgram.startAt, "minute")
                              )}分後] - ${nextProgram.name}`
                            : "なし"}
                        </div>
                        {channelComment && channelComment.last && (
                          <div className="truncate p-2 mt-2 leading-snug bg-gray-100 rounded-md">
                            {channelComment.last}
                          </div>
                        )}
                      </div>
                    </Link>
                  )
                })}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </div>
  )
}
