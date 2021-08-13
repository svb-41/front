import { INSTRUCTION } from '.'
import { ship, radarResult } from './ship'

export type controller = {
  shipId: string
  getInstruction: (ship: ship, radar: Array<radarResult>) => INSTRUCTION
}
