const fs = require('fs')

const files = ['assault', 'hold', 'mine', 'scout', 'torpedo']

const main = async () => {
  const values = await Promise.all(
    files.map(async f => ({
      key: f,
      value: await fs.promises.readFile(`./${f}.ts.txt`, 'utf-8'),
    }))
  )
  console.log(values)
  const res = values.reduce(
    (acc, val) => ({ [val.key]: val.value, ...acc }),
    {}
  )

  console.log(res)
  fs.promises.writeFile('./assets.json', JSON.stringify(res))
}

main()
