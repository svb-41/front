import { Effect } from '@/store/types'
import { Data } from '@/components/fleet-manager'
import * as services from '@/services'
import * as actions from '@/store/actions'

export const SELECT_FLEET = 'skirmishes/SELECT_FLEET'
export const REPLACE_SKIRMISHES = 'skirmishes/REPLACE_SKIRMISHES'
export const UPDATE_WON = 'skirmishes/UPDATE_WON'
export const UPDATE_STATS = 'skirmishes/UPDATE_STATS'
export const UPDATE_FLEETS = 'skirmishes/UPDATE_FLEETS'

export const selectFleet = (
  cid: string,
  size: 'small' | 'huge'
): Effect<void> => {
  return async (dispatch, getState) => {
    const state = getState()
    if (!!state.user.fleetConfigs[cid]) {
      dispatch({ type: SELECT_FLEET, cid, size })
      await dispatch(actions.user.sync)
      const newState = getState()
      const accessToken = newState.user.user?.accessToken
      const { fleets } = newState.skirmishes
      if (accessToken) await services.skirmishes.save(fleets, accessToken)
    }
  }
}

export type Fight = {
  fleet: Data
  ais: services.ais.FetchedAI[]
  team: string
}
export const fight = (
  username: string,
  size: 'small' | 'huge'
): Effect<Fight | null> => {
  return async (_dispatch, getState) => {
    const accessToken = getState().user.user?.accessToken
    if (!accessToken) return null
    const result = await services.skirmishes.fight(username, size, accessToken)
    const fleet: Data | null = result
    if (!fleet) return null
    const team = await services.skirmishes.profile(username)
    const ids = fleet.ais.map(ai => ai.aid)
    const dedup = ids.filter((ai, index) => ids.indexOf(ai) === index)
    const ais = await Promise.all(
      dedup.map(async id => services.ais.getAI({ uid: username, id }))
    )
    return { fleet, ais, team }
  }
}

export const updateStat = (won: boolean): Effect<void> => {
  return async (dispatch, getState) => {
    dispatch({ type: UPDATE_WON, won })
    const state = getState()
    const accessToken = state.user.user?.accessToken
    const { stats } = state.skirmishes
    if (accessToken) await services.skirmishes.updateStats(stats, accessToken)
  }
}
