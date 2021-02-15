import React from "react"
import { StreamsWidget } from "../components/top/Streams"

export const IndexPage: React.VFC<{}> = () => {
  return (
    <div className="container px-2 mx-auto mt-4">
      <div className="mb-2">Under development...そう、開発中です！</div>
      <div className="flex">
        <div className="w-full md:w-1/2">
          <StreamsWidget />
        </div>
      </div>
    </div>
  )
}
