import React from "react"
import { RecordingsWidget } from "../components/top/Recordings"
import { StreamsWidget } from "../components/top/Streams"

export const IndexPage: React.VFC<{}> = () => {
  return (
    <div className="container px-2 mx-auto mt-4">
      <div className="mb-4">Under development...そう、開発中です！</div>
      <div className="flex flex-wrap justify-between items-stretch">
        <div className="w-full md:w-1/2 md:pr-2 pb-4">
          <StreamsWidget />
        </div>
        <div className="w-full md:w-1/2 md:pl-2 pb-4">
          <RecordingsWidget />
        </div>
      </div>
    </div>
  )
}
