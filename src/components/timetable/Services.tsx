import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverHeader,
  PopoverBody,
  Button,
  Portal,
  PopoverFooter,
} from "@chakra-ui/react"
import React, { memo } from "react"
import { Link } from "rocon/react"
import { servicesRoute } from "../../routes"
import { Service } from "../../types/struct"

export const TimetableServiceList: React.VFC<{
  services: Service[]
}> = memo(({ services }) => (
  <>
    {services.map((service) => (
      <Popover key={service.id}>
        <PopoverTrigger>
          <div
            key={service.id}
            className="bg-gray-700 w-36 flex-shrink-0 text-center p-1 cursor-pointer border-r-2 border-gray-400 truncate"
            title={service.name}
          >
            {service.name}
          </div>
        </PopoverTrigger>
        <Portal>
          <PopoverContent color="white" bg="gray.600" borderColor="gray.600">
            <PopoverHeader pt={4} fontWeight="bold" border="0">
              {service.id} {service.name}
            </PopoverHeader>
            <PopoverArrow bg="gray.600" />
            <PopoverCloseButton />
            <PopoverBody></PopoverBody>
            <PopoverFooter
              border="0"
              d="flex"
              alignItems="center"
              justifyContent="flex-end"
              pb={4}
            >
              <Link
                route={servicesRoute.anyRoute}
                match={{ id: service.id.toString() }}
                key={service.id}
              >
                <Button colorScheme="blue">視聴</Button>
              </Link>
            </PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>
    ))}
  </>
))
