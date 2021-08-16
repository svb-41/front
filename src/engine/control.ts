import { INSTRUCTION } from '.'
import { Ship, RadarResult } from './ship'

export class Controller {
  data: any
  shipId: string
  getInstruction: (
    ship: Ship,
    radar: Array<RadarResult>,
    data: any
  ) => INSTRUCTION

  constructor(
    shipId: string,
    getInstruction: (
      ship: Ship,
      radar: Array<RadarResult>,
      data: any
    ) => INSTRUCTION,
    initialData?: any
  ) {
    this.data = initialData ? initialData : {}
    this.shipId = shipId
    this.getInstruction = getInstruction
  }

  next = (ship: Ship, radar: Array<RadarResult>) =>
    this.getInstruction(ship, radar, this.data)
}
