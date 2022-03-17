import { useState, useEffect } from 'react'
import { Button } from '@/components/button'
import { Renderer } from '@/renderer'
import * as svb from '@svb-41/engine'
import { useEngine, State } from '@/lib/engine'
import styles from './ai.module.css'
import { AI } from '@/lib/ai'
import { getSimulation } from '@/services/mission'

export const Simulation = ({ ai }: { ai: AI }) => {
  const simulation = getSimulation('0')!
  const [ship, setShip] = useState<svb.engine.ship.SHIP_CLASS>(
    svb.engine.ship.SHIP_CLASS.FIGHTER
  )
  const [state, setState] = useState<State>('preparation')

  const { engine, setFleet, start, reset } = useEngine({
    team: 'blue',
    enemy: 'red',
    ais: [ai],
    mission: simulation,
  })

  useEffect(() => {
    const fleet = {
      ships: { 1: { 1: ship } },
      AIs: { 1: { 1: ai.id } },
    }
    setFleet(fleet)
    start(setState)
    console.log('start', engine)
  }, [ship, ai])

  return (
    <div className={styles.testRenderer}>
      <Button
        text={state}
        onClick={() => {
          start(setState)
        }}
      />
      {state !== 'preparation' && <Renderer engine={engine!} />}
    </div>
  )
}
