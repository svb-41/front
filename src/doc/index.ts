import mainDoc from './001-main.md'

export let all: { title: string; number: string; text: string }[] = []

export const load = async () => {
  const docs = [{ url: mainDoc, number: '001', title: 'Main' }]
  all = await Promise.all(
    docs.map(async doc => {
      const response = await fetch(doc.url)
      const text = await response.text()
      return { title: doc.title, number: doc.number, text }
    })
  )
  all.sort((a, b) => (a.number < b.number ? 1 : a.number === b.number ? 0 : -1))
  return true
}
