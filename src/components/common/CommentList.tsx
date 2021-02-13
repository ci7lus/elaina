import dayjs from "dayjs"
import React, { memo, useRef, useState } from "react"
import { useDebounce } from "react-use"
import twemoji from "twemoji"
import { CommentPayload } from "../../types/struct"
import {
  Item,
  ItemParams,
  Menu,
  Separator,
  useContextMenu,
  animation,
} from "react-contexify"
import { useToasts } from "react-toast-notifications"
import "react-contexify/dist/ReactContexify.css"

const menuId = "comments-menu"

const Comment: React.VFC<{
  comment: CommentPayload
  setComment: React.Dispatch<React.SetStateAction<CommentPayload | null>>
}> = memo(({ comment, setComment }) => {
  const time = dayjs(comment.time * 1000 + comment.timeMs)

  const { show } = useContextMenu({
    id: menuId,
  })
  const displayMenu = (e: React.MouseEvent) => {
    setComment(comment)
    show(e, { props: comment })
  }
  return (
    <div
      className="flex items-center space-x-1 w-full hover:bg-gray-200 select-none"
      onContextMenu={displayMenu}
      onClick={displayMenu}
    >
      <p
        className="truncate inline-block flex-shrink-0 p-1 border-r border-gray-400 w-14 text-center"
        title={time.format()}
      >
        {time.format("mm:ss")}
      </p>
      <p
        className="p-1 truncate inline-block"
        title={comment.text} // emoji
        dangerouslySetInnerHTML={{ __html: twemoji.parse(comment.text) }}
      ></p>
    </div>
  )
})

export const CommentList: React.VFC<{
  comments: CommentPayload[]
  isAutoScrollEnabled: boolean
}> = ({ comments, isAutoScrollEnabled }) => {
  const ref = useRef<HTMLDivElement>(null)
  useDebounce(
    () => {
      if (ref.current && isAutoScrollEnabled === true) {
        ref.current.scrollTo({
          top: ref.current.scrollHeight,
          behavior: "smooth",
        })
      }
    },
    50,
    [comments]
  )

  const toast = useToasts()

  const [ctxComment, setCtxComment] = useState<CommentPayload | null>(null)

  async function handleItemClick({
    event,
    props,
    data,
    triggerEvent,
  }: ItemParams<CommentPayload, unknown>) {
    if (!props) return
    switch (event.currentTarget.id) {
      case "copyComment":
        try {
          await navigator.clipboard.writeText(props.text)
          toast.addToast("コメントをコピーしました", {
            appearance: "success",
            autoDismiss: true,
          })
        } catch (error) {
          console.error(error)
        }
        break
      case "copyAuthor":
        try {
          await navigator.clipboard.writeText(props.author)
          toast.addToast("オーサーをコピーしました", {
            appearance: "success",
            autoDismiss: true,
          })
        } catch (error) {
          console.error(error)
        }
        break
      case "copyTime":
        try {
          await navigator.clipboard.writeText(
            dayjs(props.time * 1000 + props.timeMs).format()
          )
          toast.addToast("投稿時間をコピーしました", {
            appearance: "success",
            autoDismiss: true,
          })
        } catch (error) {
          console.error(error)
        }
        break
    }
  }

  return (
    <div
      className="scrollbar-w-1-200-600 block overflow-scroll overflow-y-scroll text-sm h-full"
      ref={ref}
    >
      {comments.map((i, idx) => (
        <Comment key={idx} comment={i} setComment={setCtxComment} />
      ))}
      <Menu
        id={menuId}
        animation={animation.fade}
        style={{ right: 0, left: "unset" }}
      >
        <Item id="copyComment" onClick={handleItemClick}>
          <p
            title={ctxComment?.text}
            dangerouslySetInnerHTML={{
              __html: twemoji.parse(ctxComment?.text || ""),
            }}
          ></p>
        </Item>
        <Separator />
        <Item id="copyAuthor" onClick={handleItemClick}>
          {ctxComment?.author}
        </Item>
        <Item id="copyTime" onClick={handleItemClick}>
          {ctxComment &&
            dayjs(ctxComment.time * 1000 + ctxComment.timeMs).format()}
        </Item>
        <Item id="copySource" disabled>
          {ctxComment &&
            (ctxComment?.sourceUrl ? (
              <a href={ctxComment.sourceUrl} target="_blank">
                {ctxComment.source}
              </a>
            ) : (
              ctxComment.source
            ))}
        </Item>
      </Menu>
    </div>
  )
}
