import { Button, Heading, Input } from "@chakra-ui/react"
import React from "react"
import { useForm } from "react-hook-form"
import { useToasts } from "react-toast-notifications"
import { useRecoilState } from "recoil"
import { sayaSettingAtom } from "../../atoms/setting"
import type { SayaSetting } from "../../types/setting"

export const SayaSettingForm: React.FC<{}> = () => {
  const toast = useToasts()
  const { register, handleSubmit } = useForm()
  const [sayaSetting, setSayaSetting] = useRecoilState(sayaSettingAtom)
  const onSubmit = (data: SayaSetting) => {
    setSayaSetting(data)
    toast.addToast("設定を保存しました", {
      appearance: "success",
      autoDismiss: true,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="inline">
      <label>
        <span>Saya の URL</span>
        <Input
          bgColor="gray.50"
          name="url"
          placeholder="https://..."
          defaultValue={sayaSetting.url || ""}
          ref={register}
        />
      </label>
      <Heading as="h3" size="md" mt="4" mb="2">
        認証設定
      </Heading>
      <label className="mt-2">
        <span>ユーザー名</span>
        <Input
          bgColor="gray.50"
          name="user"
          placeholder="elaina"
          defaultValue={sayaSetting.user || ""}
          ref={register}
        />
      </label>
      <label className="mt-2">
        <span>パスワード</span>
        <Input
          bgColor="gray.50"
          name="pass"
          type="password"
          autoComplete="true"
          defaultValue={sayaSetting.pass || ""}
          ref={register}
        />
      </label>
      <Button size="md" colorScheme="blue" type="submit" mt="4">
        保存
      </Button>
    </form>
  )
}
