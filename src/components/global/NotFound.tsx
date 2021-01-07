import { Heading } from "@chakra-ui/react"
import React from "react"

export const NotFound: React.VFC<{}> = () => (
  <div className="container mx-auto px-2 mt-4">
    <Heading>NotFound</Heading>
    <p>ページが見つかりませんでした…そう、404です！</p>
  </div>
)
