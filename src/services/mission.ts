import { engine } from '@svb-41/engine'
import missionConf from '@/missions/mission.json'

export const missions: Mission[] = new Array(missionConf.numberOfmissions)
  .fill(0)
  .map((_, index) => require(`@/missions/confs/mission-${index}.json`))

export const simulations: Mission[] = new Array(missionConf.numberOfsimutalions)
  .fill(0)
  .map((_, index) => require(`@/pages/ai/simulations/simulation-${index}.json`))

export const arenas: Arena[] = new Array(missionConf.arenas)
  .fill(0)
  .map((_, index) => require(`@/pages/skirmishes/arenas/arena-${index}.json`))

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
