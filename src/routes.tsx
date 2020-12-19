import React from "react"
import Rocon from "rocon/react"
import { IndexPage } from "./pages/index"
import { PlayerPage } from "./pages/player"
import { TimetablePage } from "./pages/timetable"

export const routes = Rocon.Path()
  .exact({
    action: () => <IndexPage />,
  })
  .route("timetable", (route) => route.action(() => <TimetablePage />))
  .route("player", (route) => route.action(() => <PlayerPage />))
