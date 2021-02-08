export const trimCommentForFlow = (s: string) => {
  return s
    .replace(/https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+\s?/g, "") // URL削除
    .replace(/#.+\s?/g, "") // ハッシュタグ削除
}
