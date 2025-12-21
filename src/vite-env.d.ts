/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  import type { MDXComponents } from 'mdx/types'

  type MdxContentProps = {
    readonly components?: MDXComponents
  }

  const MDXComponent: ComponentType<MdxContentProps>
  export default MDXComponent
}
