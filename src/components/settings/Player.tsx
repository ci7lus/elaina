import {
  Button,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { useToasts } from "react-toast-notifications"
import { useRecoilState } from "recoil"
import { playerSettingAtom } from "../../atoms/setting"

export const PlayerSettingForm: React.VFC<{}> = () => {
  const toast = useToasts()
  const [playerSetting, setPlayerSetting] = useRecoilState(playerSettingAtom)
  const [commentDelay, setCommentDelay] = useState(playerSetting.commentDelay)
  const [recordCommentDelay, setRecordCommentDelay] = useState(
    playerSetting.recordCommentDelay
  )
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPlayerSetting({ commentDelay, recordCommentDelay })
    toast.addToast("設定を保存しました", {
      appearance: "success",
      autoDismiss: true,
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label className="mt-2">
          <span>コメント描画遅延</span>
          <NumberInput
            value={commentDelay || 0}
            onChange={(value) => setCommentDelay(parseInt(value))}
          >
            <NumberInputField bgColor="gray.50" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <span className="block text-sm text-gray-600">
            コメントを受信してから描画するまでの遅延を秒数で指定できます
          </span>
        </label>
      </div>
      <div className="mt-2">
        <label>
          <span>録画時コメント描画遅延</span>
          <NumberInput
            value={recordCommentDelay ?? 1}
            onChange={(value) => setRecordCommentDelay(parseInt(value))}
          >
            <NumberInputField bgColor="gray.50" />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <span className="block text-sm text-gray-600">
            録画時にコメントを受信してから描画するまでの遅延を秒数で指定できます
          </span>
        </label>
      </div>
      <Button size="md" colorScheme="blue" type="submit" mt="4">
        保存
      </Button>
    </form>
  )
}
