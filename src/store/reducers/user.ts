import { Reducer } from 'redux'
import {
  UPDATE_USER,
  UPDATE_USER_ID,
  UPDATE_COLOR,
  UNLOCK_REWARDS,
  SAVE_FLEET_CONFIG,
  UPDATE_PREFERED_FLEET,
  LOGIN,
  RESET,
  Rewards,
} from '@/store/actions/user'
import { Color } from '@/lib/color'
import { Data } from '@/components/fleet-manager'
import { IdToken } from '@auth0/auth0-react'

export type State = {
  id: string | null
  unlockedShips: Array<string>
  unlockedMissions: Array<string>
  color: Color
  fleetConfigs: { [id: string]: Data }
  user: null | {
    username: string
    idToken: IdToken | undefined
    accessToken: any
  }
  onboarded: boolean
  preferedFleet?: string
}

const init: State = {
  id: null,
  unlockedShips: ['fighter', 'scout', 'cruiser'],
  unlockedMissions: ['0'],
  color: Color.GREEN,
  fleetConfigs: {},
  onboarded: true,
  user: null,
}

export type Action =
  | { type: 'user/RESET' }
  | { type: 'user/LOAD_ID'; id: string }
  | { type: 'user/UPDATE_COLOR'; color: Color }
  | { type: 'user/UNLOCK_REWARDS'; rewards: Rewards }
  | { type: 'user/SAVE_FLEET_CONFIG'; conf: { data: Data; id: string } }
  | { type: 'user/UPDATE_PREFERED_FLEET'; fid: string }
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
      onboarded: boolean
    }

const unique = <T>(arr: T[]): T[] => [...new Set(arr)]

export const reducer: Reducer<State, Action> = (state = init, action) => {
  switch (action.type) {
    case LOGIN: {
      const { idToken, accessToken, username } = action
      const user = { username, idToken, accessToken }
      const id = idToken?.sub ?? state.id
      return { ...state, id, user }
    }
    case UPDATE_USER_ID: {
      const { id } = action
      return { ...state, id }
    }
    case UPDATE_PREFERED_FLEET: {
      const preferedFleet = action.fid
      return { ...state, preferedFleet }
    }
    case UPDATE_USER: {
      const { color, onboarded } = action
      const fleetConfigs = { ...state.fleetConfigs, ...action.fleetConfigs }
      const unlockedShips = [
        ...state.unlockedShips,
        ...action.unlockedShips.filter(u => !state.unlockedShips.includes(u)),
      ]
      const unlockedMissions = [
        ...state.unlockedMissions,
        ...action.unlockedMissions.filter(
          u => !state.unlockedMissions.includes(u)
        ),
      ]
      return {
        ...state,
        unlockedShips,
        unlockedMissions,
        color,
        fleetConfigs,
        onboarded,
      }
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
    case RESET: {
      return init
    }
    default:
      return state
  }
}
