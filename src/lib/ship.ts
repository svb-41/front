import { Mission } from '@/services/mission'

export const countShips = (mission: Mission) => {
  return mission.ships.reduce((acc, val) => {
    const n = val.classShip
    return { ...acc, [n]: (acc[n] ?? 0) + 1 }
  }, {} as { [key: string]: number })
}
