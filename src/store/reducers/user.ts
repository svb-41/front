import { Reducer } from 'redux'
import { UPDATE_USER, UPDATE_USER_ID, UPDATE_COLOR } from '@/store/actions/user'

export type User = string | null
export enum Color {
  BLUE = 'blue',
  RED = 'red',
  YELLOW = 'yellow',
  GREEN = 'green',
  WHITE = 'white',
}

export type State = {
  id: User | null
  unlockedShips: Array<string>
  unlockedMissions: Array<string>
  color: Color
}

const init: State = {
  id: null,
  unlockedShips: ['fighter', 'scout', 'cruiser', 'stealth', 'bomber'],
  unlockedMissions: ['0'],
  color: Color.GREEN,
}

export type Action =
  | {
      type: 'user/LOAD_ID'
      id: string
    }
  | {
      type: 'user/LOAD_USER'
      unlockedShips: Array<string>
      unlockedMissions: Array<string>
    }
  | {
      type: 'user/UPDATE_COLOR'
      color: Color
    }

export const reducer: Reducer<State, Action> = (state = init, action) => {
  switch (action.type) {
    case UPDATE_USER_ID: {
      const { id } = action
      return { ...state, id }
    }
    case UPDATE_USER: {
      const { unlockedShips, unlockedMissions } = action
      return { ...state, unlockedShips, unlockedMissions }
    }
    case UPDATE_COLOR: {
      const { color } = action
      return { ...state, color }
    }
    default:
      return state
  }
}
