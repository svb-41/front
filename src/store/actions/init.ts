import {
  UPDATE_USER_ID,
  UPDATE_USER,
  UPDATE_PREFERED_FLEET,
} from '@/store/actions/user'
import * as local from '@/services/localStorage'
import { LOAD_AI, LOAD_FAVORITE_AIS, UPDATE_TAGS } from '@/store/actions/ai'
import { REPLACE_SKIRMISHES } from '@/store/actions/skirmishes'
import { AI } from '@/lib/ai'
import { Effect } from '@/store/types'
import { Color } from '@/lib/color'

const defaultUser: local.StoredData = {
  onboarded: false,
  missions: ['0'],
  ships: ['fighter'],
  ais: [],
  favoriteAIS: [],
  color: Color.BLUE,
  fleetConfigs: {},
  tags: {},
  skirmishes: {
    fleets: {
      small: null,
      huge: null,
    },
    stats: {
      victories: 0,
      defeats: 0,
    },
  },
}

export const initStore: Effect<void> = async dispatch => {
  const id = local.getUid()
  if (id) {
    const data = local.getUser(id) ?? defaultUser
    dispatch({ type: UPDATE_USER_ID, id })
    //@ts-ignore
    const ais: Array<AI> = data.ais.map(local.getAI).filter(ai => ai)
    const favorites = data.favoriteAIS ?? local.favoriteAIS()
    dispatch({ type: LOAD_AI, ais })
    dispatch({ type: LOAD_FAVORITE_AIS, favorites })
    dispatch({ type: REPLACE_SKIRMISHES, skirmishes: data.skirmishes })
    dispatch({ type: UPDATE_TAGS, tags: data.tags ?? {} })
    if (data.preferedFleet)
      dispatch({ type: UPDATE_PREFERED_FLEET, fid: data.preferedFleet })
    dispatch({
      type: UPDATE_USER,
      unlockedShips: data.ships,
      unlockedMissions: data.missions,
      color: data.color,
      fleetConfigs: data.fleetConfigs,
      onboarded: data.onboarded,
    })
  }
}
