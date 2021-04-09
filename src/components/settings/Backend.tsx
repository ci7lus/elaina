import { Button, Heading, Input } from "@chakra-ui/react"
import React from "react"
import { useForm } from "react-hook-form"
import { useToasts } from "react-toast-notifications"
import { useRecoilState } from "recoil"
import { backendSettingAtom } from "../../atoms/setting"
import type { BackendSetting } from "../../types/setting"

export const BackendSettingForm: React.FC<{}> = () => {
  const toast = useToasts()
  const { register, handleSubmit } = useForm()
  const [backendSetting, setBackendSetting] = useRecoilState(backendSettingAtom)
  const onSubmit = (data: BackendSetting) => {
    setBackendSetting(data)
    toast.addToast("設定を保存しました", {
      appearance: "success",
      autoDismiss: true,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="inline">
      <label>
        <span>EPGStation の URL</span>
        <Input
          bgColor="gray.50"
          placeholder="https://..."
          defaultValue={backendSetting.url || ""}
          {...register("url")}
        />
      </label>
      <Heading as="h3" size="md" mt="4" mb="2">
        認証設定
      </Heading>
      <label className="mt-2">
        <span>ユーザー名</span>
        <Input
          bgColor="gray.50"
          placeholder="elaina"
          defaultValue={backendSetting.user || ""}
          {...register("user")}
        />
      </label>
      <label className="mt-2">
        <span>パスワード</span>
        <Input
          bgColor="gray.50"
          type="password"
          autoComplete="true"
          defaultValue={backendSetting.pass || ""}
          {...register("pass")}
        />
      </label>
      <Button size="md" colorScheme="blue" type="submit" mt="4">
        保存
      </Button>
    </form>
  )
}
