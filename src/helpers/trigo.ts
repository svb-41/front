import { Position, position } from '@/engine/ship'
import {
  ControllerArgs,
  Instruction,
  ControlPanel,
  BulletControlPanel,
} from '@/engine/control'

export const PI = Math.PI
export const TWO_PI = Math.PI * 2

export const nextPosition = (num: number) => {
  return (pos: Position): Position => {
    if (num > 0) return nextPosition(num - 1)(position(pos))
    return position(pos)
  }
}

export type Angle = { source: Position; target: Position }
export const angle = ({ source, target }: Angle): number => {
  const angle = Math.atan2(
    target.pos.y - source.pos.y,
    target.pos.x - source.pos.x
  )
  return angle < 0 ? angle + TWO_PI : angle
}

type DeltaAngle = { delay: number; target: Position; source: Position }
const computeDeltaAngle = ({ delay, target, source }: DeltaAngle) => {
  const nxt = nextPosition(delay)(target)
  const srcTarget = angle({ source, target: nxt })
  const deltaAngle = (srcTarget - source.direction + TWO_PI) % TWO_PI
  return deltaAngle
}

export type FindDirection = {
  ship: ControlPanel
  source: Position
  target: Position
  delay?: number
}
export const findDirection = ({
  ship,
  source,
  target,
  delay = 1,
}: {
  ship: ControlPanel | BulletControlPanel
  source: Position
  target: Position
  delay?: number
}): Instruction => {
  const deltaAngle =
    (angle({
      source,
      target: nextPosition(delay)(target),
    }) -
      source.direction +
      Math.PI * 2) %
    (Math.PI * 2)
  return ship.turn(-deltaAngle + Math.PI)
}
export const aim = ({
  ship,
  source,
  target,
  delay = 1,
  threshold = 0.1,
  weapon = 0,
}: {
  ship: ControlPanel
  source: Position
  target: Position
  delay?: number
  threshold?: number
  weapon?: number
}): Instruction => {
  const deltaAngle =
    (angle({
      source,
      target: nextPosition(delay)(target),
    }) -
      source.direction +
      Math.PI * 2) %
    (Math.PI * 2)
  if (deltaAngle < threshold) return ship.fire(weapon)
  return ship.turn(-deltaAngle + Math.PI)
}
