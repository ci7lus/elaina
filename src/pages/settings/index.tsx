import {
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react"
import React from "react"
import { BackendSettingForm } from "../../components/settings/Backend"
import { PlayerSettingForm } from "../../components/settings/Player"
import { SayaSettingForm } from "../../components/settings/Saya"

export const SettingsPage = () => {
  return (
    <div className="container mx-auto px-2 py-4">
      <Heading size="lg" pb="2">
        設定
      </Heading>
      <Tabs>
        <TabList>
          <Tab>バックエンド</Tab>
          <Tab>プレイヤー</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <div>
              <BackendSettingForm />
            </div>
            <div className="mt-4">
              <SayaSettingForm />
            </div>
          </TabPanel>
          <TabPanel>
            <PlayerSettingForm />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  )
}
