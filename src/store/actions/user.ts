import { Effect } from '@/store/types'
import { getUid, getUser } from '@/services/localStorage'
import { Color } from '@/store/reducers/user'

export const UPDATE_USER_ID = 'user/LOAD_ID'
export const UPDATE_USER = 'user/LOAD_USER'
export const UPDATE_COLOR = 'user/UPDATE_COLOR'

export const connectUser: Effect<void> = async dispatch => {
  const id = getUid()
  const data = getUser(id)

  dispatch({ type: UPDATE_USER_ID, id })
  if (data)
    dispatch({
      type: UPDATE_USER,
      unlockedShips: data.ships,
      unlockedMissions: data.missions,
    })
}

export const changeColor: (color: Color) => Effect<void> =
  (color: Color) => async dispatch => {
    dispatch({ type: UPDATE_COLOR, color })
  }
