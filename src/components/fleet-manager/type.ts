import { engine } from '@svb-41/engine'

export type SHIP_CLASS = engine.ship.SHIP_CLASS
export type AllShips = {
  id: string
  shipClass: SHIP_CLASS
  x: number
  y: number
}[]
export type AllAIs = { id: string; ai: engine.control.AI }[]
