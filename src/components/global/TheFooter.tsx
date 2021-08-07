import { Link } from "@chakra-ui/react"
import React from "react"
import { ExternalLink } from "react-feather"
import { Heart } from "react-feather"

export const TheFooter: React.VFC<{}> = () => (
  <div className="bg-gray-900 w-full">
    <div className="container mx-auto">
      <div className="flex justify-end text-xs py-2 px-4 text-gray-200 flex-col text-right leading-normal">
        <div>
          <span>
            <Link
              href="https://github.com/ci7lus/elaina"
              target="_blank"
              isExternal
            >
              elaina
              <ExternalLink className="inline" size={12} />
            </Link>
            &nbsp;made with
            <span>
              <Heart className="inline mx-1" size={12} />
            </span>
          </span>
          <span className="inline-block text-gray-600">
            ...so, tawashi-desu!
          </span>
        </div>
      </div>
    </div>
  </div>
)
