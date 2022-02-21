import { Reducer } from 'redux'
import { LOAD_AI, UPDATE_AI, DELETE_AI } from '@/store/actions/ai'
import * as local from '@/services/localStorage'

export type State = {
  ais: Array<AI>
}

export type AI = {
  id: string
  code: string
  updatedAt: Date
  createdAt: Date
  tags: Array<string>
}

const init: State = {
  ais: [],
}

export type Action =
  | { type: 'ai/LOAD_AI'; ais: Array<AI> }
  | { type: 'ai/UPDATE_AI'; id: string; ai: AI }
  | { type: 'ai/DELETE_AI'; id: string }

const setAllAIs = (ais: Array<AI>) => ais.map(local.setAI)

export const reducer: Reducer<State, Action> = (state = init, action) => {
  switch (action.type) {
    case LOAD_AI: {
      const { ais } = action
      setAllAIs(ais)
      return { ...state, ais }
    }
    case UPDATE_AI: {
      const i =
        state.ais.findIndex(ai => ai.id === action.id) ?? state.ais.length
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
    default:
      return state
  }
}
