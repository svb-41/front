import * as fs from 'fs/promises'
import * as path from 'path'

const cwd = process.cwd()
const docsPath = path.resolve(cwd, 'src/doc')
const imgsPath = path.resolve(docsPath, 'img')
const publicPath = path.resolve(cwd, 'public')
const publicImgPath = path.resolve(publicPath, 'img')
const tsDocsPath = path.resolve(cwd, 'src/database')
const files = await fs.readdir(imgsPath)
const gifs = files.filter(f => f.endsWith('.gif'))
await fs.mkdir(publicImgPath, { recursive: true })

for (const gif of gifs) {
  const filePath = path.resolve(imgsPath, gif)
  const destPath = path.resolve(publicImgPath, gif)
  await fs.copyFile(filePath, destPath)
}

// const docs = await fs.readdir(docsPath, { withFileTypes: true })
// const mds = docs.flatMap(doc => {
//   if (doc.isDirectory()) return []
//   if (!doc.name.endsWith('.md')) return []
//   return [doc.name]
// })
// mds.sort()
// await fs.mkdir(tsDocsPath, { recursive: true })
//
// for (const md of mds) {
//   const filePath = path.resolve(docsPath, md)
//   const destPath = path.resolve(tsDocsPath, md.replace('.md', '.ts'))
//   const content = await fs.readFile(filePath, 'utf-8')
//   await fs.writeFile(destPath, `export default \`${content}\``)
// }
