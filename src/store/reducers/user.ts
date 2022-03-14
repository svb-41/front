import { Reducer } from 'redux'
import {
  UPDATE_USER,
  UPDATE_USER_ID,
  UPDATE_COLOR,
  UNLOCK_REWARDS,
  Rewards,
} from '@/store/actions/user'
import { Color } from '@/lib/color'

export type User = string | null

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
  | { type: 'user/LOAD_ID'; id: string }
  | { type: 'user/UPDATE_COLOR'; color: Color }
  | { type: 'user/UNLOCK_REWARDS'; rewards: Rewards }
  | {
      type: 'user/LOAD_USER'
      unlockedShips: Array<string>
      unlockedMissions: Array<string>
    }

const unique = <T>(arr: T[]): T[] => [...new Set(arr)]

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
      const { ships, missions } = rewards
      const unlockedShips = unique([...state.unlockedShips, ...ships])
      const unlockedMissions = unique([...state.unlockedMissions, ...missions])
      return { ...state, unlockedShips, unlockedMissions }
    }
    default:
      return state
  }
}
