import React from "react"
import { isLocationNotFoundError, RoconRoot, useRoutes } from "rocon/react"
import { ChakraProvider } from "@chakra-ui/react"
import { routes } from "./routes"
import { Layout } from "./layout"
import { RecoilRoot } from "recoil"
import { NotFound } from "./components/global/NotFound"
import { ToastProvider } from "react-toast-notifications"

const UsedRoutes: React.VFC<{}> = () => {
  try {
    return useRoutes(routes)
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
      <ChakraProvider>
        <RoconRoot>
          <ToastProvider placement="top-center" autoDismissTimeout={5000}>
            <Layout>
              <Routes />
            </Layout>
          </ToastProvider>
        </RoconRoot>
      </ChakraProvider>
    </RecoilRoot>
  )
}
