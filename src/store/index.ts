import { Reducer } from 'redux'
import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'
import * as user from '@/store/reducers/user'
import * as ai from '@/store/reducers/ai'
import * as skirmishes from '@/store/reducers/skirmishes'
import * as cross from '@/store/reducers/cross'
import * as Types from '@/store/types'
import * as local from '@/services/localStorage'

const reducer = combineReducers({
  user: user.reducer,
  ai: ai.reducer,
  skirmishes: skirmishes.reducer,
})

const crossReducer: Reducer<Types.State, Types.Action> = (state, action) => {
  const result = reducer(state, action as any)
  return cross.reducer(result, action as any)
}

const saveLocal = (store: any) => (next: any) => (action: any) => {
  const value = next(action)
  const state: Types.State = store.getState()
  local.setUser(state.user.id!, {
    missions: state.user.unlockedMissions,
    ships: state.user.unlockedShips,
    color: state.user.color,
    ais: state.ai.ais.map(ai => ai.id),
    favoriteAIS: state.ai.favorites,
    tags: state.ai.tags,
    fleetConfigs: state.user.fleetConfigs,
    skirmishes: state.skirmishes,
  })
  return value
}

const composer = composeWithDevTools(applyMiddleware(thunk, saveLocal))
export const store = createStore(crossReducer, composer)
