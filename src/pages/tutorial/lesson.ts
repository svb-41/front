export type Lesson = {
  title: string
  fullscreen?: boolean
  content: (
    | { type: 'explanations'; content: string }
    | {
        type: 'scenario' | 'fight'
        ais: string[]
        mission: string
        ships: {
          shipClass: string
          id: string
          x: number
          y: number
          rotation: number
        }[]
      }
  )[]
}

export const lessons: Lesson[] = []
const lessons_ = import.meta.globEager('./lessons/*.json')

const byId = (array: any[], inputs: { [key: string]: any }) => {
  Object.entries(inputs).forEach(([name, content]) => {
    const idx = name.match(/[0-9]+/)
    if (idx) array[parseInt(idx[0])] = content as any
  })
}

byId(lessons, lessons_)
