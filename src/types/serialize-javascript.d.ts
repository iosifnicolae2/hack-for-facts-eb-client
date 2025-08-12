declare module 'serialize-javascript' {
  export interface SerializeJavascriptOptions {
    readonly isJSON?: boolean
    readonly space?: number
    readonly unsafe?: boolean
  }

  export default function serialize(
    value: unknown,
    options?: SerializeJavascriptOptions
  ): string
}


