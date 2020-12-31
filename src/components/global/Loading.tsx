import { Spinner } from "@chakra-ui/react"
import React from "react"

export const Loading: React.VFC<{}> = () => (
  <div
    className="flex items-center justify-center w-full h-full"
    style={{ minHeight: "80vh" }}
  >
    <Spinner size="xl" color="gray.400" speed="1s" />
  </div>
)
