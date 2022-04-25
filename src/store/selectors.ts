import { State } from './types'
import * as colors from '@/lib/color'

export const userData = (state: State) => state.user
export const userColor = (state: State) => state.user.color
export const missions = (state: State) => state.user.unlockedMissions
export const fleetConfigs = (state: State) => state.user.fleetConfigs
export const preferedFleet = (state: State) => state.user.preferedFleet
export const ai = (id: string) => (state: State) =>
  state.ai.ais.find(ai => ai.id === id)

export const ais = (state: State) => {
  const { ais, favorites, tags } = state.ai
  return { ais, favorites, tags }
}

export const skirmishes = (state: State) => {
  const { stats, fleets } = state.skirmishes
  return { stats, fleets }
}

export const tags = (state: State) => {
  const { tags } = state.ai
  const textColors = Object.fromEntries(
    Object.entries(tags).map(([tag, color]) => {
      return [tag, colors.isDark(color) ? 'var(--white)' : 'var(--black)']
    })
  )
  return { tags, textColors }
}
