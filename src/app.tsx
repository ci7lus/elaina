import React, { useEffect } from "react"
import { isLocationNotFoundError, RoconRoot, useRoutes } from "rocon/react"
import { ChakraProvider, Spinner } from "@chakra-ui/react"
import { routes } from "./routes"
import { Layout } from "./layout"
import { RecoilRoot, useRecoilState } from "recoil"
import { scheduleAtom } from "./atoms/schedule"
import { ChinachuAPI } from "./infra/chinachu"
import { NotFound } from "./components/global/NotFound"

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
  const [schedule, setSchedule] = useRecoilState(scheduleAtom)
  useEffect(() => {
    ;(async () => {
      const obtained = await ChinachuAPI.getSchedule()
      setSchedule(obtained.filter((channel) => 0 < channel.programs.length))
    })()
  }, [])
  if (schedule === null) {
    return (
      <div
        className="flex items-center justify-center w-full h-full"
        style={{ minHeight: "80vh" }}
      >
        <Spinner size="xl" color="gray.400" speed="1s" />
      </div>
    )
  }

  return <UsedRoutes />
}

export const App: React.VFC = () => {
  return (
    <RecoilRoot>
      <ChakraProvider>
        <RoconRoot>
          <Layout>
            <Routes />
          </Layout>
        </RoconRoot>
      </ChakraProvider>
    </RecoilRoot>
  )
}
