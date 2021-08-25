import { SHIP_CLASS } from '@/engine/ship'
export type Sprite = { name: string; url: string }

export const sprites: Array<Sprite> = [
  { name: 'bullet', url: '/assets/Tiles/tile_0000.png' },
  { name: 'torpedo', url: '/assets/Tiles/tile_0012.png' },
  { name: 'explosion1', url: '/assets/Tiles/tile_0004.png' },
  { name: 'explosion2', url: '/assets/Tiles/tile_0005.png' },
  { name: 'explosion3', url: '/assets/Tiles/tile_0006.png' },
  { name: 'explosion4', url: '/assets/Tiles/tile_0007.png' },
  { name: 'explosion5', url: '/assets/Tiles/tile_0008.png' },
  { name: 'mine', url: '/assets/Tiles/tile_0016.png' },
  { name: 'background', url: '/assets/Backgrounds/blue.png' },
]
export const getBulletSprite = (size: number): string =>
  size === 8 ? 'torpedo' : 'bullet'

export const spritesSheets: Array<Sprite> = [
  { name: 'shipBlue', url: '/assets/Tilemap/mapBlue.json' },
  { name: 'shipGreen', url: '/assets/Tilemap/mapGreen.json' },
  { name: 'shipRed', url: '/assets/Tilemap/mapRed.json' },
  { name: 'shipYellow', url: '/assets/Tilemap/mapYellow.json' },
  { name: 'shipWhite', url: '/assets/Tilemap/mapWhite.json' },
]

export const colorSprite = (team: string): string => {
  switch (team) {
    case 'red':
      return 'shipRed'
    case 'blue':
      return 'shipBlue'
    case 'yellow':
      return 'shipYellow'
    case 'green':
      return 'shipGreen'
    default:
      return 'shipWhite'
  }
}

export const shipSprite = ({
  ship,
  team = 'white',
}: {
  ship: SHIP_CLASS
  team?: string
}): string => {
  switch (ship) {
    case SHIP_CLASS.DESTROYER:
      return `destroyer-${team}`
    case SHIP_CLASS.FIGHTER:
      return `fighter-${team}`
    case SHIP_CLASS.STEALTH:
      return `stealth-${team}`
    case SHIP_CLASS.CRUISER:
      return `cruiser-${team}`
    case SHIP_CLASS.BOMBER:
      return `bomber-${team}`
    case SHIP_CLASS.SCOUT:
      return `scout-${team}`
    default:
      return `support-${team}`
  }
}
