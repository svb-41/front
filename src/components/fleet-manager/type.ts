import { engine } from '@svb-41/engine'
import { AI } from '@/lib/ai'

export type SHIP_CLASS = engine.ship.SHIP_CLASS
export type Ship = {
  id: string
  shipClass: SHIP_CLASS
  x: number
  y: number
  rotation: number
}
export type AllShips = Ship[]
export type AllAIs = { id: string; ai: AI }[]
