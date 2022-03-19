import { useState, useEffect } from 'react'
import { Button } from '@/components/button'
import { Renderer } from '@/renderer'
import * as svb from '@svb-41/engine'
import { useEngine, State } from '@/lib/engine'
import styles from './ai.module.css'
import { AI } from '@/lib/ai'
import { getSimulation } from '@/services/mission'

type SHIP_CLASS = svb.engine.ship.SHIP_CLASS
const { SHIP_CLASS } = svb.engine.ship

export type Props = { ai: AI }
export const Simulation = ({ ai }: Props) => {
  const simulation = getSimulation('0')!
  const [ship, setShip] = useState<SHIP_CLASS>(SHIP_CLASS.FIGHTER)
  const [state, setState] = useState<State>('preparation')

  const { engine, setFleet, start } = useEngine({
    team: 'blue',
    enemy: 'red',
    ais: [ai],
    mission: simulation,
  })

  useEffect(() => {
    const ships = { 1: { 1: ship } }
    const AIs = { 1: { 1: ai.id } }
    const fleet = { ships, AIs }
    setFleet(fleet)
    start(setState)
  }, [ship, ai])

  return (
    <div className={styles.testRenderer}>
      <Button text={state} onClick={() => start(setState)} />
      {state !== 'preparation' && <Renderer engine={engine!} />}
    </div>
  )
}
