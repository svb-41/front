import { INSTRUCTION } from '.'
import { Ship, RadarResult } from './ship'

export type GetInstruction<Data> = (
  ship: Ship,
  radar: Array<RadarResult>,
  data: Data
) => INSTRUCTION

export class Controller<Data> {
  data: Data
  shipId: string
  getInstruction: GetInstruction<Data>

  constructor(
    shipId: string,
    getInstruction: GetInstruction<Data>,
    initialData: Data
  ) {
    this.data = initialData
    this.shipId = shipId
    this.getInstruction = getInstruction
  }

  next = (ship: Ship, radar: Array<RadarResult>) =>
    this.getInstruction(ship, radar, this.data)
}
