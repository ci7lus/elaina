import dayjs from "dayjs"
import React, { useMemo } from "react"
import { Loading } from "../../components/global/Loading"
import { NotFound } from "../../components/global/NotFound"
import { useTelevision } from "../../hooks/television"
import { useSaya } from "../../hooks/saya"
import { Link } from "rocon/react"
import { servicesRoute } from "../../routes"
import { useNow } from "../../hooks/date"

export const ProgramIdPage: React.FC<{ id: string }> = ({ id }) => {
  const saya = useSaya()
  const { services, programs } = useTelevision()
  const pid = parseInt(id)
  const program = useMemo(
    () => programs && programs.find((program) => program.id === pid),
    [programs]
  )
  const service = useMemo(
    () =>
      services &&
      program &&
      services.find((service) => service.id === program.service.id),
    [services, program]
  )
  const now = useNow()

  if (!services || !programs) return <Loading />
  if (!program) return <NotFound />

  const startAt = dayjs(program.startAt * 1000)
  const diff = startAt.diff(now, "minute")
  const endAt = dayjs((program.startAt + program.duration) * 1000)
  const isNow = now.isBefore(endAt) && diff <= 0

  return (
    <div className="container mx-auto px-2 mt-4 flex flex-col md:flex-row">
      <div className="w-full md:w-2/3">
        <div className="text-2xl">{program.name}</div>
        <div className="text-xl mt-1 text-gray-600">
          {startAt.format("MM/DD HH:mm")}
          <span className={`mx-1 ${isNow && "text-red-400"}`}>
            [{Math.abs(diff)}分{0 < diff ? "後" : "前"}]
          </span>
          - {endAt.format("HH:mm")}
          <span className="ml-1">({program.duration / 60}分間)</span>
        </div>
        <div className="my-2 whitespace-pre-wrap leading-relaxed">
          {program.description}
        </div>
      </div>
      <div className="w-full md:w-1/3">
        <div className="w-full p-4 bg-gray-200 rounded-md my-2 md:my-0">
          {service ? (
            <div>
              <div className="text-lg">
                {service.id} {service.name}
              </div>
              <div className="flex justify-end pt-2">
                <Link
                  route={servicesRoute.anyRoute}
                  match={{ id: program.service.id.toString() }}
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
