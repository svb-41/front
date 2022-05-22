import {
  Fragment,
  createElement,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
  useCallback,
} from 'react'
import { Row, Column } from '@/components/flex'
import { Button } from '@/components/button'
import styles from './tutorial.module.css'
import s from './texts.strings.json'

const contentsLen = Object.keys(s.contents).length - 2

const toTransform = (trans: boolean) => `transform ${trans ? '1s' : '.3s'}`
const toTranslate = (a: number, b: number) => `translateY(${a - b}px)`

const asItalic = (value: string, index: number) => {
  const even = index % 2 === 0
  const style = even ? {} : { style: { fontStyle: 'italic' } }
  const tag = even ? Fragment : 'span'
  return createElement(tag, { ...style, key: index }, value)
}

const useSimulatedScroll = (updateAfter: any) => {
  const init = useRef<number>()
  const mini = useRef(0)
  const [size, setSize] = useState(0)
  const [trans, setTransition] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const innerHeight = window.innerHeight / 2
  useLayoutEffect(() => {
    if (ref.current) {
      const size = ref.current.getBoundingClientRect()
      mini.current = Math.min(200, mini.current + 100)
      if (!init.current) init.current = size.height
      setSize(size.height - mini.current)
    }
  }, [updateAfter])
  useEffect(() => {
    const handler = (event: WheelEvent) => {
      if (!ref.current) return
      const sizes = ref.current?.getBoundingClientRect()
      setSize(s => {
        const max = Math.max(s + event.deltaY, init.current!)
        const min = Math.min(max, sizes.height - mini.current)
        return min
      })
    }
    document.addEventListener('wheel', handler)
    return () => document.removeEventListener('wheel', handler)
  }, [])
  const slowTransition = useCallback(() => setTransition(false), [])
  const quickTransition = useCallback(() => setTransition(true), [])
  const style = useMemo(() => {
    const transition = toTransform(trans)
    const transform = toTranslate(innerHeight, size)
    return { transition, transform }
  }, [innerHeight, size, trans])
  return { slowTransition, quickTransition, style, ref }
}

export const Introduction = ({ onNext }: { onNext: () => void }) => {
  const [displayed, setDisplayed] = useState(0)
  const scroll = useSimulatedScroll(displayed)
  const onClick = () => {
    if (displayed >= contentsLen) onNext()
    scroll.quickTransition()
    setDisplayed(v => Math.min(contentsLen, v + 1))
    setTimeout(() => scroll.slowTransition(), 1000)
  }
  const ended = displayed === contentsLen
  return (
    <Column
      onClick={ended ? undefined : onClick}
      background="var(--eee)"
      flex={1}
      align="center"
      color="var(--111)"
      className={styles.introductionWrapper}
    >
      <div ref={scroll.ref} style={scroll.style}>
        <Column gap="xl">
          <div>{s.contents.welcome}</div>
          <Column gap="xl" maxWidth={700} className={styles.introductionTexts}>
            <div>{s.contents.watching}</div>
            {displayed >= 1 && <div>{s.contents.exploration}</div>}
            {displayed >= 2 && <div>{s.contents.notBoring}</div>}
            {displayed >= 3 && (
              <div>{s.contents.before.split('_').map(asItalic)}</div>
            )}
            {displayed >= 4 && <div>{s.contents.process}</div>}
            {displayed >= 5 && <div>{s.contents.shall}</div>}
          </Column>
          <Row style={{ paddingTop: 'var(--l)' }} justify="flex-end">
            <Button
              small
              primary
              disabled={!ended}
              onClick={onClick}
              text={ended ? s.start : s.continue}
            />
          </Row>
        </Column>
      </div>
    </Column>
  )
}
