import React from "react"
import { Link } from "rocon/react"
import { routes } from "../../routes"

export const TheHeader: React.VFC<{}> = () => {
  return (
    <div className="bg-gray-900">
      <div className="flex items-center container px-2 mx-auto justify-between text-gray-200">
        <div className="flex items-center justify-start space-x-6">
          <Link route={routes.exactRoute} className="hover:text-gray-300">
            <div className="flex items-center justify-start my-1">
              <div className="h-4 w-4 ml-1 mr-2 mt-1" style={{ fill: "#FFF" }}>
                {/* Icon from FontAwesome https://fontawesome.com/icons/quidditch */}
                <svg
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fas"
                  data-icon="quidditch"
                  className="svg-inline--fa fa-quidditch fa-w-20"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                >
                  <path
                    fill="currentColor"
                    d="M256.5 216.8L343.2 326s-16.6 102.4-76.6 150.1C206.7 523.8 0 510.2 0 510.2s3.8-23.1 11-55.4l94.6-112.2c4-4.7-.9-11.6-6.6-9.5l-60.4 22.1c14.4-41.7 32.7-80 54.6-97.5 59.9-47.8 163.3-40.9 163.3-40.9zm238 135c-44 0-79.8 35.8-79.8 79.9 0 44.1 35.7 79.9 79.8 79.9 44.1 0 79.8-35.8 79.8-79.9 0-44.2-35.8-79.9-79.8-79.9zM636.5 31L616.7 6c-5.5-6.9-15.5-8-22.4-2.6L361.8 181.3l-34.1-43c-5.1-6.4-15.1-5.2-18.6 2.2l-25.3 54.6 86.7 109.2 58.8-12.4c8-1.7 11.4-11.2 6.3-17.6l-34.1-42.9L634 53.5c6.9-5.5 8-15.6 2.5-22.5z"
                  ></path>
                </svg>
              </div>
              <div className="text-gray-300">
                elaina <i className="align-super text-xs -ml-1">γ</i>
              </div>
            </div>
          </Link>
          <div className="flex items-center space-x-5 text-sm">
            <Link route={routes._.channels} className="hover:text-gray-300">
              <div className="flex items-center justify-start my-1">放送中</div>
            </Link>
            <Link route={routes._.timetable} className="hover:text-gray-300">
              <div className="flex items-center justify-start my-1">番組表</div>
            </Link>
            <Link route={routes._.records} className="hover:text-gray-300">
              <div className="flex items-center justify-start my-1">録画済</div>
            </Link>
          </div>
        </div>
        <div className="flex items-center jusify-end">
          <div className="flex items-center space-x-4 text-sm">
            <Link route={routes._.settings} className="hover:text-gray-300">
              <div className="flex items-center justify-start my-1">設定</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
