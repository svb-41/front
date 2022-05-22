import {
  Fragment,
  createElement,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
} from 'react'
import { Row, Column } from '@/components/flex'
import { Button } from '@/components/button'

const titles: { [key: string]: string } = {
  welcome: 'Welcome cadet',
}

const contents: { [key: string]: string } = {
  watching:
    'We were watching for your progress since years, and we were eager to know you among us.',
  exploration:
    'You’re probably aware that the galaxy is open to exploration. Since a couple of centuries, humans started to colonize space. The moon is already at war between Earth forces, and we don’t wan’t to be part of that. Our mission at Centauri is simple: we fly through the infinities, and find more resources, lands and maybe outer life.',
  notBoring:
    'Far from me the idea to be boring or pedantic, but let me remember you some important things.',
  before:
    'As you may know, we’re not the type of people you already know. We’re building fleets, and we’re AI-first. Oh, I think a company from old world said something like that… What was their name again…? Something starting with a “G” I think. Anyway, forget about that. We’re building AI able to run ships. Ships like starships. We’re not _doing_ rocket science. We’re _launching rockets_ in _space_.',
  process:
    'The road is long, and full of embush. I hope you’re ready, because once you join us, there’s no turning back.',
  shall: 'Shall we begin?',
}

const contentsLen = Object.keys(contents).length - 1

const FirstScreen = () => {
  const init = useRef<number>()
  const mini = useRef(0)
  const columnRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState(0)
  const [displayed, setDisplayed] = useState(0)
  const [transition, setTransition] = useState(false)
  const onClick = () => {
    if (displayed >= contentsLen) return
    setTransition(true)
    setDisplayed(v => Math.min(contentsLen, v + 1))
    setTimeout(() => setTransition(false), 1000)
  }
  const innerHeight = window.innerHeight / 2
  useLayoutEffect(() => {
    if (columnRef.current) {
      const size = columnRef.current.getBoundingClientRect()
      mini.current = Math.min(200, mini.current + 100)
      if (!init.current) init.current = size.height
      setSize(size.height - mini.current)
    }
  }, [displayed])
  useEffect(() => {
    const fun = (event: WheelEvent) => {
      if (!columnRef.current) return
      const sizes = columnRef.current?.getBoundingClientRect()
      setSize(s => {
        const max = Math.max(s + event.deltaY, init.current!)
        const min = Math.min(max, sizes.height - mini.current)
        return min
      })
    }
    document.addEventListener('wheel', fun)
    return () => document.removeEventListener('wheel', fun)
  }, [])
  return (
    <Column
      onClick={displayed === contentsLen ? undefined : onClick}
      background="var(--eee)"
      flex={1}
      align="center"
      style={{
        fontSize: '2.3rem',
        overflow: 'hidden',
      }}
    >
      <div
        ref={columnRef}
        style={{
          transition: transition ? 'all 1s' : 'all .3s',
          transform: `translateY(calc(${innerHeight}px - ${size}px))`,
        }}
      >
        <Column gap="m">
          <div>{titles.welcome}</div>
          <Column
            gap="l"
            maxWidth={700}
            style={{
              fontFamily: 'Unifont',
              fontSize: '1.2rem',
              lineHeight: 1.3,
              whiteSpace: 'pre-line',
            }}
          >
            <div>{contents.watching}</div>
            {displayed >= 1 && <div>{contents.exploration}</div>}
            {displayed >= 2 && <div>{contents.notBoring}</div>}
            {displayed >= 3 && (
              <div>
                {contents.before.split('_').map((value, i) => {
                  const even = i % 2 === 0
                  const style = even ? {} : { style: { fontStyle: 'italic' } }
                  const tag = even ? Fragment : 'span'
                  return createElement(tag, { ...style, key: i }, value)
                })}
              </div>
            )}
            {displayed >= 4 && <div>{contents.process}</div>}
            {displayed >= 5 && <div>{contents.shall}</div>}
          </Column>
          <Row style={{ paddingTop: 'var(--l)' }} justify="flex-end">
            <Button
              small
              onClick={onClick}
              disabled={displayed < contentsLen}
              primary
              text={
                displayed === contentsLen
                  ? 'Click to start'
                  : 'Click to continue…'
              }
            />
          </Row>
        </Column>
      </div>
    </Column>
  )
}

export const Tutorial = () => {
  return <FirstScreen />
}
