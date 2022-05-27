import { Effect, Action } from '@/store/types'
import { AI } from '@/lib/ai'
import { File } from '@/components/monaco'
import { compile, Compile, getAI } from '@/services/ais'
import templateAI from '@/default-controllers/assets.json'
import { ResponseAIS } from '@/services/data'
import * as mappers from '@/store/mappers'
import * as colors from '@/lib/color'
import * as actions from '@/store/actions/user'

export const LOAD_AI = 'ai/LOAD_AI'
export const UPDATE_AI = 'ai/UPDATE_AI'
export const DELETE_AI = 'ai/DELETE_AI'
export const LOAD_FAVORITE_AIS = 'ai/LOAD_FAVORITE_AIS'
export const SET_FAVORITE = 'ai/SET_FAVORITE'
export const DEL_FAVORITE = 'ai/DEL_FAVORITE'
export const ADD_TAG = 'ai/ADD_TAG'
export const UPDATE_TAGS = 'ai/UPDATE_TAGS'
export const DELETE_TAGS = 'ai/DELETE_TAGS'

const defaultAI = (id: string): AI => {
  const createdAt = new Date()
  const code = templateAI.assault
  const file: File = { language: 'typescript', code, path: 'new.ts' }
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
  return async (dispatch, getState) => {
    const { user } = getState()
    const uid = user.user?.idToken?.sub ?? user.id
    if (uid) {
      const { code, path: name } = ai.file
      const params: Compile = { code, uid, name, id: ai.id }
      const compiledValue = await compile(params)
      const updatedAt = new Date()
      const { file } = getState().ai.ais.find(a => a.id === ai.id)!
      const newAI = { ...ai, compiledValue, updatedAt, file }
      dispatch({ type: UPDATE_AI, id: ai.id, ai: newAI })
    }
  }
}

export const fetchAIs: (
  ids: ResponseAIS,
  uid: string,
  token?: string
) => Effect<void> = (rais: ResponseAIS, uid: string, token?: string) => {
  return async dispatch => {
    const fetchedAis = await Promise.all(
      Object.entries(rais).map(([id]) => getAI({ uid, id, token }))
    )
    const finalFetched = fetchedAis.flatMap(f => (f ? [f] : []))
    const ais = finalFetched.map(ai => mappers.fetchedAIToAI(ai, rais[ai.id]))
    dispatch({ type: LOAD_AI, ais })
  }
}

export const setFavorite = (fav: string): Action => {
  return { type: SET_FAVORITE, fav }
}

export const delFavorite = (fav: string): Action => {
  return { type: DEL_FAVORITE, fav }
}

export const addTag = (name: string, update?: boolean): Effect<void> => {
  return (dispatch, getState) => {
    const state = getState()
    if (!state.ai.tags[name] || update) {
      const color = colors.generate()
      dispatch({ type: ADD_TAG, name, color })
    }
    dispatch(actions.sync)
  }
}

export const deleteTags = (tags: string[]): Effect<void> => {
  return dispatch => {
    dispatch({ type: DELETE_TAGS, tags })
    dispatch(actions.sync)
  }
}
