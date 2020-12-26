import React from "react"
import { isLocationNotFoundError, RoconRoot, useRoutes } from "rocon/react"
import { ExactlyRoutes } from "./routes"
import { Layout } from "./layout"
import { RecoilRoot, useRecoilState } from "recoil"
import { NotFound } from "./components/global/NotFound"

const UsedRoutes: React.VFC<{}> = () => {
  try {
    return useRoutes(ExactlyRoutes)
  } catch (e: unknown) {
    if (isLocationNotFoundError(e)) {
      return <NotFound />
    } else {
      console.error(e)
      return <></>
    }
  }
}

const Routes: React.VFC<{}> = () => {
  return <UsedRoutes />
}

export const App: React.VFC = () => {
  return (
    <RecoilRoot>
      <RoconRoot>
        <Layout>
          <Routes />
        </Layout>
      </RoconRoot>
    </RecoilRoot>
  )
}
