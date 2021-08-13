import { INSTRUCTION } from '.'
import { Ship, RadarResult } from './ship'

export type Controller = {
  shipId: string
  getInstruction: (ship: Ship, radar: Array<RadarResult>) => INSTRUCTION
}
