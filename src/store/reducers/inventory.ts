import { Reducer } from 'redux'
import { LOAD } from '@/store/actions/inventory'

export type State = {
  items: Stuff[]
  favoritesItems: string[]
}

const init: State = {
  items: [],
  favoritesItems: [],
}

export type Stuff = {
  id: string
  createdAt: string
  type: string
  category: string
  used: boolean
  owner: string
  image?: string
  ownStats?: any
  version?: string
}

export type Action = {
  type: 'inventory/LOAD'
  items: Stuff[]
  favoritesItems: string[]
}

export const reducer: Reducer<State, Action> = (state = init, action) => {
  switch (action.type) {
    case LOAD: {
      const { items, favoritesItems } = action
      return { ...state, items, favoritesItems }
    }
    default:
      return state
  }
}
