import dayjs from "dayjs"
import React, { memo, useCallback, useRef } from "react"
import { useDebounce } from "react-use"
import twemoji from "twemoji"
import { CommentPayload } from "../../types/struct"

const Comment: React.VFC<{ comment: CommentPayload }> = memo(({ comment }) => {
  const time = dayjs(comment.time * 1000)
  return (
    <div className="flex items-center space-x-1 w-full hover:bg-gray-200 select-none">
      <p
        className="truncate inline-block flex-shrink-0 p-1 border-r border-gray-400 w-20 text-center"
        title={time.format()}
      >
        {time.format("HH:mm:ss")}
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
  return (
    <div
      className="playerCommentList block overflow-scroll overflow-y-scroll text-sm h-full"
      ref={ref}
    >
      {comments
        .sort((a, b) => (b.time < a.time ? 1 : -1))
        .map((i, idx) => (
          <Comment key={idx} comment={i} />
        ))}
    </div>
  )
}
