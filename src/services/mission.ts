import { engine } from '@svb-41/engine'

export const getMission = (id: string): Mission =>
  require(`@/missions/confs/mission-${id}.json`)

export type SerializedShip = {
  classShip: engine.ship.SHIP_CLASS
  ai: string
  position: engine.ship.Position
}

export type Mission = {
  id: string
  title: string
  description: string
  rewards?: { ships: Array<string>; missions: Array<string> }
  size: { height: number; width: number }
  ships: Array<SerializedShip>
  credit: number
}
