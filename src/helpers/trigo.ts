import { Position, position } from '@/engine/ship'
import { ControllerArgs, Instruction, ControlPanel } from '../engine/control'

export const nextPosition =
  (num: number) =>
  (pos: Position): Position => {
    if (num > 0) return nextPosition(num - 1)(position(pos))
    return position(pos)
  }

export const angle = ({
  source,
  target,
}: {
  source: Position
  target: Position
}): number => {
  const angle = Math.atan2(
    target.pos.y - source.pos.y,
    target.pos.x - source.pos.x
  )
  return angle < 0 ? angle + Math.PI * 2 : angle
}

export const findDirection = ({
  ship,
  source,
  target,
  delay = 1,
}: {
  ship: ControlPanel
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
  return deltaAngle < Math.PI ? ship.turnLeft() : ship.turnRight()
}

export const aim = ({
  ship,
  source,
  target,
  delay = 1,
  threshold = 0.1,
}: {
  ship: ControlPanel
  source: Position
  target: Position
  delay?: number
  threshold?: number
}): Instruction => {
  const deltaAngle =
    (angle({
      source,
      target: nextPosition(delay)(target),
    }) -
      source.direction +
      Math.PI * 2) %
    (Math.PI * 2)
  if (deltaAngle < threshold) return ship.fire()
  return deltaAngle < Math.PI ? ship.turnLeft() : ship.turnRight()
}
