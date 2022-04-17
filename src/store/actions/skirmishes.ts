import { Effect } from '@/store/types'
import { Data } from '@/components/fleet-manager'
import * as services from '@/services'
import * as actions from '@/store/actions'

export const SELECT_FLEET = 'skirmishes/SELECT_FLEET'
export const REPLACE_SKIRMISHES = 'skirmishes/REPLACE_SKIRMISHES'

export const selectFleet = (
  cid: string,
  size: 'small' | 'huge'
): Effect<void> => {
  return async (dispatch, getState) => {
    const state = getState()
    if (!!state.user.fleetConfigs[cid]) {
      dispatch({ type: SELECT_FLEET, cid, size })
    }
    await dispatch(actions.user.sync)
    const newState = getState()
    const accessToken = newState.user.user?.accessToken
    const { fleets } = newState.skirmishes
    if (accessToken) await services.skirmishes.save(fleets, accessToken)
  }
}

export const fight = (
  username: string,
  size: 'small' | 'huge'
): Effect<Data | null> => {
  return async (_dispatch, getState) => {
    const accessToken = getState().user.user?.accessToken
    if (!accessToken) return null
    const result = await services.skirmishes.fight(username, size, accessToken)
    return result
  }
}
