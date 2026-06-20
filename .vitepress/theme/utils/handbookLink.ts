import { withBase } from 'vitepress'

/** Internal handbook path with VitePress base prefix (e.g. /dsa/). */
export function handbookLink(path: string): string {
  return withBase(path)
}