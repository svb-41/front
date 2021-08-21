import { Position } from '@/engine/ship'

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
