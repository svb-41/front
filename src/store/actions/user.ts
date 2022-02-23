import { Effect } from '@/store/types'
import { Color } from '@/store/reducers/user'

export const UPDATE_USER_ID = 'user/LOAD_ID'
export const UPDATE_USER = 'user/LOAD_USER'
export const UPDATE_COLOR = 'user/UPDATE_COLOR'

export const changeColor: (color: Color) => Effect<void> =
  (color: Color) => async dispatch => {
    dispatch({ type: UPDATE_COLOR, color })
  }
