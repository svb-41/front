import { State } from './types'
export const userData = (state: State) => state.user
export const userColor = (state: State) => state.user.color
export const missions = (state: State) => state.user.unlockedMissions
export const fleetConfigs = (state: State) => state.user.fleetConfigs
export const ai = (id: string) => (state: State) =>
  state.ai.ais.find(ai => ai.id === id)

export const ais = (state: State) => {
  const { ais, favorites } = state.ai
  return { ais, favorites }
}
