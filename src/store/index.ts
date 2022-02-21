import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'
import * as user from '@/store/reducers/user'
import * as ai from '@/store/reducers/ai'
import * as Types from '@/store/types'
import * as local from '@/services/localStorage'

const reducer = combineReducers({
  user: user.reducer,
  ai: ai.reducer,
})

const saveLocal = (store: any) => (next: any) => (action: any) => {
  const value = next(action)
  const state: Types.State = store.getState()
  local.setUser(state.user.id!, {
    missions: state.user.unlockedMissions,
    ships: state.user.unlockedShips,
    color: state.user.color,
    ais: state.ai.ais.map(ai => ai.id),
  })
  return value
}

const composer = composeWithDevTools(applyMiddleware(thunk, saveLocal))
export const store = createStore(reducer, composer)
