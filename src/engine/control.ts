import { Ship, RadarResult, Bullet } from './ship'
import { Message } from './comm'
export type GetInstruction<Data> = (
  ship: Ship,
  radar: Array<RadarResult>,
  data: Data
) => Instruction

export type Comm = {
  getNewMessages: () => Array<Message>
  sendMessage: (message: any) => void
}

export type ControllerArgs = {
  stats: Ship
  radar: Array<RadarResult>
  memory: any
  comm: Comm
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

  next = (ship: Ship, comm: Comm, radar: Array<RadarResult>) =>
    this.getInstruction({
      stats: ship,
      radar,
      comm,
      memory: this.data,
      ship: controlPanel(ship),
    })
}

export type BulletControllerArgs = {
  stats: Bullet
  radar: Array<RadarResult>
  memory: any
  bullet: BulletControlPanel
}

export class BulletController<Data> {
  data: any
  getInstruction: (args: BulletControllerArgs) => Instruction

  constructor(
    getInstruction: (args: BulletControllerArgs) => Instruction,
    initialData?: Data
  ) {
    this.data = initialData
    this.getInstruction = getInstruction
  }

  next = (bullet: Bullet, radar: Array<RadarResult>) =>
    this.getInstruction({
      stats: bullet,
      radar,
      memory: this.data,
      bullet: bulletControlPanel(bullet),
    })
}

export enum INSTRUCTION {
  DEFAULT = 'DEFAULT',
  IDLE = 'IDLE',
  TURN = 'TURN',
  FIRE = 'FIRE',
  THRUST = 'THRUST',
}

export class Instruction {
  id: INSTRUCTION = INSTRUCTION.DEFAULT
}

export class Idle extends Instruction {
  id = INSTRUCTION.IDLE
}
export class Turn extends Instruction {
  id = INSTRUCTION.TURN
  arg: number
  constructor(arg: number) {
    super()
    this.arg = arg
  }
}
export class Thrust extends Instruction {
  id = INSTRUCTION.THRUST
  arg: number
  constructor(arg: number) {
    super()
    this.arg = arg
  }
}
export class Fire extends Instruction {
  id = INSTRUCTION.FIRE
  arg: number
  conf?: { target?: { x: number; y: number }; armedTime?: number }
  constructor(
    arg: number,
    conf?: { target?: { x: number; y: number }; armedTime?: number }
  ) {
    super()
    this.arg = arg
    this.conf = conf
  }
}

export type ControlPanel = {
  idle: () => Idle
  turn: (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft: (arg?: number) => Turn
  fire: (
    arg?: number,
    target?: { target?: { x: number; y: number }; armedTime?: number }
  ) => Fire
  thrust: (arg?: number) => Thrust
}

export const controlPanel = (ship: Ship): ControlPanel => ({
  idle: () => new Idle(),
  turn: arg => new Turn(arg ? arg : ship.stats.turn),
  turnRight: arg => new Turn(arg ? -arg : -ship.stats.turn),
  turnLeft: arg => new Turn(arg ? arg : ship.stats.turn),
  fire: (arg, target) => new Fire(arg ? arg : 0, target),
  thrust: arg => new Thrust(arg ? arg : ship.stats.acceleration),
})

export type BulletControlPanel = {
  idle: () => Idle
  turn: (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft: (arg?: number) => Turn
  thrust: (arg?: number) => Thrust
}

export const bulletControlPanel = (bullet: Bullet): BulletControlPanel => ({
  idle: () => new Idle(),
  turn: arg => new Turn(arg ? arg : bullet.stats.turn),
  turnRight: arg => new Turn(arg ? -arg : -bullet.stats.turn),
  turnLeft: arg => new Turn(arg ? arg : bullet.stats.turn),
  thrust: arg => new Thrust(arg ? arg : bullet.stats.acceleration),
})
