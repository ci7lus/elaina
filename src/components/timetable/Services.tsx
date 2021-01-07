import { ArrowContainer, Popover } from "react-tiny-popover"
import React, { memo, useState } from "react"
import { Link } from "rocon/react"
import { servicesRoute } from "../../routes"
import { Service } from "../../types/struct"
import { Button } from "@chakra-ui/react"

export const TimetableServiceList: React.VFC<{
  services: Service[]
}> = memo(({ services }) => (
  <>
    {services.map((service) => {
      const [isOpen, setIsOpen] = useState(false)

      return (
        <Popover
          key={service.id}
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
                <div className="text-lg">
                  {service.id} {service.name}
                </div>
                <div className="flex justify-end mt-4">
                  <Link
                    route={servicesRoute.anyRoute}
                    match={{ id: service.id.toString() }}
                    key={service.id}
                  >
                    <Button colorScheme="blue">視聴</Button>
                  </Link>
                </div>
              </div>
            </ArrowContainer>
          )}
        >
          <div
            key={service.id}
            className="bg-gray-700 w-36 flex-shrink-0 text-center p-1 cursor-pointer border-r-2 border-gray-400 truncate select-none"
            title={service.name}
            onClick={() => setIsOpen((isOpen) => !isOpen)}
          >
            {service.name}
          </div>
        </Popover>
      )
    })}
  </>
))
