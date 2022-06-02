const fs = require('fs/promises')
const path = require('path')

const main = async () => {
  const fetch = await import('node-fetch')
  const controllers = path.resolve(__dirname, '../controllers')
  const files = await fs.readdir(controllers)
  const final = files.filter(f => f !== 'index.ts')
  await Promise.all(
    final.map(async p => {
      const pa = path.resolve(controllers, p)
      const code = await fs.readFile(pa, 'utf-8')
      const name = p
      const uid = 'test-to-delete'
      const body = JSON.stringify({ code, name, uid })
      const res = await fetch.default('http://localhost:3333/compile', {
        method: 'POST',
        body,
      })
      const code_ = await res.text()
      await fs.writeFile(
        path.resolve(__dirname, `ais/${p.split('.')[0]}.json`),
        JSON.stringify(code_)
      )
    })
  )
}

main()
