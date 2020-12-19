import React from "react"
import { RoconRoot, useRoutes } from "rocon/react"
import { ChakraProvider } from "@chakra-ui/react"
import { routes } from "./routes"
import { Layout } from "./layout"

const UsedRoutes: React.VFC<{}> = () => {
  return useRoutes(routes)
}

export const App: React.VFC = () => {
  return (
    <ChakraProvider>
      <RoconRoot>
        <Layout>
          <UsedRoutes />
        </Layout>
      </RoconRoot>
    </ChakraProvider>
  )
}
