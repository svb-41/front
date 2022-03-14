import { UPDATE_USER_ID, UPDATE_USER } from '@/store/actions/user'
import * as local from '@/services/localStorage'
import { LOAD_AI, LOAD_FAVORITE_AIS } from '@/store/actions/ai'
import { AI } from '@/lib/ai'
import { Effect } from '@/store/types'
import { Color } from '@/lib/color'

const defaultUser: local.StoredData = {
  missions: ['0'],
  ships: ['fighter'],
  ais: [],
  favoriteAIS: [],
  color: Color.BLUE,
}

export const initStore: Effect<void> = async dispatch => {
  const id = local.getUid()
  const data = local.getUser(id) ?? defaultUser

  dispatch({ type: UPDATE_USER_ID, id })
  //@ts-ignore
  const ais: Array<AI> = data.ais.map(local.getAI).filter(ai => ai)
  const favorites = data.favoriteAIS ?? local.favoriteAIS()
  dispatch({ type: LOAD_AI, ais })
  dispatch({ type: LOAD_FAVORITE_AIS, favorites })
  dispatch({
    type: UPDATE_USER,
    unlockedShips: data.ships,
    unlockedMissions: data.missions,
  })
}
