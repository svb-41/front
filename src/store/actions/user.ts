import { Effect } from '@/store/types'
import { getUid, getUser } from '@/services/localStorage'

export const UPDATE_USER_ID = 'user/LOAD_ID'
export const UPDATE_USER = 'user/LOAD_USER'

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
