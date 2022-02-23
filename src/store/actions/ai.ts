import { Effect } from '@/store/types'
import { AI } from '@/store/reducers/ai'
import { compile, Compile } from '@/services/compile'

export const LOAD_AI = 'ai/LOAD_AI'
export const UPDATE_AI = 'ai/UPDATE_AI'
export const DELETE_AI = 'ai/DELETE_AI'

const defaultAI = (id: string): AI => ({
  id,
  file: { language: 'typescript', code: '', path: 'new.ts', id },
  updatedAt: new Date(),
  createdAt: new Date(),
  tags: [],
})

export const createAI: (id: string) => Effect<void> =
  (id: string) => async dispatch => {
    dispatch({ type: UPDATE_AI, id, ai: defaultAI(id) })
  }

export const updateAI: (ai: AI) => Effect<void> =
  (ai: AI) => async dispatch => {
    ai.updatedAt = new Date()
    dispatch({ type: UPDATE_AI, id: ai.id, ai })
  }

export const deleteAI: (id: string) => Effect<void> =
  (id: string) => async dispatch => {
    dispatch({ type: DELETE_AI, id })
  }

export const compileAI: (ai: AI) => Effect<void> =
  (ai: AI) => async dispatch => {
    const params: Compile = {
      code: ai.file.code,
      uid: ai.id,
      name: ai.file.path,
    }
    const compiledValue: string = await compile(params)
    ai.compiledValue = compiledValue
    dispatch({ type: UPDATE_AI, id: ai.id, ai })
  }
