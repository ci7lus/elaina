import React from "react"
import { TheFooter } from "./components/global/TheFooter"
import { TheHeader } from "./components/global/TheHeader"

export const Layout: React.FC<{}> = ({ children }) => (
  <div className="min-h-screen w-full flex flex-col text-gray-800 leading-loose">
    <div className="relative z-20" id="modal-container" />
    <div className="flex-1 bg-gray-100">
      <TheHeader />
      {children}
    </div>
    <TheFooter />
  </div>
)
