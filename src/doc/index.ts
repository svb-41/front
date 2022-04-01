import mainDoc from './E-001-encyclopaedia.md'
import whatIsThis from './G-001-what-is-svb-41.md'
import howtoPlay from './G-002-how-to-play.md'

export let guides: { title: string; number: string; text: string }[] = []
export let encyclopaedia: { title: string; number: string; text: string }[] = []
export let all: { title: string; number: string; text: string }[] = []

export const load = async () => {
  const encyclopaedia_ = [
    { url: mainDoc, number: 'E-001', title: 'Encyclopaedia' },
  ]
  const guides_ = [
    { url: whatIsThis, number: 'G-001', title: 'What is SVB-41?' },
    { url: howtoPlay, number: 'G-002', title: 'How-to play?' },
  ]
  guides = await Promise.all(
    guides_.map(async doc => {
      const response = await fetch(doc.url)
      const text = await response.text()
      return { title: doc.title, number: doc.number, text }
    })
  )
  encyclopaedia = await Promise.all(
    encyclopaedia_.map(async doc => {
      const response = await fetch(doc.url)
      const text = await response.text()
      return { title: doc.title, number: doc.number, text }
    })
  )
  const s = ({ number: n1 }: any, { number: n2 }: any) =>
    n1 > n2 ? 1 : n1 === n2 ? 0 : -1
  guides.sort(s)
  encyclopaedia.sort(s)
  all = [...guides, ...encyclopaedia]
  return true
}
