import { engine } from '@svb-41/engine'

export type SHIP_CLASS = engine.ship.SHIP_CLASS
export type Ship = {
  id: string
  shipClass: SHIP_CLASS
  x: number
  y: number
  rotation: number
}
export type AllShips = Ship[]
export type AllAIs = { sid: string; aid: string }[]
export type Data = { ships: AllShips; ais: AllAIs }
