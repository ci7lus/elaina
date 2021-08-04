import React, { useEffect } from "react"
import { isLocationNotFoundError, RoconRoot, useRoutes } from "rocon/react"
import { ChakraProvider } from "@chakra-ui/react"
import { routes } from "./routes"
import { Layout } from "./layout"
import { RecoilRoot, useRecoilState, useRecoilValue } from "recoil"
import { NotFound } from "./components/global/NotFound"
import { ToastProvider, useToasts } from "react-toast-notifications"
import { initializeState } from "./atoms/initialize"
import { RecoilWatcher } from "./components/global/RecoilWatcher"
import { backendSettingAtom } from "./atoms/setting"
import { InitialSettingPage } from "./components/global/InitialSetting"
import { apiDocsAtom } from "./atoms/television"
import { useBackend } from "./hooks/backend"

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

const BackendRoute: React.VFC<{}> = ({}) => {
  const backend = useBackend()
  const toast = useToasts()
  const [docs, setDocs] = useRecoilState(apiDocsAtom)

  useEffect(() => {
    backend
      .getApiDocs()
      .then((docs) => setDocs(docs))
      .catch((e) => {
        console.error(e)
        toast.addToast("設定の取得に失敗しました", {
          appearance: "error",
          autoDismiss: true,
        })
      })
  }, [])
  if (!docs) return <InitialSettingPage />
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
