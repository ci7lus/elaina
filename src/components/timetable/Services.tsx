import React, { memo } from "react"
import { Link } from "rocon/react"
import { servicesRoute } from "../../routes"
import { Service } from "../../types/struct"

export const TimetableServiceList: React.VFC<{
  services: Service[]
}> = memo(({ services }) => (
  <>
    {services.map((service) => (
      <Link
        route={servicesRoute.anyRoute}
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
  </>
))
