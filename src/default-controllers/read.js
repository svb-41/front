const fs = require('fs')

const files = ['assault', 'hold', 'mine', 'scout', 'torpedo']

const read = f => fs.promises.readFile(`../controllers/${f}.ts`, 'utf-8')
const main = async () => {
  const asStrings = files.map(async key => [key, await read(key)])
  const values = await Promise.all(asStrings)
  const write = async key => {
    const content = values.find(([k]) => k.includes(key))
    await fs.promises.writeFile(`./${key}.ts.txt`, content)
  }
  const f = files.map(write)
  await Promise.all(f)
  const res = Object.fromEntries(values)
  await fs.promises.writeFile('./assets.json', JSON.stringify(res))
}

main()
