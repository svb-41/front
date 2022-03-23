import { useState, useRef, useEffect } from 'react'
import { AI } from '@/lib/ai'
import { Button } from '@/components/button'
import * as selectors from '@/store/selectors'
import { useSelector, useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions/user'
import { Title, Explanations } from '@/components/title'
import { Row, Column } from '@/components/flex'
import { ShipSelector } from './tabs'
import { Grid } from './grid'
import { AllShips, SHIP_CLASS } from './type'
import { v4 as uuid } from 'uuid'
import styles from './fleet-manager.module.css'

type FleetTitleProps = {
  team: string
  onLoad: () => void
  onSave: () => void
  isConf: boolean
}
const FleetTitle = ({ team, isConf, onLoad, onSave }: FleetTitleProps) => {
  const background = `var(--team-${team})`
  const conf = isConf ? '' : 'new '
  return (
    <Column background="var(--eee)" padding="m" gap="s">
      <Row justify="space-between" gap="m">
        <Row gap="l" align="center">
          <Title content="Construct your fleet" />
          <span className={styles.teamName} style={{ background }}>
            {team.toUpperCase()}
          </span>
        </Row>
        <Column gap="s" className={styles.alignSelfStart}>
          <Button small text="Load fleet config" onClick={onLoad} secondary />
          <Button
            small
            text={`Save ${conf} config`}
            onClick={onSave}
            secondary
          />
        </Column>
      </Row>
      <Explanations
        color="var(--888)"
        content="Select your ships, drag and drop, and give them an AI"
      />
    </Column>
  )
}

export type Props = {
  ships: string[]
  team: string
  ais: AI[]
  onValidConfiguration: (data: any | null) => void
  width: number
  height: number
  onShipClick: (id: string) => void
  onAIClick: (id: string) => void
}
export const FleetManager = (props: Props) => {
  const { team, ais } = props
  const [ships, setShips] = useState<AllShips>([])
  const [loadedConf, setLoadedConf] = useState<string>()
  const dragVal = useRef<string | undefined>()
  const aiRef = useRef<string | undefined>()
  const confs = useSelector(selectors.fleetConfigs)
  const dispatch = useDispatch()

  // const loadDataFromStore = (id: string) => {
  //   const conf = confs?.[id]
  //   if (conf) {
  //     setData(conf)
  //     setLoadedConf(id)
  //   }
  // }
  //
  // const saveFleetConfig = () => {
  //   dispatch(actions.saveFleetConfig(data, loadedConf))
  // }

  const onDragStart = (ship: string) => {
    aiRef.current = undefined
    dragVal.current = ship
  }
  const onAIDragStart = (ai: string) => {
    dragVal.current = undefined
    aiRef.current = ai
  }
  const onDrop = ({ x, y }: { x: number; y: number }) => {
    if (dragVal.current) {
      const shipClass = dragVal.current as SHIP_CLASS
      setShips(ships => {
        const s = { id: uuid(), x, y, shipClass }
        return [...ships, s]
      })
      dragVal.current = undefined
    }
  }
  // const selectAI = (x: number, y: number, ai: AI) => {
  //   if (ai.compiledValue) {
  //     const atX = data.AIs[x] ?? {}
  //     const vals = ai.id
  //     const final = { ...atX, [y]: vals }
  //     const AIs = { ...data.AIs, [x]: final }
  //     setData({ ...data, AIs })
  //   }
  // }
  const { onValidConfiguration } = props
  useEffect(() => {
    let atLeastOne = false
    // const oneBy = (data: ByCoords<any>, comp: ByCoords<any>) => {
    //   return Object.entries(data).reduce((acc, [x, value]) => {
    //     const allTrue = Object.entries(value).reduce((acc2, [y, val]) => {
    //       const x_ = parseInt(x)
    //       const y_ = parseInt(y)
    //       const dat = comp[x_]?.[y_]
    //       const exists = dat && val
    //       if (exists) atLeastOne = true
    //       return acc2 && exists
    //     }, acc)
    //     return acc && allTrue
    //   }, true)
    // }
    // const isValid =
    //   oneBy(data.ships, data.AIs) && oneBy(data.AIs, data.ships) && atLeastOne
    // onValidConfiguration(isValid ? data : null)
  }, [ships, onValidConfiguration])
  const lastPlacement = useRef({ x: 30, y: 30 })
  return (
    <Column gap="xl" flex={3}>
      <FleetTitle
        team={team}
        onSave={() => {}}
        onLoad={() => {}}
        isConf={!!loadedConf}
      />
      <Row gap="xl" flex={1}>
        <ShipSelector
          ships={props.ships}
          onDragStart={onDragStart}
          onAIDragStart={onAIDragStart}
          team={team}
          setShipDetails={props.onShipClick}
          setAIDetails={props.onAIClick}
          ais={ais}
          onShipClick={(shipClass: SHIP_CLASS) =>
            setShips(ships => {
              if (!lastPlacement.current) return ships
              const { x, y } = lastPlacement.current
              const s = { id: uuid(), x, y, shipClass }
              const newY = Math.max((y + 40) % 520, 30)
              const newX = newY < y ? Math.max((x + 40) % 240, 30) : x
              lastPlacement.current = { x: newX, y: newY }
              return [...ships, s]
            })
          }
        />
        <Grid
          team={team}
          ships={ships}
          width={props.width}
          height={props.height}
          onDrop={onDrop}
          onUpdate={(id, x, y) => {
            setShips(ships => {
              return ships.map(s => {
                if (s.id === id) return { ...s, x, y }
                return s
              })
            })
          }}
        />
      </Row>
    </Column>
  )
}
