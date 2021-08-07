import React from "react"
import Rocon from "rocon/react"
import { ChannelsPage } from "./pages/channels"
import { ChannelIdPage } from "./pages/channels/id"
import { IndexPage } from "./pages/index"
import { ProgramIdPage } from "./pages/programs/id"
import { RecordsPage } from "./pages/records"
import { RecordIdPage } from "./pages/records/id"
import { SettingsPage } from "./pages/settings"
import { TimetablePage } from "./pages/timetable"

export const programsRoute = Rocon.Path()
  .any("id", {
    action: ({ id }) => <ProgramIdPage id={id} />,
  })
  .exact({
    action: () => <div className="container mx-auto px-2">programs</div>,
  })

export const recordsRoute = Rocon.Path()
  .any("id", {
    action: ({ id }) => <RecordIdPage id={id} />,
  })
  .exact({
    action: () => <RecordsPage />,
  })

export const channelsRoute = Rocon.Path()
  .any("id", {
    action: ({ id }) => <ChannelIdPage id={id} />,
  })
  .exact({
    action: () => <ChannelsPage />,
  })

export const routes = Rocon.Path()
  .exact({
    action: () => <IndexPage />,
  })
  .route("timetable", (route) => route.action(() => <TimetablePage />))
  .route("channels", (route) => route.attach(channelsRoute))
  .route("programs", (route) => route.attach(programsRoute))
  .route("records", (route) => route.attach(recordsRoute))
  .route("settings", (route) => route.action(() => <SettingsPage />))

export const ExactlyRoutes = Rocon.Path()
  .exact({
    action: () => <IndexPage />,
  })
  .route("elaina", (route) => route.attach(routes))
