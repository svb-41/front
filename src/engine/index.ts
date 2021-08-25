import {
  Ship,
  step as shipStep,
  Stats,
  Bullet,
  bulletStep,
  collide,
  RadarResult,
  Position,
} from './ship'
import {
  BulletController,
  Controller,
  Instruction,
  Idle,
  Turn,
  Thrust,
  Fire,
} from './control'

export class Engine extends EventTarget {
  state: State
  controllers: Array<Controller<any>>
  history: Array<State> = []
  gameEnder: (state: State) => boolean

  constructor(
    initialState: State,
    controllers: Array<Controller<any>>,
    gameEnder: (state: State) => boolean
  ) {
    super()
    this.state = initialState
    this.gameEnder = gameEnder
    this.controllers = controllers
  }

  switchController(controller: Controller<any>) {
    const { shipId } = controller
    const index = this.controllers.findIndex(c => c.shipId === shipId)
    this.controllers[index] = controller
  }

  step(nb?: number): State {
    if (nb && nb > 1) return this.step(nb - 1)
    this.history.push(JSON.parse(JSON.stringify(this.state)))
    const instruction = getInstructions(this.state, this.controllers)
    this.state = step(this.state, instruction, this)
    const previousEnd = this.state.endOfGame
    this.state.endOfGame = this.gameEnder(this.state)
    if (!previousEnd && this.state.endOfGame) {
      this.dispatchEvent(new Event('state.end'))
    }
    return this.state
  }
}

export type State = {
  ships: Array<Ship>
  size: { height: number; width: number }
  bullets: Array<Bullet>
  maxSpeed?: number
  teams: Array<string>
  endOfGame?: boolean
}

export type InstructionShip = { instruction: Instruction; id: string }

const instructionTurn = ({
  object,
  turn,
}: {
  object: any
  turn: Turn
}): any => {
  if (turn.arg > 0) {
    return {
      ...object,
      position: {
        ...object.position,
        direction:
          (object.position.direction +
            Math.min(turn.arg, object.stats.turn) +
            Math.PI * 2) %
          (Math.PI * 2),
      },
    }
  } else {
    return {
      ...object,
      position: {
        ...object.position,
        direction:
          (object.position.direction +
            Math.max(turn.arg, -object.stats.turn) +
            Math.PI * 2) %
          (Math.PI * 2),
      },
    }
  }
}

const instructionThrust = ({
  object,
  thrust,
  maxSpeed,
}: {
  object: any
  thrust: Thrust
  maxSpeed?: number
}): any => {
  if (thrust.arg > 0) {
    const acceleration = Math.min(thrust.arg, object.stats.acceleration)
    return {
      ...object,
      position: {
        ...object.position,
        speed: maxSpeed
          ? Math.min(object.position.speed + acceleration, maxSpeed)
          : object.position.speed + acceleration,
      },
    }
  } else {
    const acceleration = Math.max(thrust.arg, -object.stats.acceleration)
    return {
      ...object,
      position: {
        ...object.position,
        speed: maxSpeed
          ? Math.max(object.position.speed + acceleration, -maxSpeed)
          : object.position.speed + acceleration,
      },
    }
  }
}

const instructionFire = ({
  ship,
  fire,
  newBullets,
}: {
  ship: Ship
  fire: Fire
  newBullets: Array<Bullet>
}): any => {
  if (fire.arg < 0 || ship.weapons.length === 0) return ship
  const weapon = ship.weapons[fire.arg]
  if (weapon.coolDown > 0 || weapon.amo === 0) return ship

  const controller =
    weapon.bullet.builder && fire?.conf
      ? weapon.bullet.builder()(fire.conf)
      : undefined

  const bullet: Bullet = {
    ...weapon.bullet,
    id: ship.id + ship.bulletsFired,
    controller,
    position: {
      speed: weapon.bullet.position.speed + ship.position.speed,
      direction: ship.position.direction,
      pos: {
        x:
          ship.position.pos.x +
          (ship.stats.size + weapon.bullet.stats.size) *
            Math.cos(ship.position.direction),
        y:
          ship.position.pos.y +
          (ship.stats.size + weapon.bullet.stats.size) *
            Math.sin(ship.position.direction),
      },
    },
  }
  newBullets.push(bullet)
  ship.bulletsFired = ship.bulletsFired + 1
  return {
    ...ship,
    weapons: ship.weapons.map((w, i) =>
      i === fire.arg
        ? { ...w, coolDown: bullet.coolDown, amo: weapon.amo - 1 }
        : { ...w }
    ),
  }
}

const applyInstruction =
  ({
    newBullets,
    maxSpeed,
  }: {
    newBullets: Array<Bullet>
    maxSpeed?: number
  }) =>
  ({ ship, instruction }: { ship: Ship; instruction: Instruction }): Ship => {
    if (ship.destroyed) return ship
    switch (instruction.constructor.name) {
      case 'Turn':
        const turn = instruction as Turn
        return instructionTurn({ object: ship, turn })
      case 'Thrust':
        const thrust = instruction as Thrust
        return instructionThrust({ object: ship, thrust, maxSpeed })
      case 'Fire':
        const fire = instruction as Fire
        return instructionFire({ ship, fire, newBullets })
      default:
        return ship
    }
  }

const applyBulletsInstructions =
  ({ state }: { state: State }) =>
  (bullet: Bullet): Bullet => {
    if (bullet.controller) {
      const controller = bullet.controller as BulletController<any>
      const radar = getRadarResults(bullet, state)
      const instruction = controller.next(bullet, radar)
      switch (instruction.constructor.name) {
        case 'Turn':
          const turn = instruction as Turn
          return instructionTurn({ object: bullet, turn })
        case 'Thrust':
          const thrust = instruction as Thrust
          return instructionThrust({
            object: bullet,
            thrust,
            maxSpeed: state.maxSpeed,
          })
        default:
          return bullet
      }
    } else {
      return bullet
    }
  }

const checkCollisions =
  ({ ships, engine }: { ships: Array<Ship>; engine: Engine }) =>
  (b: Bullet): Bullet => {
    const destroyed = ships.find(collide(b))
    if (destroyed) {
      if (b.armed) destroyed.destroyed = true
      b.destroyed = true
      const detail = { ship: destroyed, bullet: b }
      engine.dispatchEvent(new CustomEvent('sprite.explosion', { detail }))
    }
    return b
  }

const step = (
  state: State,
  instructions: Array<InstructionShip>,
  engine: Engine
): State => {
  const newBullets: Array<Bullet> = []
  state.ships = state.ships
    .map(ship => ({
      ship,
      instruction: instructions.find(i => i.id === ship.id) || {
        id: ship.id,
        instruction: new Idle(),
      },
    }))
    .map(({ ship, instruction }) => ({
      ship,
      instruction: instruction.instruction,
    }))
    .map(applyInstruction({ newBullets, maxSpeed: state.maxSpeed }))

  state.bullets = [...state.bullets, ...newBullets]

  const newState: State = new Array(10)
    .fill(1)
    .reduce((acc, _val) => allSteps(acc, engine), state)
  return { ...newState }
}

const allSteps = (state: State, engine: Engine): State => {
  const ships = state.ships.map(shipStep)
  const stepBullets = state.bullets
    .map(applyBulletsInstructions({ state }))
    .map(bulletStep)
    .map(checkCollisions({ ships, engine }))

  const bullets: Array<Bullet> = stepBullets.filter((b: Bullet) => !b.destroyed)

  engine.dispatchEvent(
    new CustomEvent('sprite.remove', {
      detail: stepBullets.filter(b => b.destroyed).map(b => b.id),
    })
  )

  return {
    ...state,
    ships,
    bullets,
  }
}

const getRadarResults = (
  ship: { stats: Stats; position: Position; id: string },
  state: State
): Array<RadarResult> =>
  ship.stats.detection
    ? state.ships
        .filter(s => s.id !== ship.id)
        .filter(
          collide({
            position: ship.position,
            stats: { ...ship.stats, size: ship.stats.detection },
          })
        )
        .map((s: Ship) => ({
          size: s.stats.size,
          position: s.position,
          team: s.team,
          destroyed: s.destroyed,
        }))
    : []

export const getInstructions = (
  state: State,
  controllers: Array<Controller<any>>
): Array<InstructionShip> =>
  controllers
    .map((c: Controller<any>) => ({
      c,
      ship: state.ships.find(s => s.id === c.shipId),
    }))
    .filter(val => val.ship !== undefined)
    .map(context => ({
      id: context.ship!.id,
      instruction: context.c.next(
        context.ship!!,
        getRadarResults(context.ship!!, state)
      ),
    }))
