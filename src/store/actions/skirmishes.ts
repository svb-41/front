import { Effect } from '@/store/types'

export const SELECT_FLEET = 'skirmishes/SELECT_FLEET'
export const REPLACE_SKIRMISHES = 'skirmishes/REPLACE_SKIRMISHES'

export const selectFleet = (
  cid: string,
  size: 'small' | 'huge'
): Effect<void> => {
  return async (dispatch, getState) => {
    const state = getState()
    console.log(cid)
    if (!!state.user.fleetConfigs[cid]) {
      dispatch({ type: SELECT_FLEET, cid, size })
    }
  }
}
