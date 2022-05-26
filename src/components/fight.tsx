import { useState, useEffect, useCallback, useMemo } from 'react'
import { Column } from '@/components/flex'
import { ActivityIndicator } from '@/components/activity-indicator'
import { Renderer } from '@/renderer'
import { useEngine, EnemyData } from '@/lib/engine'
import { AI } from '@/lib/ai'
import { Mission } from '@/services/mission'
import * as fleetManager from '@/components/fleet-manager'

export type Props = {
  fleet: fleetManager.Data
  ais: AI[]
  enemy: EnemyData
  mission: Mission
  onEnd: () => void
  onStart: () => void
  team: string
}
export const Fight = (props: Props) => {
  const { fleet, mission, onEnd, onStart, team, ais, enemy } = props
  const { size, start } = mission
  const player = { team, fleet, ais }
  const engine = useEngine({ onStart, onEnd, player, size, start, enemy })
  const opts = useMemo(() => ({ scale: 0.8, pos: { x: 0, y: -200 } }), [])
  const align = useMemo(() => {
    return engine.engine ? 'stretch' : 'center'
  }, [engine.engine])
  useEffect(() => {
    const run = async () => {
      await engine.start()
      onStart()
    }
    run()
  }, [])
  return (
    <Column flex={1} align={align} justify={align}>
      {!engine.engine && <ActivityIndicator />}
      {engine.engine && <Renderer engine={engine.engine} opts={opts} />}
    </Column>
  )
}
