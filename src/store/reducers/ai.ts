import { Reducer } from 'redux'
import {
  LOAD_AI,
  UPDATE_AI,
  DELETE_AI,
  LOAD_FAVORITE_AIS,
  SET_FAVORITE,
  DEL_FAVORITE,
  ADD_TAG,
  UPDATE_TAGS,
  DELETE_TAGS,
} from '@/store/actions/ai'
import * as local from '@/services/localStorage'
import { AI } from '@/lib/ai'

export type State = {
  ais: Array<AI>
  favorites: string[]
  tags: { [key: string]: string }
}

const init: State = {
  ais: [],
  favorites: [],
  tags: {},
}

export type Action =
  | { type: 'ai/LOAD_AI'; ais: Array<AI> }
  | { type: 'ai/UPDATE_AI'; id: string; ai: AI }
  | { type: 'ai/DELETE_AI'; id: string }
  | { type: 'ai/LOAD_FAVORITE_AIS'; favorites: string[] }
  | { type: 'ai/SET_FAVORITE'; fav: string }
  | { type: 'ai/ADD_TAG'; name: string; color: string }
  | { type: 'ai/UPDATE_TAGS'; tags: { [key: string]: string } }
  | { type: 'ai/DEL_FAVORITE'; fav: string }
  | { type: 'ai/DELETE_TAGS'; tags: string[] }

const setAllAIs = (ais: Array<AI>) => ais.map(local.setAI)

export const reducer: Reducer<State, Action> = (state = init, action) => {
  switch (action.type) {
    case ADD_TAG: {
      const tags = { ...state.tags, [action.name]: action.color }
      return { ...state, tags }
    }
    case UPDATE_TAGS: {
      const tags = { ...action.tags, ...(state.tags ?? {}) }
      return { ...state, tags }
    }
    case DELETE_TAGS: {
      const tags = { ...state.tags }
      action.tags.forEach(tag => delete tags[tag])
      const ais = state.ais.map(ai => {
        const tags = ai.tags.filter(tag => !action.tags.includes(tag))
        return { ...ai, tags }
      })
      setAllAIs(ais)
      return { ...state, tags, ais }
    }
    case LOAD_AI: {
      const oldAis = state.ais
      const newAis = action.ais.filter(ai => !oldAis.find(a => a.id === ai.id))
      const ais = [...newAis, ...oldAis]
      setAllAIs(ais)
      return { ...state, ais }
    }
    case UPDATE_AI: {
      const index = state.ais.findIndex(ai => ai.id === action.id)
      const i = index === -1 ? state.ais.length : index
      state.ais[i] = action.ai
      const ais = [...state.ais]
      setAllAIs(ais)
      return { ...state, ais }
    }
    case DELETE_AI: {
      const ais = [...state.ais.filter(({ id }) => id !== action.id)]
      local.deleteAI(action.id)
      return { ...state, ais }
    }
    case LOAD_FAVORITE_AIS: {
      const { favorites } = action
      return { ...state, favorites }
    }
    case SET_FAVORITE: {
      const { fav } = action
      if (state.favorites.includes(fav)) return state
      const favorites = [...state.favorites, fav]
      return { ...state, favorites }
    }
    case DEL_FAVORITE: {
      const { fav } = action
      const favorites = state.favorites.filter(f => f !== fav)
      return { ...state, favorites }
    }
    default:
      return state
  }
}
