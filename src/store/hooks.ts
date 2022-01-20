import * as redux from 'react-redux'
import type { State, Dispatch } from './types'

export const useDispatch = () => redux.useDispatch<Dispatch>()
export const useSelector: redux.TypedUseSelectorHook<State> = redux.useSelector
export type { Dispatch }
