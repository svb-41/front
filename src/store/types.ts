import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import * as user from './reducers/user'
import * as ai from './reducers/ai'
import * as skirmishes from './reducers/skirmishes'
import * as cross from './reducers/cross'

export type State = {
  user: user.State
  ai: ai.State
  skirmishes: skirmishes.State
}

export type Action = user.Action | ai.Action | skirmishes.Action | cross.Action
export type Return<Value> = Value | Promise<Value>
export type Effect<Value> = ThunkAction<Return<Value>, State, unknown, Action>
export type Dispatch = ThunkDispatch<State, unknown, Action>
