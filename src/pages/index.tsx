import React from "react"
import { Link } from "rocon/react"
import { routes } from "../routes"

export const IndexPage: React.VFC<{}> = () => (
  <div className="container mx-auto p-4">
    <div>this is root!</div>
    <div>
      <Link route={routes._.player}>player</Link>
    </div>
    <div>
      <Link route={routes._.timetable}>timetable</Link>
    </div>
  </div>
)
