import { Reducer } from 'redux'
import type { State } from '@/store/types'

export type Action = { type: 'cross/UPDATE_AFTER_FETCH' }

// @ts-ignore
export const reducer: Reducer<State, Action> = (state, action) => {
  switch (action.type) {
    default:
      return state
  }
}
