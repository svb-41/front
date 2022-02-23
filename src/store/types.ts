import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import * as user from './reducers/user'
import * as ai from './reducers/ai'

export type State = {
  user: user.State
  ai: ai.State
}

export type Action = user.Action | ai.Action
export type Return<Value> = Value | Promise<Value>
export type Effect<Value> = ThunkAction<Return<Value>, State, unknown, Action>
export type Dispatch = ThunkDispatch<State, unknown, Action>
