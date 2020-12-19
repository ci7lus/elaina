import React from "react"
import { Link } from "rocon/react"
import { routes } from "../../routes"

export const TheHeader: React.VFC<{}> = () => {
  return (
    <div className="bg-gray-900">
      <div className="flex items-center container mx-auto justify-between px-4 text-gray-200 pr-2">
        <div className="flex items-center justify-start">
          <Link route={routes.exactRoute}>
            <div className="flex items-center justify-start my-1">elaina γ</div>
          </Link>
        </div>
        <div className="flex items-center jusify-end">
          <div className="relative p-2 z-10"></div>
        </div>
      </div>
    </div>
  )
}
