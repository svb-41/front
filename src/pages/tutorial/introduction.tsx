import {
  Fragment,
  createElement,
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
} from 'react'
import { Row, Column } from '@/components/flex'
import { Button } from '@/components/button'
import styles from './tutorial.module.css'
import s from './texts.strings.json'
import {
  useTransition,
  useSpring,
  animated,
  config,
  easings,
} from 'react-spring'

const contentsLen = Object.keys(s.contents).length - 2

const asItalic = (value: string, index: number) => {
  const even = index % 2 === 0
  const style = even ? {} : { style: { fontStyle: 'italic' } }
  const tag = even ? Fragment : 'span'
  return createElement(tag, { ...style, key: index }, value)
}

const useSimulatedScroll = (updateAfter: number) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const inited = useRef(false)
  const [style, api] = useSpring(() => ({
    opacity: 0,
    transform: `translateY(${window.innerHeight / 2}px)`,
    config: config.slow,
  }))
  const init = useRef<number>()
  const mini = useRef(0)
  const size = useRef<any>(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const innerHeight = Math.round(
    (containerRef.current?.getBoundingClientRect().height ??
      window.innerHeight) / 2
  )
  useLayoutEffect(() => {
    if (ref.current) {
      const size_ = ref.current.getBoundingClientRect()
      mini.current = Math.min(100, mini.current + 100)
      if (!init.current) init.current = size_.height
      const s = size_.height - mini.current
      size.current = s
      const transform = `translateY(${innerHeight - size.current}px)`
      api.start({ transform, opacity: 1 })
      inited.current = true
    }
  }, [updateAfter, innerHeight])
  useEffect(() => {
    const handler = (event: WheelEvent) => {
      if (!ref.current) return
      const sizes = ref.current?.getBoundingClientRect()
      const max = Math.max(size.current + event.deltaY, init.current!)
      const min = Math.min(max, sizes.height - mini.current)
      size.current = min
      api.start({ transform: `translateY(${innerHeight - size.current}px)` })
    }
    document.addEventListener('wheel', handler)
    return () => document.removeEventListener('wheel', handler)
  }, [innerHeight])
  return useMemo(() => ({ style, ref, containerRef }), [style])
}

const Animated = animated(Column)

const Explanations = (
  props: Props & {
    displayed: number
    setDisplayed: (value: number) => void
    fightStarted: boolean
    onClick: () => void
  }
) => {
  return (
    <Column gap="xl" padding="l">
      <div>{s.explanations.okBluesaille}</div>
      <Column gap="xl" className={styles.introductionTexts}>
        <div>{s.explanations.illShowYou}</div>
        {props.displayed > 0 && <div>{s.explanations.whatDoYouThink}</div>}
      </Column>
      <Row style={{ paddingTop: 'var(--l)' }} justify="flex-end">
        <Button
          small
          primary
          disabled={props.displayed !== 0}
          text={props.displayed === 0 ? s.explanations.startFight : s.continue}
          onClick={props.onClick}
        />
      </Row>
    </Column>
  )
}

const SmallTalk = ({
  displayed,
  ended,
  onClick,
}: {
  displayed: number
  ended: boolean
  onClick: () => void
}) => {
  return (
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
  )
}

export type Props = {
  onNext: () => void
  onStartFight: () => Promise<void>
}
export const Introduction = (props: Props) => {
  const [pages, setPages] = useState('pages')
  const [fightStarted, setFightStarted] = useState(false)
  const [displayed, setDisplayed] = useState(0)
  const scroll = useSimulatedScroll(displayed)
  const activeClick = useRef(false)
  const onClick = async () => {
    if (activeClick.current) return
    activeClick.current = true
    if (pages === 'explanations') {
      if (displayed === 0) {
        setFightStarted(true)
        await props.onStartFight()
      }
      setDisplayed(d => d + 1)
    }
    if (pages === 'pages') {
      if (displayed >= contentsLen) {
        setPages('empty')
        setTimeout(() => {
          props.onNext()
          setDisplayed(0)
          setPages('explanations')
        }, 300)
      }
      setDisplayed(v => Math.min(contentsLen, v + 1))
    }
    activeClick.current = false
  }
  const ended = displayed === contentsLen
  const transitions = useTransition(pages, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    delay: 50,
    config: config.default,
    exitBeforeEnter: true,
  })
  return transitions(({ opacity }, item) => {
    return (
      <Animated
        height="100%"
        onClick={ended ? undefined : onClick}
        align="center"
        color="var(--111)"
        className={styles.introductionWrapper}
        style={{ opacity }}
      >
        <div ref={scroll.containerRef} style={{ height: '100%' }}>
          <animated.div style={scroll.style} ref={scroll.ref}>
            {item === 'explanations' && (
              <Explanations
                {...props}
                fightStarted={fightStarted}
                onClick={onClick}
                displayed={displayed}
                setDisplayed={setDisplayed}
              />
            )}
            {item === 'pages' && (
              <SmallTalk
                onClick={onClick}
                displayed={displayed}
                ended={ended}
              />
            )}
          </animated.div>
        </div>
      </Animated>
    )
  })
}
