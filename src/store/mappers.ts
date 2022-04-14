import type { State } from './types'

export const preferences = {
  fromState(state: State) {
    const { user } = state
    const { color, unlockedMissions, unlockedShips } = user
    return {
      color,
      ais: state.ai.ais.map(ai => ai.id),
      favoritesAI: state.ai.favorites,
      fleetConfigs: Object.keys(state.user.fleetConfigs),
      unlockedMissions,
      unlockedShips,
    }
  },
}

export const ais = {
  fromState(state: State) {
    return state.ai.ais.reduce((all, ai) => {
      const { id, createdAt, updatedAt, description, tags, file } = ai
      const { path, language } = file
      const f = { language, path }
      const metadata = { createdAt, updatedAt, description, tags }
      const serialized = { ...metadata, ...f }
      return { ...all, [id]: serialized }
    }, {} as { [id: string]: any })
  },
}

export const fleetConfigs = {
  fromState(state: State) {
    const arr = Object.entries(state.user.fleetConfigs)
    return arr.reduce((acc, [id, data]) => {
      return { ...acc, [id]: JSON.stringify(data) }
    }, {} as { [id: string]: string })
  },
}

export const fromSync = (data: any) => {}
