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

The `ship` field represents the control panel of your ship. That control panel allows to send an Instruction easily: it is made of functions returning instructions exclusively.

```typescript
// ControlPanel is defined in @svb-41/core.
type ControlPanel = {
  idle:      () => Idle
  turn:      (amount?: number) => Turn
  turnRight: (amount?: number) => Turn
  turnLeft:  (amount?: number) => Turn
  fire:      (id?: number, target?: Target) => Fire
  thrust:    (amount?: number) => Thrust
}
```

## Instructions

It exists 4 different instructions: `Idle`, `Turn`, `Thrust` and `Fire`. Only one of those instruction can be returned at the end of the function. The instruction can sometimes accept some parameters to refine their behavior. With those simple instructions, you can build complex behavior, because those instructions will be sent approximately every 60 ms.

### Idle

The default state, your ship will do nothing. In case your ship has some speed, your ship will simply continue its road through space (unlike on Earth, there's no friction in space, and thus no lose of speed through time).

```ts
// Dumb AI doing nothing.
import * as svb from '@svb-41/core'
export const ai: svb.AI = ({ ship }) => {
  return ship.idle()
}
```

### Thrust

Thrust is used to increase or decrease speed. It controls the reactors of your ship. Remember as said earlier, there is no friction in space so your ship will keep its speed if it idle.

Fortunately, you can back thrust with `ship.thrust(-1)` or you can be more precise with your speed with `ship.thrust(0.05)` if you need something delicate. By default, thrust will take the default value of ship speed.

```ts
// AI going through every step.
import * as svb from '@svb-41/core'
export const ai: svb.AI = ({ ship }) => {
  return ship.thrust()
}
```

![Thrust](/img/thrust.gif)

### Turn

Turning allows to reposition your ship in a new direction. The `direction` of the ship is computed in radian, and turning increase or decrease the radian `direction` according to the amount of the instruction (with the ship stat `turn` value as a maximum value).

```ts
// AI turning around.
import * as svb from '@svb-41/core'
export const ai: svb.AI = ({ ship }) => {
  return ship.turn()
}
```

![turn](/img/turn.gif)

You have to note a little difference with "normal" behavior in real life: when changing your direction when your ship is moving, you will keep your speed and the ship will still continue its way straight.

```ts
// AI turning around with speed.
import * as svb from '@svb-41/core'
export const ai: svb.AI = ({ ship, stats }) => {
  if (stats.position.speed < 1)
    return ship.thrust()
  return ship.turn()
}
```

![turn2](/img/turn2.gif)

To turn left or right you can use `ship.turnRight` or `ship.turnLeft`.
But you can use also `ship.turn(-1)` to turn right or `ship.turn(0.1)` to turn left but for a smaller angle than the defaut stat of your ship.

### Fire

When equipped with weapons, ships can fire bullets or torpedoes, according to what they have. Every weapon has unique stats and each ship have limited amount of munitions. The instruction itself is made of two optional parameters: the `id` of the weapon (0 for bullets, 1 for torpedoes) and the `target`. In case you forget the `id`, the ship will fire bullet, and if you don't give `target`, the torpedo will just go straight.

All weapons stats are similar to ships stats, and can be found on the ship's corresponding page.

```ts
// AI firing all of their bullets in front of it.
import * as svb from '@svb-41/core'
export const ai: svb.AI = ({ ship }) => {
  return ship.fire()
}
```

![bullet](/img/bullet.gif)

## Weapons type

### Bullets

Bullets are weapon flying straightforward at high speed on a small distance. After the bullet go through its limited range, it simply disappears.

![bullets](/img/bullets.gif)

### Torpedoes

Contrarily to bullets which are dumb weapons, torpedoes are self propelled weapons with some intelligence. You can specify a target when firing a torpedo, and it will fly toward the target, following it to crush it.

```ts
// AI firing all of their bullets in front of it.
import * as svb from '@svb-41/core'
export const ai: svb.AI = ({ ship }) => {
  const target = { x: 1000, y: 600 }
  const options = { target, armedTime: 400 }
  return ship.fire(1, options)
}
```

![torpedo](/img/torpedo.gif)

## Memory

Because AI are agents, they have direct access to some memory to store data and reuse them later. We’re talking about a computer intelligence after all! To represent this, you have access to some memory when developing your AI. The memory is provided in the `Context` at each run of the AI. It is an arbitrary object, and have the type `Data` you provided to the `svb.AI`.

```ts
// Dumb AI saving its position in memory.
import * as svb from '@svb-41/core'
type Data = { initialDir?: number }

export const data: Data = {}
export const ai: svb.AI<Data> = ({ stats, radar, ship, memory }) => {
  // memory is Data
  if (!memory.initialDir)
    memory.initialDir = stats.position.direction
  return ship.idle()
}
```
