import { Heading } from "@chakra-ui/react"
import React from "react"
import { BackendSettingForm } from "../settings/Backend"
import { SayaSettingForm } from "../settings/Saya"

export const InitialSettingPage: React.VFC<{}> = () => (
  <div className="container mx-auto px-2 pt-4">
    <Heading size="lg" pb="4">
      初期設定
    </Heading>
    <div>
      <BackendSettingForm />
    </div>
    <div className="my-4">
      <SayaSettingForm />
    </div>
  </div>
)
