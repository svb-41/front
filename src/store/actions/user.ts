import { Effect } from '@/store/types'
import { Color } from '@/store/reducers/user'

export const UPDATE_USER_ID = 'user/LOAD_ID'
export const UPDATE_USER = 'user/LOAD_USER'
export const UPDATE_COLOR = 'user/UPDATE_COLOR'
export const UNLOCK_REWARDS = 'user/UNLOCK_REWARDS'

export const changeColor: (color: Color) => Effect<void> =
  (color: Color) => async dispatch => {
    dispatch({ type: UPDATE_COLOR, color })
  }

export const unlockRewards: (rewards: {
  ships: Array<string>
  missions: Array<string>
}) => Effect<void> =
  (rewards: { ships: Array<string>; missions: Array<string> }) =>
  async dispatch => {
    dispatch({ type: UNLOCK_REWARDS, rewards })
  }
