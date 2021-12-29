import { ChakraProvider } from "@chakra-ui/react"
import React, { useEffect } from "react"
import { ToastProvider, useToasts } from "react-toast-notifications"
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil"
import { isLocationNotFoundError, RoconRoot, useRoutes } from "rocon/react"
import { initializeState } from "./atoms/initialize"
import { backendSettingAtom } from "./atoms/setting"
import { configAtom } from "./atoms/television"
import { InitialSettingPage } from "./components/global/InitialSetting"
import { NotFound } from "./components/global/NotFound"
import { RecoilWatcher } from "./components/global/RecoilWatcher"
import { useBackend } from "./hooks/backend"
import { Layout } from "./layout"
import { routes } from "./routes"

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

const BackendRoute: React.VFC<{}> = () => {
  const backend = useBackend()
  const toast = useToasts()
  const [config, setConfig] = useRecoilState(configAtom)

  useEffect(() => {
    backend
      .getConfig()
      .then((config) => setConfig(config))
      .catch((e) => {
        console.error(e)
        toast.addToast("設定の取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [])
  if (!config) return <InitialSettingPage />
  return <UsedRoutes />
}

const Routes: React.VFC<{}> = () => {
  const backendSetting = useRecoilValue(backendSettingAtom)

  if (!backendSetting.url) return <InitialSettingPage />
  return <BackendRoute />
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
