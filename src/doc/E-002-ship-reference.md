# Ship Reference

A ship is made of some characteristics, and some tools. It is by default equipped with radars, reactors, and communication system. It can also have weapons. A ship reacts according to the AI bundled with it. A ship can only have one AI linked.

## Characteristics

- `turn`: Used when the ship is turning. When turning, you can specify how much you want to turn (in radian), and the amount of rotation will be at most the `turn` value. When turning, we’re modifying `direction`.

- `acceleration`: Used when the ship is accelerating or decelerating. You can specify a value to `thrust` to add small amount of acceleration, or when leaved empty or higher than `acceleration`, then the `acceleration` value is used. The `speed` value is then modified.

  > Remember, the ship will move ten times between each AI call, so a `speed` of 1 (which is the maximum) means that the ship will move 10 pixels between each call.

- `size`: Ship size. In game, its representation is a circle (like a hitbox) with the `size` as radius.

- `detection`: Correspond to the radius size of the radar. Its corresponding area is drawn on the map in-game.

- `stealth`: A ship can be considered as furtive when it does not move after 60 AI  calls. It becomes detectable again by a radar if it acts (an action different of `ship.idle()`).


## Radars

A ship is equipped with a radar which constantly and passively listens to everything around the ship. It is the only detection capacity of the ship. Every time the ship needs to act, it reads its environment, and transfer them to the AI. All radars can have different capabilities, mainly on range detection.

The radar returns a list of `RadarResult` at every step. Technically, a `RadarResult` is an object, containing few informations: the position of the object, its size, its obedience (the team of the object) and its living status (it can alive or destroyed).

```ts
// RadarResult is defined in @svb-41/core.
type RadarResult = {
  position: Position    // See below
  size: number          // The size in pixels
  team: string          // The team in string
  destroyed: boolean    // false if alive, true if destroyed
}
```

You can use the results of the scan to get some informations and act accordingly. To simplify AI developments, you can use the helpers provided by `@svb-41/core` for the radar, i.e. `closeEnemies` and `nearestEnemy`. The first function returns the close enemies of the ship on the radar list, and the second function returns the first enemy near the ship.

Below an example AI using the radar, with the visual representation.

```ts
import * as svb from '@svb-41/core'

// This is the declaration of an AI.
export const ai: svb.AI = ({ ship, stats, radar }) => {
  // Find the nearest enemy and the close enemies.
  const close = svb.radar.closeEnemies(radar, stats.team, stats.position)
  const near1 = svb.radar.nearestEnemy(radar, stats.team, stats.position)
  const near2 = svb.radar.nearestEnemy(close)

  // Log objects to the logbox.
  svb.console.log(near1)
  svb.console.log(near2)
  svb.console.log(close)

  // Approach the enemy.
  if (enemies.length > 0 && stats.position.speed > -0.1) return ship.thrust(-0.1)
  // Get back from the enemy.
  if (stats.position.speed < 0.1) return ship.thrust(0.1 - stats.position.speed)
  // Don't do anything.
  return ship.idle()

  // Here we do nothing, but you can do what you want.
  return ship.idle()
}
```

![radar](/img/radar.gif)

## Positions

A position defines the position of any object in space. It is made of a position indicated by an `x` and an `y` field, as well as a direction and a speed.

```ts
// Position is defined in @svb-41/core.
type Position = {
  direction: number     // direction in radians
  speed: number         // speed in pixels/seconds
  pos: {
    x: number           // x in the space
    y: number           // y in the space
  }
}
```

## Communication systems

A ship is also equipped with a communication system. A communication system is a way for a ship to interact with the other ships in space, by sending and reading messages. The communication is made of two things: a communication channel (`Channel`) and messages (`Message`). You're free to send whatever you want in the channel, because it’s made for communicating what you want. However, we strongly advise to define a `Data` model to help you handle messages. Once defined, TypeScript will help you with the fields of the messages, etc.

Below you'll find the Message type as well as the Channel type.

```ts
// Message in defined in @svb-41/core.
// Data is what you want, and the content of the messages.
type Message<Data = any> = {
  timeSend: number
  content: Data
}
```

```ts
// Channel in defined in @svb-41/core.
// Data is what you want, and the content of the messages.
type Channel<Data = any> = {
  sendMessage: (content: Data) => void
  messagesSince: (time: number) => Message<Data>[]
}
```

We don't provide any helpers to use the communication because the whole system is simply made with plain arrays and simple objects. You can add a simple type-system over it, and use your traditional algorithms as you like.

Below a dummy example to illustrate some way to work with comm.

```ts
import * as svb from '@svb-41/core'

// This is the user-defined data model for the messages.
// You're free to define data model as you want, according to your likes.
type Content =
  | { type: 'send';     content: string }
  | { type: 'received'; content: string }

// This is the declaration of an AI.
export const ai: svb.AI = ({ ship, comm }) => {
  // Reading messages since the beginning. Changing 0 to something else will
  //   allow to read messages since a specific timestamp.
  const messages: svb.comm.Message<Content>[] = comm.messagesSince(0)
  for (const message of messages) {
    switch (message.type) {
      case 'received': return ship.idle()
      case 'send': return ship.idle()
    }
  }

  // Sending a message if no messages has been sent earlier.
  // You're technically not forced to post a message corresponding to the data
  //   model, but we strongly advice against doing it.
  // Sending a correct message similar to your types always make code more
  //   efficient.
  if (messages.length === 0) {
    // Instead of this:
    comm.sendMessage({
      type: 'send',
      content: 'my-content',
    })

    // Try to do this:
    const message: Content = { type: 'sent', content: 'my-content' }
    comm.sendMessage(message)
  }

  // Here we do nothing, but you can do what you want.
  return ship.idle()
}
```

Below an illustration with a scout to spot enemy ships, thanks to its larger radar range, and a bomber using its instructions to fire on the target.

```ts
// scout.ts
export const ai: svb.AI<Data> = ({ stats, radar, ship, comm }) => {
  // Read the enemies.
  const enemies = svb.radar.closeEnemies(radar, stats.team, stats.position)

  // For each enemy, signal its position, and move back from the enemy to keep
  //   them to the maximum range possible.
  if (enemies.length > 0) {
    enemies.forEach(e => comm.sendMessage(e.enemy.position.pos))
    if (stats.position.speed > -0.1) return ship.thrust(-0.1)
  }

  // Move straight to the enemy to get them back in the radar.
  if (stats.position.speed < 0.1) return ship.thrust(0.1 - stats.position.speed)

  // Don't do nothing if everything is perfect.
  return ship.idle()
}
```

And use those informations to fire from an other ship

```ts
// bomber.ts
export const ai: svb.AI<Data> = ({ ship, comm }) => {
  // Read the last messages.
  const messages = comm.messagesSince(0)

  // Fire on the target seen by scout.
  if (messages) {
    const target = messages[0].content.message
    const params = { target, armedTime: 400 }
    return ship.fire(0, params)
  }

  // Otherwise don't do nothing.
  return ship.idle()
}
```

![radar2](/img/radar2.gif)

## Weapons

Finally, a ship can be equipped with weapons, but this is not mandatory. You can have both ships with weapons and ships without weapons. For example, you can have small scouts with huge radars and communication system, and huge bombers to launch torpedo when receiving info from the scouts.

A weapon is made of three parts: a bullet type, a number of munitions (`amo`) and a cool-down (`coolDown`) which corresponds to the time in seconds you must wait before firing again.

Below is the approximate type definition.

```ts
// This type doesn't exist, it is an internal of SVB-41.
type Weapon = {
  bullet: Bullet
  amo: number
  coolDown: number
}
```

To help you use the weapons, you can use the `geometry` namespace in `@svb-41/core`. It contains useful utilities to aim, to position your ship in front of others and to compute distances between ships.

To fire with one weapon, you have to pass its index to the ship `fire` instruction. In case you want to fire with torpedos for example, you have to pass the index of the torpedos, 1 for example.

Below a dummy example to illustrate some way to work with weapons.

```ts
import * as svb from '@svb-41/core'

// This is the declaration of an AI.
const ai: svb.AI = ({ radar, stats, ship }) => {
  // Get the nearest enemy if any.
  const near = svb.radar.nearestEnemy(radar, stats.team, stats.position)
  if (near) {
    // 0: will fire bullets. 1: will fire torpedoes.
    const weapon = 0
    const weapon = 1
    // Below is the initialization of aiming.
    const dist = Math.sqrt(near.dist2)
    const source = stats.position
    const target = near.enemy.position
    const threshold = 4 / dist
    const speed = stats.weapons[widx].bullet.pposition.speed
    const delay = dist / speed
    // Aiming will return an instruction, you can just returns it as is.
    return svb.geometry.aim({ ship, source, target, threshold, delay, weapon })
  }
  return ship.idle()
}
```
