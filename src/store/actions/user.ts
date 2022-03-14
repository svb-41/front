import { Effect } from '@/store/types'
import { Color } from '@/lib/color'

export const UPDATE_USER_ID = 'user/LOAD_ID'
export const UPDATE_USER = 'user/LOAD_USER'
export const UPDATE_COLOR = 'user/UPDATE_COLOR'
export const UNLOCK_REWARDS = 'user/UNLOCK_REWARDS'

export const changeColor: (color: Color) => Effect<void> = (color: Color) => {
  return async dispatch => {
    dispatch({ type: UPDATE_COLOR, color })
  }
}

export type Rewards = { ships: Array<string>; missions: Array<string> }
export const unlockRewards: (rewards: Rewards) => Effect<void> = rewards => {
  return async dispatch => {
    dispatch({ type: UNLOCK_REWARDS, rewards })
  }
}
