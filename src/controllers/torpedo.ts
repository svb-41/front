import * as svb from '@svb-41/core'
const { dist2 } = svb.geometry

type Position = svb.ship.Position
type Data = { target?: Position }

export const data: Data = {}
export const ai: svb.AI<Data> = ({ stats, radar, memory, ship, comm }) => {
  const messages = comm.messagesSince(0)
  const near = svb.radar.nearestEnemy(radar, stats.team, stats.position)
  if (near) memory.target = near.enemy.position
  if (!memory.target && messages.length > 0)
    memory.target = messages
      .flatMap(m => m.content.message.map((res: any) => res))
      .find(p => svb.geometry.dist(p, stats.position))

  const weapon =
    stats.weapons[0].coolDown === 0
      ? 0
      : stats.weapons[1].coolDown === 0 &&
        stats.weapons[0].coolDown < stats.weapons[0].bullet.coolDown / 2
      ? 1
      : undefined
  if (memory.target && weapon !== undefined) {
    const speed = stats.weapons[weapon].bullet.position.speed
    const delay =
      Math.sqrt(svb.geometry.dist2(stats.position, memory.target)) / speed
    const target = svb.geometry.nextPosition(delay)(memory.target)
    memory.target = undefined
    const d = Math.sqrt(dist2(stats.position, target))
    return ship.fire(weapon, { target: target.pos, armedTime: d - 100 })
  }
  return ship.idle()
}
