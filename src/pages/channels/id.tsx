import dayjs from "dayjs"
import React, { useEffect, useState } from "react"
import { ChevronsRight } from "react-feather"
import { Player } from "../../components/common/Player"
import { Loading } from "../../components/global/Loading"
import { NotFound } from "../../components/global/NotFound"
import { useTelevision } from "../../hooks/television"
import { Program } from "../../types/struct"

export const ChannelIdPage: React.FC<{ id: string }> = ({ id }) => {
  const { services, programs } = useTelevision()
  const sid = parseInt(id)
  const service = services && services.find((c) => c.id === sid)

  const [onGoingProgram, setOnGoingProgram] = useState<Program | null>(null)
  const [nextProgram, setNextProgram] = useState<Program | null>(null)
  const onGoingProgramStart =
    onGoingProgram && dayjs(onGoingProgram.startAt * 1000).format("HH:mm")
  const onGoingProgramEnd =
    onGoingProgram && dayjs(onGoingProgram.endAt * 1000).format("HH:mm")
  const onGoingProgramDurationInMinutes =
    onGoingProgram && (onGoingProgram.duration || 0) / 60

  useEffect(() => {
    const updateProgram = () => {
      if (!service) return
      const now = dayjs()
      const futurePrograms = (programs || [])
        .filter(
          (p) =>
            p.startAt &&
            p.serviceId === service.serviceId &&
            dayjs(p.endAt * 1000).isAfter(now)
        )
        .sort((a, b) => (b.startAt < a.startAt ? 1 : -1))
      setOnGoingProgram(futurePrograms.shift() || null)

      setNextProgram(futurePrograms.shift() || null)
    }
    updateProgram()
    const timer = setInterval(updateProgram, 60 * 1000)
    return () => {
      clearInterval(timer)
    }
  }, [programs])

  if (!services || !programs) return <Loading />
  if (!service) return <NotFound />

  return (
    <div className="container mx-auto mt-8">
      <Player service={service} />
      <div className="my-4">
        <div className="text-xl">
          {onGoingProgram ? onGoingProgram.name : "."}
        </div>
        <div className="text-lg">
          {onGoingProgramStart}〜{onGoingProgramEnd}（
          {onGoingProgramDurationInMinutes}分） / {service.name}
        </div>
        <div className="items-center">
          Next
          <ChevronsRight className="inline mx-1" size={18} />
          {nextProgram ? (
            nextProgram.name
          ) : (
            <span className="text-gray-600">不明</span>
          )}
        </div>
      </div>
    </div>
  )
}
