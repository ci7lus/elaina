import { useRecoilValue } from "recoil"
import { backendSettingAtom } from "../atoms/setting"
import { EPGStationAPI } from "../infra/epgstation"

export const useBackend = () => {
  const backendSetting = useRecoilValue(backendSettingAtom)
  return new EPGStationAPI(backendSetting)
}
