export default `
declare module '@starships/core' {
  type Ship = {
    id: string
    position: Position
    stats: Stats
    destroyed: boolean
    team: string
    bulletsFired: number
    weapons: Array<{ bullet: Bullet; amo: number; coolDown: number }>
    shipClass: SHIP_CLASS
    stealth: number
  }
}
`
