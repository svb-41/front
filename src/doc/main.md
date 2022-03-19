# SVB 41

# Documentation

This documentation is here to help you to understand how to use ships in SVB 41.

Your AI will get this context at every frames.

```typescript
export type Context<Data = any> = {
  stats: Ship
  radar: Array<RadarResult>
  memory: Data
  comm: Comm
  ship: ControlPanel
}
```

## ship

Ship represent the control panel of your ship.

```typescript
type ControlPanel = {
  idle: () => Idle
  turn: (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft: (arg?: number) => Turn
  fire: (arg?: number, target?: Target) => Fire
  thrust: (arg?: number) => Thrust
}
```

### idle

The default state, you ship will do nothing.

### thrust

```typescript
export const ai: svb.AI<Data> = ({ ship }) => {
  return ship.thrust()
}
```

<img src='./img/thrust.gif'>

Thrust will only increase or decrease speed, there is no friction in space so you ship will keep its speed if it idle.

You can back thrust with `ship.thrust(-1)` or be more precise with your speed with `ship.thrust(0.05)`. If you want to increase your speed more precisely.

Without specifying it you thrust at the default value of speed of your ship.

### turn

```typescript
export const ai: svb.AI<Data> = ({ ship }) => {
  return ship.turn()
}
```

<img src='./img/turn.gif'>

If you turn when your ship is moving it will keep its speed but change it direction.

```typescript
export const ai: svb.AI<Data> = ({ ship, stats }) => {
  if (stats.position.speed < 1) return ship.thrust()
  return ship.turn()
}
```

<img src='./img/turn2.gif'>

To turn left or right you can use `ship.turnRight` or `ship.turnLeft`.
But you can use also `ship.turn(-1)` to turn right or `ship.turn(0.1)` to turn left but for a smaller angle than the defaut stat of your ship.

### fire

Ships have different kind of weapons bullets or torpedo. Every weapon have unique stats and each ship have a limited amount of there weapon.

You can view those stats in the ship's page.

```typescript
export const ai: svb.AI<Data> = ({ ship }) => {
  return ship.fire()
}
```

<img src='./img/bullet.gif'>

You can chose the weapon you are using with `ship.fire(1)`

#### bullets

It is a weapon than fly in straight line from the front of your ship.

Bullet have a limited range.

<img src='./img/bullets.gif'>

#### torpedos

Torpedos are self propelled weapons. You only have to specify a target when you firing it and the torpedo will be able to cruise toward the target.

```typescript
export const ai: svb.AI<Data> = ({ ship }) => {
  return ship.fire(1, { target: { x: 1000, y: 600 }, armedTime: 400 })
}
```

<img src='./img/torpedo.gif'>

## radar

Every ship have detection capacity. The radar variables gives you at any time the ships near you ship.

```typescript
type RadarResult = {
  position: Position
  size: number
  team: string
  destroyed: boolean
}
```

You can use the `closeEnemies` from the helper radar, it will respond a list of `Enemy` from your radar.

```typescript
type Enemy = { enemy: RadarResult; dist2: number }
```

<img src='./img/radar.gif'>

```typescript
export const ai: svb.AI<Data> = ({ stats, radar, ship }) => {
  const enemies = svb.radar.closeEnemies(radar, stats.team, stats.position)
  if (enemies.length > 0) {
    if (stats.position.speed > -0.1) return ship.thrust(-0.1)
  }
  if (stats.position.speed < 0.1) return ship.thrust(0.1 - stats.position.speed)
  return ship.idle()
}
```