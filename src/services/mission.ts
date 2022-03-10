import { SHIP_CLASS, Position } from '@/engine/ship'

export const getMission = (id: string): Mission =>
  require(`@/missions/confs/mission-${id}.json`)

export type SerializedShip = {
  classShip: SHIP_CLASS
  ai: string
  position: Position
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
