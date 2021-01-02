import React from "react"
import { useRecoilTransactionObserver_UNSTABLE } from "recoil"
import {
  playerSettingAtom,
  playerSettingParser,
  sayaSettingAtom,
  sayaSettingParser,
} from "../../atoms/setting"

export const RecoilWatcher: React.VFC<{}> = () => {
  useRecoilTransactionObserver_UNSTABLE(({ snapshot }) => {
    for (let atom of snapshot.getNodes_UNSTABLE({ isModified: true })) {
      switch (atom.key) {
        case sayaSettingAtom.key:
          try {
            const snap = snapshot.getLoadable(sayaSettingAtom).getValue()
            sayaSettingParser.parse(snap)
            localStorage.setItem(sayaSettingAtom.key, JSON.stringify(snap))
          } catch (e) {
            console.error(e)
          }
          break
        case playerSettingAtom.key:
          try {
            const snap = snapshot.getLoadable(playerSettingAtom).getValue()
            playerSettingParser.parse(snap)
            localStorage.setItem(playerSettingAtom.key, JSON.stringify(snap))
          } catch (e) {
            console.error(e)
          }
          break
        default:
          break
      }
    }
  })
  return <></>
}
