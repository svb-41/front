import { Effect } from '@/store/types'
import { Color } from '@/lib/color'
import { Data } from '@/components/fleet-manager'
import { v4 as uuid } from 'uuid'
import { IdToken } from '@auth0/auth0-react'
import * as mappers from '@/store/mappers'

export const UPDATE_USER_ID = 'user/LOAD_ID'
export const UPDATE_USER = 'user/LOAD_USER'
export const UPDATE_COLOR = 'user/UPDATE_COLOR'
export const UNLOCK_REWARDS = 'user/UNLOCK_REWARDS'
export const SAVE_FLEET_CONFIG = 'user/SAVE_FLEET_CONFIG'
export const LOGIN = 'user/LOGIN'

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
  await fetch('http://localhost:3333/data/sync', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(body),
  })
}

// Tables

/// PvP
//// uid <--> config

/// Stats
//// uid, matches, victories, defeats

export const login = (
  idToken: IdToken | undefined,
  accessToken: any,
  username: string,
  shouldSync?: boolean
): Effect<void> => {
  return async dispatch => {
    dispatch({ type: LOGIN, idToken, accessToken, username })
    if (shouldSync) await dispatch(sync)
  }
}
