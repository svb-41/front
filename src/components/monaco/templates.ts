const paths = ['assault.ts', 'dance.ts', 'forward.ts', 'hold.ts', 'torpedo.ts']

export type Template = { path: string; content: string }
export const all = async (): Promise<Template[]> => {
  return await Promise.all(
    paths.map(async path => {
      const res = await fetch(`/controllers/${path}`)
      const content = await res.text()
      return { path, content }
    })
  )
}
