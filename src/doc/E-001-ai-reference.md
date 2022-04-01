# AI Reference

An AI is the basic block of SVB-41. Working with ships, it is the control center and at every step, it will indicates to the ship what to do. An AI has some predefined features and must work in a specific way: it is a function, accepting a defined `Context` and returning a ship `Instruction`. An AI has also access to a memory, injected in the AI at every step.

An AI is a TypeScript module containing two exports: `data` and `ai`. `data` correspond to the initial data in memory, while `ai` correspond to the ai (the function itself). In every module, you can use the package `@svb-41/core`. This package is also accessible in the builtin editor, and auto-injected during the compiling step. It helps to type-check your AI correctly.

```ts
// AI is defined in @svb-41/core
type AI<Data = any> = (context: Context<Data>) => Instruction
```

```ts
import * as '@svb-41/core'

// The type Data allows to ensure the data are correctly typed.
// Declaring it allows to use AI Generic type.
type Data = { [key: string]: string }

// The data correspond to the initial memory injected in context.
export const data: Data = {}

// The function is the AI itself.
// The Data is used here to infer type-checking of context.memory.
// You can safely forgot it if you don't want to type-check your memory,
//   but you probably shouldn't.
export const ai: svb.AI<Data> = context => {
  // context is Context
  // You can access here to everything you want, and use the context.
  return context.ship.idle()
}
```

## Context

At each step, the AI will receive the `Context` to help it to react to any situation. It is made of different stats, the radar, the memory, the communication system, and the control panel.

```ts
// Context is defined in @svb-41/core.
// Data is user-defined for your memory.
type Context<Data = any> = {
  stats:  Ship               // Different Ship stats (speed, etc. cf. Ship Reference)
  radar:  Array<RadarResult> // Result of radar (cf. Ship Reference)
  memory: Data               // User-defined memory
  comm:   Comm               // Communication system (cf. Ship Reference)
  ship:   ControlPanel       // Control Panel to simplify returning instructions
}
```

### Control Panel

The `ship` field represents the control panel of your ship. That control panel allows to send an Instruction easily: it is made a functions returning instructions exclusively.

```typescript
// ControlPanel is defined in @svb-41/core.
type ControlPanel = {
  idle:      () => Idle
  turn:      (arg?: number) => Turn
  turnRight: (arg?: number) => Turn
  turnLeft:  (arg?: number) => Turn
  fire:      (arg?: number, target?: Target) => Fire
  thrust:    (arg?: number) => Thrust
}
```

## Instructions

It exists 4 different instructions: `Idle`, `Turn`, `Thrust` and `Fire`. Only one of those instruction can be returned at the end of the function. The instruction can sometimes accept some parameters to refine their behavior. With those simple instructions, you can build complex behavior, because those instructions will be sent approximately every 60 ms.

### Idle

The default state, you ship will do nothing. In case your ship has some speed, your ship will simply continue its road through space (unlike on Earth, there's no lose of speed through time).

```ts
// Dumb AI doing nothing.
import * as svb from '@svb-41/core'
export const ai: svb.AI = ({ ship }) => {
  return ship.idle()
}
```

### Thrust

Thrust is used to increase or decrease speed. It controls the reactors of your ship. Remember as said earlier, there is no friction in space so you ship will keep its speed if it idle.

Fortunately, you can back thrust with `ship.thrust(-1)` or you can be more precise with your speed with `ship.thrust(0.05)` if you need something delicate. By default, thrust will take the default value of ship speed.

```ts
// AI going through every step.
import * as svb from '@svb-41/core'
export const ai: svb.AI = ({ ship }) => {
  return ship.thrust()
}
```

![Thrust](/img/thrust.gif)

### turn

```typescript
export const ai: svb.AI<Data> = ({ ship }) => {
  return ship.turn()
}
```

![turn](/img/turn.gif)

If you turn when your ship is moving it will keep its speed but change its direction.

```typescript
export const ai: svb.AI<Data> = ({ ship, stats }) => {
  if (stats.position.speed < 1) return ship.thrust()
  return ship.turn()
}
```

![turn2](/img/turn2.gif)

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

![bullet](/img/bullet.gif)

You can chose the weapon you are using with `ship.fire(1)`

#### bullets

It is a weapon than fly in straight line from the front of your ship.

Bullet have a limited range.

![bullets](/img/bullets.gif)

#### torpedos

Torpedos are self propelled weapons. You only have to specify a target when you firing it and the torpedo will be able to cruise toward the target.

```typescript
export const ai: svb.AI<Data> = ({ ship }) => {
  return ship.fire(1, { target: { x: 1000, y: 600 }, armedTime: 400 })
}
```

![torpedo](/img/torpedo.gif)

## memory

If you want to keep informations between two execution of your AI function during the battle you can use the memory object provided in the context.

The object have the type `Data` you provided to the `svb.AI`.

You can access this object during execution and its value is stored between execution of your AI.

```typescript
type Data = { initialDir?: number }

export const data: Data = {}
export const ai: svb.AI<Data> = ({ stats, radar, ship, memory }) => {
  if (!memory.initialDir) memory.initialDir = stats.position.direction
  return ship.idle()
}
```
