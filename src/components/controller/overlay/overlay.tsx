import { useState, useEffect, Fragment } from 'react'
import * as Gamepad from '@/components/controller/gamepad'
import * as Dpad from '@/components/controller/overlay/dpad'
import styles from '@/components/controller/overlay/overlay.module.css'

type ABXYButtonProps = {
  gamepad: Gamepad | undefined
  color: string
  index: number
  letter: 'X' | 'Y' | 'A' | 'B'
}
const ABXYButton = ({ gamepad, index, color, letter }: ABXYButtonProps) => {
  const background = gamepad?.buttons?.[index]?.pressed ? color : undefined
  const className = (() => {
    switch (letter) {
      case 'X':
        return styles.abxyX
      case 'Y':
        return styles.abxyY
      case 'B':
        return styles.abxyB
      case 'A':
        return styles.abxyA
    }
  })()
  return <div className={className} style={{ background }} />
}

type SelectStartProps = {
  type: 'select' | 'start'
  gamepad: Gamepad | undefined
}
const SelectStart = ({ type, gamepad }: SelectStartProps) => {
  const wrap = type === 'select' ? styles.selectWrapper : styles.startWrapper
  const clas = type === 'select' ? styles.select : styles.start
  const index = type === 'select' ? 8 : 9
  const background = gamepad?.buttons?.[index]?.pressed ? '#444' : undefined
  return (
    <div className={wrap}>
      <div className={clas} style={{ background }} />
      {type === 'select' ? 'SELECT' : 'START'}
    </div>
  )
}

type ControllerOverlayProps = { gamepad: Gamepad | undefined }
const ControllerOverlay = ({ gamepad }: ControllerOverlayProps) => (
  <div className={styles.controller}>
    <div className={styles.buttons}>
      <div className={styles.dpad}>
        <Dpad.Up className={styles.dpadUp} gamepad={gamepad} />
        <Dpad.Right className={styles.dpadRight} gamepad={gamepad} />
        <Dpad.Down className={styles.dpadDown} gamepad={gamepad} />
        <Dpad.Left className={styles.dpadLeft} gamepad={gamepad} />
      </div>
      <SelectStart type="select" gamepad={gamepad} />
      <SelectStart type="start" gamepad={gamepad} />
      <div className={styles.abxy}>
        <ABXYButton gamepad={gamepad} index={3} color="darkblue" letter="X" />
        <ABXYButton gamepad={gamepad} index={1} color="darkred" letter="A" />
        <ABXYButton gamepad={gamepad} index={0} color="orange" letter="B" />
        <ABXYButton gamepad={gamepad} index={2} color="darkgreen" letter="Y" />
      </div>
    </div>
  </div>
)

const Display = () => {
  const [gamepads, setGamepads] = useState<Gamepad[]>([])
  useEffect(() => {
    const id = setInterval(() => setGamepads(Gamepad.get()), 100)
    return () => clearInterval(id)
  }, [])
  return <ControllerOverlay gamepad={gamepads[0]} />
}

export const Controller = () => {
  const [visible, setVisible] = useState(false)
  return (
    <Fragment>
      <button onClick={() => setVisible(t => !t)} className={styles.toggler}>
        {visible ? 'Hide Controller' : 'Show Controller'}
      </button>
      {visible && <Display />}
    </Fragment>
  )
}
