const fs = require('fs')

const files = ['assault', 'hold', 'mine', 'scout', 'torpedo']

const read = f => fs.promises.readFile(`./${f}.ts.txt`, 'utf-8')
const main = async () => {
  const asStrings = files.map(async key => [key, await read(key)])
  const values = await Promise.all(asStrings)
  const res = Object.fromEntries(values)
  await fs.promises.writeFile('./assets.json', JSON.stringify(res))
  console.log(res)
}

main()
