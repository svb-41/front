import { ship, step as shipStep } from './ship'

export type typeState = {
  ships: Array<ship>
  size: { height: number; width: number }
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

const applyInstruction = ({
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

    default:
      return ship
  }
}

export type typeInstruction = { instruction: INSTRUCTION; id: string }

export const step = (
  state: typeState,
  instructions: Array<typeInstruction>
): typeState => {
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
    .map(applyInstruction)
    .map(shipStep)

  console.log(state.ships[0].position.pos.x)
  console.log(state.ships[0].position.pos.y)
  return state
}

export const buildEngine = (state: typeState): typeEngine => ({
  state,
  step,
  timeElapsed: 0,
})
