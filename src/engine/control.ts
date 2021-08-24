import { Ship, RadarResult } from './ship'

export type GetInstruction<Data> = (
  ship: Ship,
  radar: Array<RadarResult>,
  data: Data
) => Instruction

export type ControllerArgs = {
  stats: Ship
  radar: Array<RadarResult>
  memory: any
  ship: ControlPanel
}

export class Controller<Data> {
  data: any
  shipId: string
  getInstruction: (args: ControllerArgs) => Instruction

  constructor(
    shipId: string,
    getInstruction: (args: ControllerArgs) => Instruction,
    initialData?: Data
  ) {
    this.data = initialData
    this.shipId = shipId
    this.getInstruction = getInstruction
  }

  next = (ship: Ship, radar: Array<RadarResult>) =>
    this.getInstruction({
      stats: ship,
      radar,
      memory: this.data,
      ship: controlPanel(ship),
    })
}

export class Instruction {}

export class Idle extends Instruction {}
export class Turn extends Instruction {
  arg: number
  constructor(arg: number) {
    super()
    this.arg = arg
  }
}
export class Thrust extends Instruction {
  arg: number
  constructor(arg: number) {
    super()
    this.arg = arg
  }
}
export class Fire extends Instruction {
  arg: number
  constructor(arg: number) {
    super()
    this.arg = arg
  }
}

export type ControlPanel = {
  idle: () => Idle
  turn: (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft: (arg?: number) => Turn
  fire: (arg?: number) => Fire
  thrust: (arg?: number) => Thrust
}

export const controlPanel = (ship: Ship): ControlPanel => ({
  idle: () => new Idle(),
  turn: arg => new Turn(arg ? arg : ship.stats.turn),
  turnRight: arg => new Turn(arg ? -arg : -ship.stats.turn),
  turnLeft: arg => new Turn(arg ? arg : ship.stats.turn),
  fire: arg => new Fire(arg ? arg : 0),
  thrust: arg => new Thrust(arg ? arg : ship.stats.acceleration),
})
