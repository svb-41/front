import { Reducer } from 'redux'
import {
  UPDATE_USER,
  UPDATE_USER_ID,
  UPDATE_COLOR,
  UNLOCK_REWARDS,
} from '@/store/actions/user'

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
  unlockedShips: [],
  unlockedMissions: [],
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
  | {
      type: 'user/UNLOCK_REWARDS'
      rewards: {
        ships: Array<string>
        missions: Array<string>
      }
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
    case UNLOCK_REWARDS: {
      const { rewards } = action
      return {
        ...state,
        unlockedShips: [...new Set([...state.unlockedShips, ...rewards.ships])],
        unlockedMissions: [
          ...new Set([...state.unlockedMissions, ...rewards.missions]),
        ],
      }
    }
    default:
      return state
  }
}
