import type { State } from './types'
import type { Data } from '@/components/fleet-manager'
import { Color } from '@/lib/color'
import { AI } from '@/lib/ai'
import { FetchedAI } from '@/services/ais'

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

export const fromSync = (data: any) => {
  console.log(data)
}

export const parseFleetConfigs = (data: {
  [key: string]: string
}): { [key: string]: Data } =>
  Object.entries(data)
    .map(([key, val]) => [key, JSON.parse(val)])
    .reduce((acc, [key, val]) => ({ ...acc, [key]: val }), {}) as {
    [key: string]: Data
  }

export const stringToColor = (color: string): Color => color as Color

export const fetchedAIToAI = (
  fai: FetchedAI,
  pai: {
    createdAt: string
    path: string
    language: string
    updatedAt: string
    tags: Array<string>
    description?: string
  }
): AI => ({
  id: fai.id,
  file: {
    language: pai.language as 'typescript' | 'javascript' | '?',
    path: pai.path,
    code: fai.ts ?? '',
  },
  updatedAt: pai.updatedAt,
  createdAt: pai.createdAt,
  compiledValue: fai.compiled,
  tags: pai.tags,
  description: pai.description,
})
