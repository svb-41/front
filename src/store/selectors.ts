import { State } from './types'
export const userData = (state: State) => state.user
export const missions = (state: State) => state.user.unlockedMissions
export const ais = (state: State) => state.ai.ais
export const ai = (id: string) => (state: State) =>
  state.ai.ais.find(ai => ai.id === id)
