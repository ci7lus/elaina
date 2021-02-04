import { Button, Input, Portal } from "@chakra-ui/react"
import React, { useState } from "react"

export const RecordSearchModal: React.VFC<{
  searchTerm: string | null
  setSearchTerm: React.Dispatch<React.SetStateAction<string | null>>
  onClose: Function
}> = ({ searchTerm, setSearchTerm, onClose }) => {
  const [value, setValue] = useState(searchTerm || "")
  const onSubmitHandle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setSearchTerm(value || null)
    onClose()
  }
  return (
    <Portal>
      <div className="fixed w-full h-full left-0 top-0 ">
        <div
          className="z-10 absolute w-full h-full left-0 top-0 bg-gray-800 opacity-25"
          onClick={() => onClose()}
        ></div>
        <div className="w-full h-full flex items-center justify-center">
          <div className="z-20 p-4 rounded-md bg-gray-100">
            <form onSubmit={onSubmitHandle}>
              <div className="text-lg mb-4">検索</div>
              <Input
                className="bg-gray-100 mb-4"
                placeholder="タイトル"
                value={value}
                onChange={(e) => setValue(e.target.value || "")}
              />
              <div className="flex items-center justify-start space-x-4">
                <Button colorScheme="blue" type="submit">
                  検索
                </Button>
                <Button
                  colorScheme="gray"
                  onClick={() => {
                    setSearchTerm(null)
                    onClose()
                  }}
                >
                  リセット
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  )
}
