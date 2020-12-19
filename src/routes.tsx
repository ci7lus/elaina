import React from "react"
import Rocon from "rocon/react"
import { IndexPage } from "./pages/index"
import { PlayerPage } from "./pages/player"

export const routes = Rocon.Path()
  .exact({
    action: () => <IndexPage />,
  })
  .route("player", (route) => route.action(() => <PlayerPage />))
