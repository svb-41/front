import { Effect } from '@/store/types'
import { Color } from '@/lib/color'
import { Data } from '@/components/fleet-manager'
import { v4 as uuid } from 'uuid'
import { IdToken } from '@auth0/auth0-react'
import * as mappers from '@/store/mappers'
import * as data from '@/services/data'
import * as ai from '@/store/actions/ai'
import * as local from '@/services/localStorage'
import * as skirmishes from '@/services/skirmishes'

export const UPDATE_USER_ID = 'user/LOAD_ID'
export const UPDATE_USER = 'user/LOAD_USER'
export const UPDATE_COLOR = 'user/UPDATE_COLOR'
export const UNLOCK_REWARDS = 'user/UNLOCK_REWARDS'
export const SAVE_FLEET_CONFIG = 'user/SAVE_FLEET_CONFIG'
export const LOGIN = 'user/LOGIN'
export const RESET = 'user/RESET'

export const changeColor: (color: Color) => Effect<void> = (color: Color) => {
  return async dispatch => {
    dispatch({ type: UPDATE_COLOR, color })
  }
}

export type Rewards = { ships: Array<string>; missions: Array<string> }
export const unlockRewards = (rewards: Rewards): Effect<void> => {
  return async dispatch => {
    dispatch({ type: UNLOCK_REWARDS, rewards })
  }
}

export const saveFleetConfig = (data: Data, cid?: string): Effect<string> => {
  return async dispatch => {
    const id = cid ?? uuid()
    dispatch({ type: SAVE_FLEET_CONFIG, conf: { id, data } })
    return id
  }
}

export const sync: Effect<void> = async (_, getState) => {
  const state = getState()
  const accessToken = state.user.user?.accessToken
  if (!accessToken) return
  const body = {
    preferences: mappers.preferences.fromState(state),
    ais: mappers.ais.fromState(state),
    fleetConfigs: mappers.fleetConfigs.fromState(state),
  }
  await data.sync(accessToken, body)
}

export const fetchData: Effect<void> = async (dispatch, getState) => {
  const state = getState()
  const accessToken = state.user.user?.accessToken
  const id = state.user.user?.idToken?.sub
  if (!accessToken || !id) return
  const response = await data.fetchData(accessToken)
  if (response) {
    const { preferences, fleetConfigs, ais } = response
    dispatch(ai.fetchAIs(ais, id, accessToken))
    const parsedFleetConfigs = mappers.parseFleetConfigs(fleetConfigs)
    dispatch({
      type: UPDATE_USER,
      unlockedShips: preferences.unlockedShips,
      unlockedMissions: preferences.unlockedMissions,
      color: mappers.stringToColor(preferences.color),
      fleetConfigs: parsedFleetConfigs,
    })
    const stats = await skirmishes.getStats(accessToken)
    dispatch({ type: 'skirmishes/UPDATE_STATS', stats })
  }
}

export const login = (
  idToken: IdToken | undefined,
  accessToken: any,
  username: string
): Effect<void> => {
  return async dispatch => {
    dispatch({ type: LOGIN, idToken, accessToken, username })
    if (idToken) local.setUserId(idToken?.sub)
    await dispatch(fetchData)
    await dispatch(sync)
  }
}

export const logout: Effect<void> = async dispatch => {
  local.reset()
  dispatch({ type: RESET })
}
