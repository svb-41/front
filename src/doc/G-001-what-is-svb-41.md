# What is SVB-41?

SVB-41 is a game on rocket fights in outer space. You play as a general commander of the fleet, and you lead your men and your ships to the victory. You have two different tools you can use: ships themselves, and AI. Every ships you’ll lead act by its own, and you can’t give them orders directly. Instead, you’ll write an AI before, assign them to a ship, and send your fleet to fight. As soon as you launched your fleet, your role is over, and you can watch the battle under your eyes.

## What are the ships?

The ships are in-game items. For each mission, or for battles against other players, you’ll have a limit of credits you can use, and each ship will cost you a certain amount of credits. As long as some credits remains, you can still buy some more ships. By default, every ship contains some reactors and some communication system.
In the future, you’ll be able to customize your ship, and build your own. In this case, they will have a different credit cost. Right now, you’ll have six different types of ships you unlock through the campaign.

For more details, see the [ship article in the encyclopaedia](/database/ship-reference).

## What are the AI?

The AI are some pieces of code you’ll write yourself, directly in TypeScript. Because the best way to AI is still to write code, we decided to go that way, and we made everything usable directly in your browser. You’ll write code, but you’ll never need to leave of SVB-41. We made an entire environment ready-to-use, from a code editor (thanks to Monaco and Visual Studio Code) to the compiler and runner. Every time you’ll save your code, we’ll compile it on the server, and returns the compiled code for you.

### The different parts of an AI

Every AI you’ll write will be made of two parts: one memory place, and one algorithm, i.e. the AI itself. Because each ship will act on its own, every ship has its own memory and its own algorithm. You can have different AI for every ship on your fleet. The AI is a simple function, taking an input, and returning an output. You’ll won’t have to write anything like class etc., but you can still do it if you prefer. The only condition is that you must returns a function. The function will be called approximately every 60 ms. An AI can do almost what it wants, the only important thing is that it must respond approximately every 60 ms.

> One detail: while each ship act independently they can still communicate with each other with a communication channel. As such, you can share informations in the format of your choice and make every ship able to know what’s happening in realtime.

For more details, see the tutorial or the [AI article in the encyclopaedia](/database/ai-reference).

## Future plans

SVB-41 is continuously in progress. We're working to add new features, and to make the game more enjoyable. If you think something is missing, or if you want something specific, [send us a message](mailto:hivert.is.coming@gmail.com)!
