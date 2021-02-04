import { ArrowContainer, Popover } from "react-tiny-popover"
import React, { memo, useState } from "react"
import { Link } from "rocon/react"
import { channelsRoute } from "../../routes"
import { Schedule } from "../../types/struct"
import { Button } from "@chakra-ui/react"

export const TimetableChannelList: React.VFC<{
  schedules: Schedule[]
}> = memo(({ schedules }) => (
  <>
    {schedules.map((schedule) => {
      const [isOpen, setIsOpen] = useState(false)

      return (
        <Popover
          key={schedule.channel.id}
          isOpen={isOpen}
          positions={["bottom"]}
          reposition={true}
          onClickOutside={() => setIsOpen(false)}
          content={({ position, childRect, popoverRect }) => (
            <ArrowContainer
              position={position}
              childRect={childRect}
              popoverRect={popoverRect}
              arrowColor={"rgba(31, 41, 55, 0.9)"}
              arrowSize={5}
            >
              <div className="bg-opacity-90 bg-gray-800 text-gray-100 rounded-md p-4 w-72">
                <div className="text-lg">{schedule.channel.name}</div>
                <div className="flex justify-end mt-4">
                  <Link
                    route={channelsRoute.anyRoute}
                    match={{ id: schedule.channel.id.toString() }}
                    key={schedule.channel.id}
                  >
                    <Button colorScheme="blue">視聴</Button>
                  </Link>
                </div>
              </div>
            </ArrowContainer>
          )}
        >
          <div
            key={schedule.channel.id}
            className="bg-gray-700 w-36 flex-shrink-0 text-center p-1 cursor-pointer border-r-2 border-gray-400 truncate select-none"
            title={schedule.channel.name}
            onClick={() => setIsOpen((isOpen) => !isOpen)}
          >
            {schedule.channel.name}
          </div>
        </Popover>
      )
    })}
  </>
))
