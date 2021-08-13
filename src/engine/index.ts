import {
  ship,
  step as shipStep,
  bullet,
  bulletStep,
  collide,
  radarResult,
} from './ship'
import { BASIC_BULLET } from './config'
import { controller } from './control'

export type typeState = {
  ships: Array<ship>
  size: { height: number; width: number }
  bullets: Array<bullet>
}

export type typeEngine = {
  state: typeState
  step: (state: typeState, instructions: Array<typeInstruction>) => typeState
  timeElapsed: number
}

export enum INSTRUCTION {
  IDLE = 'IDLE',
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  FIRE = 'FIRE',
  THRUST = 'THRUST',
  BACK_THRUST = 'BACK_THRUST',
}

const applyInstruction = (newBullets: Array<bullet>) => ({
  ship,
  instruction,
}: {
  ship: ship
  instruction: INSTRUCTION
}): ship => {
  switch (instruction) {
    case INSTRUCTION.TURN_LEFT:
      return {
        ...ship,
        position: {
          ...ship.position,
          direction: ship.position.direction + ship.stats.turn,
        },
      }
    case INSTRUCTION.TURN_RIGHT:
      return {
        ...ship,
        position: {
          ...ship.position,
          direction: ship.position.direction - ship.stats.turn,
        },
      }
    case INSTRUCTION.THRUST:
      return {
        ...ship,
        position: {
          ...ship.position,
          speed: ship.position.speed + ship.stats.acceleration,
        },
      }
    case INSTRUCTION.BACK_THRUST:
      return {
        ...ship,
        position: {
          ...ship.position,
          speed: ship.position.speed - ship.stats.acceleration,
        },
      }
    case INSTRUCTION.FIRE:
      const bullet: bullet = {
        ...BASIC_BULLET,
        position: {
          speed: BASIC_BULLET.position.speed + ship.position.speed,
          direction: ship.position.direction,
          pos: {
            x: ship.position.pos.x + Math.cos(ship.stats.size) + 1,
            y: ship.position.pos.y + Math.sin(ship.stats.size) + 1,
          },
        },
      }
      newBullets.push(bullet)
      return ship
    default:
      return ship
  }
}

const checkCollisions = (ships: Array<ship>) => (
  b: bullet
): bullet | undefined => {
  const destroyed = ships.find(collide(b))
  if (destroyed) {
    if (b.armed) destroyed.destroyed = true
    return undefined
  }
  return b
}

export type typeInstruction = { instruction: INSTRUCTION; id: string }

export const step = (
  state: typeState,
  instructions: Array<typeInstruction>
): typeState => {
  const newBullets: Array<bullet> = []
  state.ships = state.ships
    .map(ship => ({
      ship,
      instruction: instructions.find(i => i.id === ship.id) || {
        id: ship.id,
        instruction: INSTRUCTION.IDLE,
      },
    }))
    .map(({ ship, instruction }) => ({
      ship,
      instruction: instruction.instruction,
    }))
    .map(applyInstruction(newBullets))
    .map(shipStep)

  //@ts-ignore
  state.bullets = [
    ...state.bullets
      .filter((b: bullet) => b.distance < b.range)
      .map(bulletStep)
      .map(checkCollisions(state.ships))
      .filter((b: bullet | undefined) => b !== undefined),
    ...newBullets,
  ]

  return state
}

export const buildEngine = (state: typeState): typeEngine => ({
  state,
  step,
  timeElapsed: 0,
})

const getRadarResults = (ship: ship, state: typeState): Array<radarResult> => []

export const getInstructions = (
  state: typeState,
  controllers: Array<controller>
): Array<typeInstruction> =>
  controllers
    .map((c: controller) => ({
      c,
      ship: state.ships.find(s => s.id === c.shipId),
    }))
    .filter(val => val.ship !== undefined)
    .map(context => ({
      id: context.ship!.id,
      instruction: context.c.getInstruction(
        context.ship!!,
        getRadarResults(context.ship!!, state)
      ),
    }))
