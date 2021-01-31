import { useEffect } from "react"
import { useRef, useState } from "react"

export const useRefState = <T>(i: T) => {
  const [state, setState] = useState(i)
  const ref = useRef(state)
  useEffect(() => {
    ref.current = state
  }, [state])

  return [state, setState, ref] as const
}
