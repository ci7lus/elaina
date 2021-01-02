import React from "react"
import Rocon from "rocon/react"
import { ServiceIdPage } from "./pages/services/id"
import { IndexPage } from "./pages/index"
import { TimetablePage } from "./pages/timetable"
import { SettingsPage } from "./pages/settings"

export const servicesRoute = Rocon.Path()
  .any("id", {
    action: ({ id }) => <ServiceIdPage id={id} />,
  })
  .exact({
    action: () => <div className="container">channels</div>,
  })

export const routes = Rocon.Path()
  .exact({
    action: () => <IndexPage />,
  })
  .route("timetable", (route) => route.action(() => <TimetablePage />))
  .route("services", (route) => route.attach(servicesRoute))
  .route("settings", (route) => route.action(() => <SettingsPage />))

export const ExactlyRoutes = Rocon.Path()
  .exact({
    action: () => <IndexPage />,
  })
  .route("elaina", (route) => route.attach(routes))
