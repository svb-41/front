import { Reducer } from 'redux'
import {
  SELECT_FLEET,
  REPLACE_SKIRMISHES,
  UPDATE_WON,
  UPDATE_STATS,
  UPDATE_FLEETS,
} from '@/store/actions/skirmishes'

export type State = {
  fleets: {
    [id: string]: string | null
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
  | { type: 'skirmishes/SELECT_FLEET'; cid: string; size: string }
  | {
      type: 'skirmishes/UPDATE_FLEETS'
      fleets: { small: string | null; huge: string | null }
    }
  | { type: 'skirmishes/UPDATE_WON'; won: boolean }
  | {
      type: 'skirmishes/UPDATE_STATS'
      stats: { victories: number; defeats: number } | null
    }

export const reducer: Reducer<State, Action> = (state = init, action) => {
  switch (action.type) {
    case REPLACE_SKIRMISHES: {
      return action.skirmishes
    }
    case UPDATE_STATS: {
      const { stats } = action
      if (!stats) return state
      return { ...state, stats }
    }
    case UPDATE_FLEETS: {
      const { fleets } = action
      return { ...state, fleets }
    }
    case UPDATE_WON: {
      const { won } = action
      if (won) {
        return {
          ...state,
          stats: {
            victories: state.stats.victories + 1,
            defeats: state.stats.defeats,
          },
        }
      } else {
        return {
          ...state,
          stats: {
            victories: state.stats.victories,
            defeats: state.stats.defeats + 1,
          },
        }
      }
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
