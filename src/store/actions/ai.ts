import { Effect } from '@/store/types'
import { AI } from '@/store/reducers/ai'

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
    dispatch({ type: UPDATE_AI, id: ai.id, ai })
  }

export const deleteAI: (id: string) => Effect<void> =
  (id: string) => async dispatch => {
    dispatch({ type: DELETE_AI, id })
  }
