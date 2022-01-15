export declare global {
  interface Navigator {
    writeText: AsyncClipboardWriteFunction
  }

  interface Clipboard {
    write: AsyncClipboardWriteFunction
  }
}
