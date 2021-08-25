export type Sprite = { name: string; url: string }

export const sprites: Array<Sprite> = [
  { name: 'motherShipBlue', url: '/assets/Ships/ship_0000.png' },
  { name: 'motherShipRed', url: '/assets/Ships/ship_0001.png' },
  { name: 'motherShipGreen', url: '/assets/Ships/ship_0002.png' },
  { name: 'motherShipYellow', url: '/assets/Ships/ship_0003.png' },
  { name: 'shipBlue', url: '/assets/Ships/ship_0004.png' },
  { name: 'shipRed', url: '/assets/Ships/ship_0005.png' },
  { name: 'shipGreen', url: '/assets/Ships/ship_0006.png' },
  { name: 'shipYellow', url: '/assets/Ships/ship_0007.png' },
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

export const getSprite = (team: string, size: number): string => {
  switch (team) {
    case 'red':
      return size === 16 ? 'motherShipRed' : 'shipRed'
    case 'green':
      return size === 16 ? 'motherShipGreen' : 'shipGreen'
    case 'yellow':
      return size === 16 ? 'motherShipYellow' : 'shipYellow'
    case 'blue':
      return size === 16 ? 'motherShipBlue' : 'shipBlue'
  }
  return 'torpedo'
}

export const getBulletSprite = (size: number): string =>
  size === 8 ? 'torpedo' : 'bullet'
