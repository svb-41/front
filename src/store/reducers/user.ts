import { Reducer } from 'redux'
import {
  UPDATE_USER,
  UPDATE_USER_ID,
  UPDATE_COLOR,
  UNLOCK_REWARDS,
  SAVE_FLEET_CONFIG,
  LOGIN,
  Rewards,
} from '@/store/actions/user'
import { Color } from '@/lib/color'
import { Data } from '@/components/fleet-manager'
import { IdToken } from '@auth0/auth0-react'

export type User = string | null

export type State = {
  id: User | null
  unlockedShips: Array<string>
  unlockedMissions: Array<string>
  color: Color
  fleetConfigs: { [id: string]: Data }
  user: null | {
    username: string
    idToken: IdToken | undefined
    accessToken: any
  }
}

const init: State = {
  id: null,
  unlockedShips: [],
  unlockedMissions: [],
  color: Color.GREEN,
  fleetConfigs: {},
  user: null,
}

export type Action =
  | { type: 'user/LOAD_ID'; id: string }
  | { type: 'user/UPDATE_COLOR'; color: Color }
  | { type: 'user/UNLOCK_REWARDS'; rewards: Rewards }
  | { type: 'user/SAVE_FLEET_CONFIG'; conf: { data: Data; id: string } }
  | {
      type: 'user/LOGIN'
      idToken: IdToken | undefined
      accessToken: any
      username: string
    }
  | {
      type: 'user/LOAD_USER'
      unlockedShips: Array<string>
      unlockedMissions: Array<string>
      color: Color
      fleetConfigs: { [id: string]: Data }
    }

const unique = <T>(arr: T[]): T[] => [...new Set(arr)]

export const reducer: Reducer<State, Action> = (state = init, action) => {
  switch (action.type) {
    case LOGIN: {
      const { idToken, accessToken, username } = action
      const user = { username, idToken, accessToken }
      return { ...state, id: accessToken.sub, user }
    }
    case UPDATE_USER_ID: {
      const { id } = action
      return { ...state, id }
    }
    case UPDATE_USER: {
      const { unlockedShips, unlockedMissions, color, fleetConfigs } = action
      return { ...state, unlockedShips, unlockedMissions, color, fleetConfigs }
    }
    case UPDATE_COLOR: {
      const { color } = action
      return { ...state, color }
    }
    case SAVE_FLEET_CONFIG: {
      const { conf } = action
      const fleetConfigs = { ...state.fleetConfigs, [conf.id]: conf.data }
      return { ...state, fleetConfigs }
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
