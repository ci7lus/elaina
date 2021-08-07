import Interweave from "interweave"
import {
  Email,
  EmailMatcher,
  Hashtag,
  HashtagMatcher,
  Url,
  UrlMatcher,
} from "interweave-autolink"
import React from "react"

export const AutoLinkedText: React.FC<{ children: string }> = ({
  children,
}) => (
  <Interweave
    content={children}
    matchers={[
      new UrlMatcher("url", {}, (args) => <Url newWindow={true} {...args} />),
      new HashtagMatcher("hashtag", {}, (args) => (
        <Hashtag
          hashtagUrl={(url) => `https://twitter.com/hashtag/${url}`}
          newWindow={true}
          {...args}
        />
      )),
      new EmailMatcher("email", {}, (args) => (
        <Email newWindow={true} {...args} />
      )),
    ]}
  />
)
