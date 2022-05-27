import { engine } from '@svb-41/engine'

export const missions: Mission[] = []
export const simulations: Mission[] = []
export const arenas: Arena[] = []

const byId = (array: any[], inputs: { [key: string]: any }) => {
  Object.entries(inputs).forEach(([name, content]) => {
    const idx = name.match(/[0-9]+/)
    if (idx) array[parseInt(idx[0])] = content as any
  })
}

const missions_ = import.meta.globEager('../missions/confs/*.json')
const simulations_ = import.meta.globEager('../pages/ai/simulations/*.json')
const arenas_ = import.meta.globEager('../pages/skirmishes/arenas/*.json')
const ais_ = import.meta.globEager('../missions/ais/*.json')
byId(missions, missions_)
byId(simulations, simulations_)
byId(arenas, arenas_)

const ais: { [key: string]: string } = {}
export const getAI = (id: string) => ais[id] ?? null
for (const [name, content] of Object.entries(ais_)) {
  const filename = name.split('/').reverse()[0]
  const withoutExt = filename.split('.')[0]
  ais[withoutExt] = (content as any).default
}

export const getMission = (id: string): Mission | undefined =>
  missions.find(m => m.id === id)

export const getSimulation = (id: string): Mission | undefined =>
  simulations.find(m => m.id === id)

export const getArena = (id: string): Arena | undefined =>
  arenas.find(m => m.id === id)

export type SerializedShip = {
  classShip: engine.ship.SHIP_CLASS
  ai: string
  position: engine.ship.Position
}

export type Mission = {
  id: string
  title: string
  start?: { x: number; y: number }
  subtitle: string
  description: string
  rewards?: { ships: Array<string>; missions: Array<string> }
  size: { height: number; width: number }
  ships: Array<SerializedShip>
  credit: number
  constraints?: string
}

export type Arena = {
  id: string
  title: string
  start?: { x: number; y: number }
  size: { height: number; width: number }
  credit: number
}
