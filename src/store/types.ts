import { ThunkAction, ThunkDispatch } from 'redux-thunk'
import * as user from './reducers/user'

export type State = {
  user: user.State
}

export type Action = user.Action //| canvas.Action
export type Return<Value> = Value | Promise<Value>
export type Effect<Value> = ThunkAction<Return<Value>, State, unknown, Action>
export type Dispatch = ThunkDispatch<State, unknown, Action>
