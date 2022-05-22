import { useState, useEffect, useRef } from 'react'
import { Row, Column } from '@/components/flex'

const texts = {
  welcome: 'Welcome new commander',
  before: 'Before',
}

const contents: typeof texts = {
  welcome:
    'We were watching for your progress since years, and we were eager to know you among us.\nYou’re probably aware that the galaxy is open to exploration. Since a couple of centuries, humans started to colonize space. The moon is already at war between Earth forces, and we don’t wan’t to be part of that. Our mission at Centauri is simple: we fly through the infinities, and find more resources, lands and maybe outer life.',
  before: 'Before anything else, you should choose your color.',
}

const delay = 1000
const FirstScreen = () => {
  const ref = useRef<keyof typeof texts>('welcome')
  const [displayed, setDisplayed] = useState<keyof typeof texts>('welcome')
  const [transition, setTransition] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const onClick = () => {
    setTransition(true)
    setOpacity(0)
    setTimeout(() => {
      switch (ref.current) {
        case 'welcome': {
          const key = 'before'
          ref.current = key
          setTransition(false)
          setDisplayed(key)
          setOpacity(1)
        }
      }
    }, delay)
  }
  return (
    <Column
      onClick={onClick}
      background="var(--eee)"
      flex={1}
      align="center"
      justify="center"
      style={{ fontSize: '2.3rem' }}
    >
      <Column
        gap="m"
        style={{
          transition: transition ? `all ${delay}ms` : undefined,
          opacity,
        }}
      >
        <div>{texts[displayed]}</div>
        <div
          style={{
            fontFamily: 'Unifont',
            fontSize: '1.2rem',
            lineHeight: 1.3,
            whiteSpace: 'pre-line',
            maxWidth: 800,
          }}
        >
          {contents[displayed]}
        </div>
        <div
          style={{
            fontSize: '.8rem',
            color: 'var(--888)',
            textAlign: 'right',
            paddingTop: 'var(--l)',
          }}
        >
          Click to continue…
        </div>
      </Column>
    </Column>
  )
}

export const Tutorial = () => {
  return <FirstScreen />
}
