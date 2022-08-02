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
import { Lesson } from './lesson'
import styles from './tutorial.module.css'
import s from './texts.strings.json'
import { useTransition, useSpring, animated, config } from 'react-spring'

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

export type Props = {
  lesson: Lesson
  onNext: () => void
  onStartFight?: () => Promise<boolean>
}
export const Conversation = (props: Props) => {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(true)
    setDisplayed(0)
  }, [props.lesson])
  const [displayed, setDisplayed] = useState(0)
  const scroll = useSimulatedScroll(displayed)
  const activeClick = useRef(false)
  const len = props.lesson.content.length
  const next = props.lesson.content[displayed + 1]
  const onClick = async () => {
    if (activeClick.current) return
    activeClick.current = true
    if (next?.type === 'scenario') {
      if (props.onStartFight) await props.onStartFight()
      setDisplayed(d => d + 2)
    } else {
      if (displayed >= len - 1) {
        setVisible(false)
        setTimeout(() => props.onNext(), 300)
      } else {
        setDisplayed(v => Math.min(len, v + 1))
      }
    }
    activeClick.current = false
  }
  const ended = displayed >= len - 1
  const transitions = useTransition(visible, {
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
        style={{ opacity: item ? opacity : 0 }}
      >
        <div ref={scroll.containerRef} style={{ height: '100%' }}>
          <animated.div style={scroll.style} ref={scroll.ref}>
            <Column
              gap="xl"
              padding={props.lesson.fullscreen ? undefined : 'l'}
            >
              <div>{props.lesson.title}</div>
              <Column
                gap="xl"
                maxWidth={props.lesson.fullscreen ? 700 : undefined}
                className={styles.introductionTexts}
              >
                {props.lesson.content.map((data, index) => {
                  if (displayed < index) return null
                  switch (data.type) {
                    case 'explanations':
                      return <div>{data.content.split('_').map(asItalic)}</div>
                    case 'scenario':
                    case 'fight':
                    default:
                      return null
                  }
                })}
              </Column>
              <Row style={{ paddingTop: 'var(--l)' }} justify="flex-end">
                <Button
                  small
                  primary
                  disabled={!ended && next?.type !== 'scenario'}
                  onClick={onClick}
                  text={
                    next?.type === 'scenario'
                      ? s.startFight
                      : ended
                      ? s.start
                      : s.continue
                  }
                />
              </Row>
            </Column>
          </animated.div>
        </div>
      </Animated>
    )
  })
}
