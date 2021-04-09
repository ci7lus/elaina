import React from "react"
import { isLocationNotFoundError, RoconRoot, useRoutes } from "rocon/react"
import { ChakraProvider } from "@chakra-ui/react"
import { routes } from "./routes"
import { Layout } from "./layout"
import { RecoilRoot, useRecoilValue } from "recoil"
import { NotFound } from "./components/global/NotFound"
import { ToastProvider } from "react-toast-notifications"
import { initializeState } from "./atoms/initialize"
import { RecoilWatcher } from "./components/global/RecoilWatcher"
import { backendSettingAtom, sayaSettingAtom } from "./atoms/setting"
import { InitialSettingPage } from "./components/global/InitialSetting"

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
  const backendSetting = useRecoilValue(backendSettingAtom)
  if (!backendSetting.url) return <InitialSettingPage />
  return <UsedRoutes />
}

export const App: React.VFC = () => {
  return (
    <RecoilRoot initializeState={initializeState}>
      <ChakraProvider>
        <RoconRoot>
          <ToastProvider placement="top-center" autoDismissTimeout={5000}>
            <RecoilWatcher />
            <Layout>
              <Routes />
            </Layout>
          </ToastProvider>
        </RoconRoot>
      </ChakraProvider>
    </RecoilRoot>
  )
}
