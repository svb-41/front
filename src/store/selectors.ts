import { State } from './types'
export const userData = (state: State) => state.user
export const missions = (state: State) => state.user.unlockedMissions
