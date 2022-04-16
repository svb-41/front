import { Reducer } from 'redux'
import { SELECT_FLEET, REPLACE_SKIRMISHES } from '@/store/actions/skirmishes'

export type State = {
  fleets: {
    small: string | null
    huge: string | null
  }
  stats: {
    victories: number
    defeats: number
  }
}

const init: State = {
  fleets: {
    small: null,
    huge: null,
  },
  stats: {
    victories: 0,
    defeats: 0,
  },
}

export type Action =
  | { type: 'skirmishes/REPLACE_SKIRMISHES'; skirmishes: State }
  | { type: 'skirmishes/SELECT_FLEET'; cid: string; size: 'small' | 'huge' }

export const reducer: Reducer<State, Action> = (state = init, action) => {
  switch (action.type) {
    case REPLACE_SKIRMISHES: {
      return action.skirmishes
    }
    case SELECT_FLEET: {
      const { size, cid } = action
      const fleets = { ...state.fleets, [size]: cid }
      return { ...state, fleets }
    }
    default:
      return state
  }
}
