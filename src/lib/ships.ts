import { Mission } from '@/services/mission'
import { Color } from '@/lib/color'

export const ships = [
  'fighter',
  'scout',
  'cruiser',
  'stealth',
  'bomber',
  'destroyer',
]

let shipsLoad: any = {}

const preload = () => {
  const colors = Object.values(Color)
  ships.forEach(ship => {
    colors.forEach(color => {
      const shipName = `${ship.toLowerCase()}-${color}`
      const path = require(`../../public/assets/Tiles/${shipName}.png`)
      const file = path.default
      shipsLoad[shipName] = file
    })
  })
}

preload()

export const getImage = (ship: string, color: string) => {
  const shipName = `${ship.toLowerCase()}-${color}`
  return shipsLoad[shipName]
}

export const countShips = (mission: Mission) => {
  return mission.ships.reduce((acc, val) => {
    const n = val.classShip
    return { ...acc, [n]: (acc[n] ?? 0) + 1 }
  }, {} as { [key: string]: number })
}
