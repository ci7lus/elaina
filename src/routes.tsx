import React from "react"
import Rocon from "rocon/react"
import { ChannelIdPage } from "./pages/channels/id"
import { IndexPage } from "./pages/index"
import { TimetablePage } from "./pages/timetable"

export const channelsRoute = Rocon.Path()
  .any("id", {
    action: ({ id }) => <ChannelIdPage id={id} />,
  })
  .exact({
    action: () => <div className="container">channels</div>,
  })

export const routes = Rocon.Path()
  .exact({
    action: () => <IndexPage />,
  })
  .route("timetable", (route) => route.action(() => <TimetablePage />))
  .route("channels", (route) => route.attach(channelsRoute))

export const ExactlyRoutes = Rocon.Path()
  .exact({
    action: () => <IndexPage />,
  })
  .route("elaina", (route) => route.attach(routes))
