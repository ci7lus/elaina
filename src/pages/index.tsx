import React from "react"
import { Link } from "rocon/react"
import { routes } from "../routes"

export const IndexPage: React.VFC<{}> = () => (
  <div>
    <div>this is root!</div>
    <Link route={routes._.player}>player</Link>
  </div>
)
