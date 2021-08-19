import {
  Ship,
  step as shipStep,
  Bullet,
  bulletStep,
  collide,
  RadarResult,
} from './ship'
import { BASIC_BULLET } from './config'
import { Controller } from './control'
import * as helpers from '@/helpers'

export class Engine {
  state: State
  step: (nb?: number) => State
  controllers: Array<Controller>
  history: Array<State> = []

  constructor(initialState: State, controllers: Array<Controller>) {
    this.state = initialState
    this.controllers = controllers
    this.step = (nb?: number) => {
      if (nb && nb > 1) {
        return this.step(nb - 1)
      }
      this.history.push(JSON.parse(JSON.stringify(this.state)))
      this.state = step(
        this.state,
        getInstructions(this.state, this.controllers)
      )
      if (this.history.length > 200) {
        if (!this.state.endOfGame) helpers.console.log('END')
        this.state.endOfGame = true
      }
      return this.state
    }
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

export enum INSTRUCTION {
  IDLE = 'IDLE',
  TURN_LEFT = 'TURN_LEFT',
  TURN_RIGHT = 'TURN_RIGHT',
  FIRE = 'FIRE',
  THRUST = 'THRUST',
  BACK_THRUST = 'BACK_THRUST',
}

export type Instruction = { instruction: INSTRUCTION; id: string }

const applyInstruction =
  ({
    newBullets,
    maxSpeed,
  }: {
    newBullets: Array<Bullet>
    maxSpeed?: number
  }) =>
  ({ ship, instruction }: { ship: Ship; instruction: INSTRUCTION }): Ship => {
    if (ship.destroyed) return ship
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
            speed: maxSpeed
              ? Math.min(
                  ship.position.speed + ship.stats.acceleration,
                  maxSpeed
                )
              : ship.position.speed + ship.stats.acceleration,
          },
        }
      case INSTRUCTION.BACK_THRUST:
        return {
          ...ship,
          position: {
            ...ship.position,
            speed: maxSpeed
              ? Math.max(
                  ship.position.speed - ship.stats.acceleration,
                  -maxSpeed
                )
              : ship.position.speed - ship.stats.acceleration,
          },
        }
      case INSTRUCTION.FIRE:
        const bullet: Bullet = {
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

const checkCollisions =
  (ships: Array<Ship>) =>
  (b: Bullet): Bullet | undefined => {
    const destroyed = ships.find(collide(b))
    if (destroyed) {
      if (b.armed) destroyed.destroyed = true
      return undefined
    }
    return b
  }

export const step = (state: State, instructions: Array<Instruction>): State => {
  if (state.endOfGame) return state
  const newBullets: Array<Bullet> = []
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
    .map(applyInstruction({ newBullets, maxSpeed: state.maxSpeed }))
    .map(shipStep)

  //@ts-ignore
  state.bullets = [
    ...state.bullets
      .filter((b: Bullet) => b.distance < b.range)
      .map(bulletStep)
      .map(checkCollisions(state.ships))
      .filter((b: Bullet | undefined) => b !== undefined),
    ...newBullets,
  ]
  return { ...state }
}

const getRadarResults = (ship: Ship, state: State): Array<RadarResult> =>
  ship.stats.detection
    ? state.ships
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
        }))
    : []

export const getInstructions = (
  state: State,
  controllers: Array<Controller>
): Array<Instruction> =>
  controllers
    .map((c: Controller) => ({
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
