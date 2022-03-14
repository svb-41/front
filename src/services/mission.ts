import { engine } from '@svb-41/engine'

export const missions: Mission[] = new Array(6).fill(0).map((_, index) => {
  return require(`@/missions/confs/mission-${index}.json`)
})

export const getMission = (id: string): Mission | undefined =>
  missions.find(m => m.id === id)

export type SerializedShip = {
  classShip: engine.ship.SHIP_CLASS
  ai: string
  position: engine.ship.Position
}

export type Mission = {
  id: string
  shortTitle: string
  title: string
  description: string
  rewards?: { ships: Array<string>; missions: Array<string> }
  size: { height: number; width: number }
  ships: Array<SerializedShip>
  credit: number
  constraints?: string
}
