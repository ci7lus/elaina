import dayjs from "dayjs"
import React, { memo } from "react"

export const LeftTimeBar: React.VFC<{ startAtInString: string }> = memo(
  ({ startAtInString }) => {
    const startAt = dayjs(startAtInString)
    return (
      <>
        {[...Array(24).keys()].map((idx) => {
          return (
            <div
              key={idx}
              className="text-center w-4 whitespace-pre border-t border-gray-200"
              style={{ height: "180px" }}
            >
              {startAt.clone().add(idx, "hour").hour()}
            </div>
          )
        })}
      </>
    )
  }
)
