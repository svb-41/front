import { Effect, Action } from '@/store/types'
import { AI } from '@/store/reducers/ai'
import { File } from '@/components/monaco'
import { compile, Compile } from '@/services/compile'
import templateAI from '@/default-controllers/assets.json'

export const LOAD_AI = 'ai/LOAD_AI'
export const UPDATE_AI = 'ai/UPDATE_AI'
export const DELETE_AI = 'ai/DELETE_AI'
export const LOAD_FAVORITE_AIS = 'ai/LOAD_FAVORITE_AIS'
export const SET_FAVORITE = 'ai/SET_FAVORITE'
export const DEL_FAVORITE = 'ai/DEL_FAVORITE'

const defaultAI = (id: string): AI => {
  const createdAt = new Date()
  const code = templateAI.hold
  const file: File = { language: 'typescript', code, path: 'new.ts', id }
  return { id, file, updatedAt: createdAt, createdAt, tags: [] }
}

export const createAI: (id: string) => Effect<AI> = (id: string) => {
  return async dispatch => {
    const ai = defaultAI(id)
    dispatch({ type: UPDATE_AI, id, ai })
    return ai
  }
}

export const updateAI: (ai: AI) => Effect<AI> = (ai: AI) => {
  return async dispatch => {
    ai.updatedAt = new Date()
    dispatch({ type: UPDATE_AI, id: ai.id, ai })
    return ai
  }
}

export const deleteAI: (id: string) => Effect<void> = (id: string) => {
  return async dispatch => {
    dispatch({ type: DELETE_AI, id })
  }
}

export const compileAI: (ai: AI) => Effect<void> = (ai: AI) => {
  return async dispatch => {
    const { code, path: name } = ai.file
    const params: Compile = { code, uid: ai.id, name }
    const compiledValue = await compile(params)
    const updatedAt = new Date()
    const newAI = { ...ai, compiledValue, updatedAt }
    dispatch({ type: UPDATE_AI, id: ai.id, ai: newAI })
  }
}

export const setFavorite = (fav: string): Action => {
  return { type: SET_FAVORITE, fav }
}

export const delFavorite = (fav: string): Action => {
  return { type: DEL_FAVORITE, fav }
}
