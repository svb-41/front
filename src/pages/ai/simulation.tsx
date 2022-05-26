import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/button'
import { Row, Column } from '@/components/flex'
import { Title } from '@/components/title'
import { ActivityIndicator } from '@/components/activity-indicator'
import { Renderer } from '@/renderer'
import * as svb from '@svb-41/engine'
import { useEngine, useMissionEnemy } from '@/lib/engine'
import styles from './ai.module.css'
import { AI } from '@/lib/ai'
import { getSimulation } from '@/services/mission'
import s from '@/strings.json'

type SHIP_CLASS = svb.engine.ship.SHIP_CLASS
const { SHIP_CLASS } = svb.engine.ship

const Preparation = ({ onClick }: { onClick: () => void }) => (
  <Column flex={1} justify="center" padding="xxl" gap="xl">
    <Title content={s.pages.ais.tryAI} />
    <Row>
      <Button secondary text={s.pages.ais.launchSimulation} onClick={onClick} />
    </Row>
  </Column>
)

const RenderLoading = () => (
  <Column flex={1} justify="center" padding="xxl" gap="m">
    <Title content={s.pages.ais.aiCompiling} />
    <ActivityIndicator />
  </Column>
)

export type Props = {
  ai: AI
  beforeLaunch: () => Promise<void>
  hide?: boolean
}
export const Simulation = ({ ai, beforeLaunch, hide }: Props) => {
  const simulation = getSimulation('0')!
  const [ship] = useState<SHIP_CLASS>(SHIP_CLASS.FIGHTER)
  const [state, setState] = useState('preparation')
  const enemy = useMissionEnemy(simulation, 'red')
  const { engine, setFleet, start, reset } = useEngine({
    onStart: () => setState('engine'),
    onEnd: () => setState('end'),
    player: { team: 'blue', ais: [ai] },
    size: simulation.size,
    start: simulation.start,
    enemy,
  })

  const defaultFleet = useCallback(() => {
    const ships = [{ shipClass: ship, id: 'meh', x: 50, y: 300, rotation: 90 }]
    const ais = [{ aid: ai.id, sid: 'meh' }]
    const fleet = { ships, ais }
    setFleet(fleet)
  }, [setFleet, ai, ship])

  useEffect(() => {
    defaultFleet()
    setState('preparation')
  }, [ship])

  const onLaunch = async () => {
    setState('loading')
    try {
      await beforeLaunch()
      console.log('there ?')
      await start()
    } catch (error) {
      console.log(error)
      setState('preparation')
    }
  }

  const opts = useMemo(() => ({ scale: 0.8, pos: { x: 0, y: -200 } }), [])
  return (
    <div className={styles.testRenderer}>
      {!hide && (
        <Row
          justify="space-between"
          padding="s"
          background="var(--eee)"
          height={50}
        >
          <div style={{ flex: 1 }} />
          <Row align="center" gap="xxl">
            {state === 'engine' && false && (
              <Button
                primary
                small
                text="Stop engine"
                onClick={() => {
                  reset()
                  defaultFleet()
                }}
              />
            )}
            <Button
              secondary
              small
              text={
                state === 'preparation'
                  ? s.pages.ais.launchSimulation
                  : s.pages.ais.relaunchEngine
              }
              onClick={onLaunch}
            />
          </Row>
        </Row>
      )}
      {state === 'engine' && <Renderer engine={engine!} opts={opts} />}
      {state === 'preparation' && <Preparation onClick={onLaunch} />}
      {state === 'loading' && <RenderLoading />}
    </div>
  )
}
