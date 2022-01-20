import { createStore, applyMiddleware, combineReducers } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import thunk from 'redux-thunk'
import * as user from '@/store/reducers/user'

const reducer = combineReducers({
  user: user.reducer,
})

const composer = composeWithDevTools(applyMiddleware(thunk))
export const store = createStore(reducer, composer)
