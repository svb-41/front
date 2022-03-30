import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/button'
import { Row, Column } from '@/components/flex'
import { Title } from '@/components/title'
import { ActivityIndicator } from '@/components/activity-indicator'
import { Renderer } from '@/renderer'
import * as svb from '@svb-41/engine'
import { useEngine, State } from '@/lib/engine'
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

type SimulationState = State | 'loading'
export type Props = { ai: AI; beforeLaunch: () => Promise<void> }
export const Simulation = ({ ai, beforeLaunch }: Props) => {
  const simulation = getSimulation('0')!
  const [ship] = useState<SHIP_CLASS>(SHIP_CLASS.FIGHTER)
  const [state, setState] = useState<SimulationState>('preparation')

  const { engine, setFleet, start, reset } = useEngine({
    team: 'blue',
    enemy: 'red',
    ais: [ai],
    mission: simulation,
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
  }, [ship, ai, defaultFleet])

  const onLaunch = async () => {
    setState('loading')
    try {
      await beforeLaunch()
      start(setState)
    } catch (error) {
      setState('preparation')
    }
  }

  return (
    <div className={styles.testRenderer}>
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
      {state === 'engine' && (
        <Renderer
          engine={engine!}
          opts={{ scale: 0.8, pos: { x: 0, y: -200 } }}
        />
      )}
      {state === 'preparation' && <Preparation onClick={onLaunch} />}
      {state === 'loading' && <RenderLoading />}
    </div>
  )
}
