import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Column } from '@/components/flex'
import { ActivityIndicator } from '@/components/activity-indicator'
import { Renderer } from '@/renderer'
import { useEngine, EnemyData } from '@/lib/engine'
import { AI } from '@/lib/ai'
import { Mission } from '@/services/mission'
import * as fleetManager from '@/components/fleet-manager'
import { Summary } from '@/pages/missions/summary'

export type State = 'loading' | 'running' | 'ended'
export type Props = {
  fleet: fleetManager.Data
  ais: AI[]
  enemy: EnemyData
  mission: Mission
  onEnd?: () => void
  onStart?: () => void
  onClose?: () => void
  team: string
  Ended?: React.ReactNode
}
export const Fight = (props: Props) => {
  const { fleet, mission, team, ais, enemy } = props
  const { size, start } = mission
  const [state, setState] = useState<State>('loading')
  const player = { team, fleet, ais }
  const onStartEnd = useRef({ onStart: props.onStart, onEnd: props.onEnd })
  useEffect(() => {
    const { onStart, onEnd } = props
    onStartEnd.current = { onStart, onEnd }
  }, [props.onStart, props.onEnd])
  const onStart = useCallback(() => {
    setState('running')
    onStartEnd.current.onStart?.()
  }, [])
  const onEnd = useCallback(() => {
    setState('ended')
    onStartEnd.current.onEnd?.()
  }, [])
  const engine = useEngine({ onStart, onEnd, player, size, start, enemy })
  const opts = useMemo(() => ({ scale: 0.8, pos: { x: 0, y: -200 } }), [])
  const align = useMemo(() => {
    return engine.engine ? 'stretch' : 'center'
  }, [engine.engine])
  useEffect(() => {
    engine.start()
  }, [])
  const isLoading = state === 'loading'
  const isRunning = engine.engine && state === 'running'
  const isEnded = engine.engine && state === 'ended'
  return (
    <Column flex={1} align={align} justify={align}>
      {isLoading && <ActivityIndicator />}
      {isRunning && <Renderer engine={engine.engine!} opts={opts} />}
      {isEnded &&
        (props.Ended ?? (
          <Summary
            team={team}
            engine={engine.engine!}
            restart={() => engine.start()}
            replay={() => engine.start()}
            back={() => props.onClose?.()}
            mission={mission}
          />
        ))}
    </Column>
  )
}
