import { useRecoilValue } from "recoil"
import { sayaSettingAtom } from "../atoms/setting"
import { SayaAPI } from "../infra/saya"

export const useSaya = () => {
  const sayaSetting = useRecoilValue(sayaSettingAtom)
  return new SayaAPI(sayaSetting)
}
