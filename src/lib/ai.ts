import { File } from '@/components/monaco'

const assets = await import.meta.globEager('../missions/ais/*.json')

export type AI = {
  id: string
  file: File
  updatedAt: Date | string
  createdAt: Date | string
  compiledValue?: string
  tags: Array<string>
  description?: string
  archived?: boolean
}

const entr = Object.entries(assets)
export const fromDefault = (id: string, name: string) => {
  const f = entr.find(([filename]) => filename.includes(name))!
  const code = f[1].default
  return hardcoded(id, code)
}

export const hardcoded = (id: string, code: string): AI => ({
  id,
  updatedAt: new Date(),
  createdAt: new Date(),
  tags: [],
  compiledValue: code,
  file: { language: 'typescript', path: 'strong.ts', code },
})
