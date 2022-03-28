import { FC, useState, useRef, useEffect, useMemo } from 'react'
import { AI } from '@/lib/ai'
import { Button } from '@/components/button'
import * as selectors from '@/store/selectors'
import { useSelector, useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions/user'
import { Title, SubTitle, Explanations } from '@/components/title'
import { Row, Column } from '@/components/flex'
import { ShipSelector } from './tabs'
import { Grid } from './grid'
import { AllShips, AllAIs, Ship, Data, SHIP_CLASS } from './type'
import { getImage } from '@/helpers/ships'
import tsLogo from '@/components/monaco/ts.svg'
import * as helpers from '@/helpers'
import { v4 as uuid } from 'uuid'
import * as svb from '@svb-41/engine'
import styles from './fleet-manager.module.css'
export type { Data } from './type'

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

const RotationShip = ({
  ship,
  onUpdate,
  rotation,
  team,
}: {
  ship?: Ship
  onUpdate: (ship: Ship) => void
  rotation: number
  team: string
}) => {
  const shipClass = ship?.shipClass ?? svb.engine.ship.SHIP_CLASS.FIGHTER
  const src = getImage(shipClass, team)
  return (
    <Row
      onClick={() => ship && onUpdate({ ...ship, rotation })}
      background="var(--ddd)"
      align="center"
      justify="center"
    >
      <img
        className={styles.rotationShipImg}
        style={{
          transform: `rotate(${rotation}deg)`,
          filter: ship ? undefined : 'brightness(0.3)',
        }}
        src={src}
      />
    </Row>
  )
}

const ShipDetails = ({
  team,
  ship,
  ai,
  onUpdate,
  onDelete,
  unselect,
}: {
  team: string
  ship?: Ship
  ai?: AI
  onUpdate: (ship: Ship) => void
  onDelete: (ship: Ship) => void
  unselect: () => void
}) => {
  return (
    <Column background="var(--eee)" padding="xl" gap="l">
      <Row gap="l" justify="space-between" align="flex-start">
        <Column>
          <Title content="Ship details" />
          <p style={{ color: 'var(--888)' }}>Select a ship to change details</p>
        </Column>
        <Row gap="s">
          <Button
            small
            primary
            disabled={!ship}
            text="Unselect"
            onClick={unselect}
          />
          <Button
            small
            warning
            disabled={!ship}
            text="Delete"
            onClick={() => onDelete(ship!)}
          />
        </Row>
      </Row>
      <Row gap="l">
        <Column gap="s">
          <SubTitle content="Position" />
          <Row gap="s">
            <div className={styles.detailsGrid}>
              <Explanations content="x" />
              <input
                size={3}
                disabled={!ship}
                className={styles.inputNumber}
                type="number"
                value={ship?.x ?? 0}
                onChange={event => {
                  if (!ship) return
                  const x_ = parseInt(event.target.value)
                  const x = isNaN(x_) ? 4 : Math.max(4, Math.min(260, x_))
                  onUpdate({ ...ship, x })
                }}
              />
              <Explanations content="y" />
              <input
                size={3}
                disabled={!ship}
                className={styles.inputNumber}
                type="number"
                value={ship?.y ?? 0}
                onChange={event => {
                  if (!ship) return
                  const y_ = parseInt(event.target.value)
                  const y = isNaN(y_) ? 4 : Math.max(4, Math.min(556, y_))
                  onUpdate({ ...ship, y })
                }}
              />
              <Explanations content="rotation" />
              <input
                size={3}
                disabled={!ship}
                className={styles.inputNumber}
                type="number"
                value={ship?.rotation ?? 0}
                onChange={event => {
                  if (!ship) return
                  const r_ = parseInt(event.target.value)
                  const rotation = isNaN(r_) ? 0 : (r_ + 360) % 360
                  onUpdate({ ...ship, rotation })
                }}
              />
            </div>
            <div className={styles.rotationPositions}>
              {[315, 0, 45, 270, null, 90, 225, 180, 135].map((rot, index) => {
                if (rot === null) return <div key={index} />
                return (
                  <RotationShip
                    key={index}
                    ship={ship}
                    team={team}
                    onUpdate={onUpdate}
                    rotation={rot}
                  />
                )
              })}
            </div>
          </Row>
        </Column>
        <Column gap="s">
          <SubTitle content="AI" />
          {!ai && (
            <Row background="var(--fff)" padding="m">
              <p>No AI selected.</p>
            </Row>
          )}
          {ai && (
            <Column background="var(--ddd)" padding="s" gap="s" width={170}>
              <Row align="center" gap="s">
                <img
                  src={tsLogo}
                  className={styles.logo}
                  alt="TypeScript Logo"
                />
                <div className={styles.pathName}>{ai.file.path}</div>
              </Row>
              {ai.description && (
                <p className={styles.aiDescription}>{ai.description}</p>
              )}
              <Column align="flex-end">
                <div className={styles.dates}>
                  Created at {helpers.dates.toLocale(new Date(ai.createdAt))}
                </div>
                <div className={styles.dates}>
                  Updated at {helpers.dates.toLocale(new Date(ai.updatedAt))}
                </div>
              </Column>
            </Column>
          )}
        </Column>
      </Row>
    </Column>
  )
}

export type Props = {
  ships: string[]
  team: string
  ais: AI[]
  onValidConfiguration: (data: Data | null) => void
  onShipClick: (id: string) => void
  onAIClick: (id: string) => void
}
export const FleetManager: FC<Props> = props => {
  const { team } = props
  const [ships, setShips] = useState<AllShips>([])
  const [ais, setAIs] = useState<AllAIs>([])
  const [loadedConf, setLoadedConf] = useState<string>()
  const [selectedShip, setSelectedShip] = useState<string>()
  const dragVal = useRef<string | undefined>()
  const confs = useSelector(selectors.fleetConfigs)
  const dispatch = useDispatch()
  const [tab, setTab] = useState<'ships' | 'ai'>('ships')
  const [quickEdition, setQuickEdition] = useState(true)

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
    dragVal.current = ship
  }
  const onDrop = ({ x, y }: { x: number; y: number }) => {
    if (dragVal.current) {
      const shipClass = dragVal.current as SHIP_CLASS
      const id = uuid()
      setShips(ships => {
        const s = { id, x, y, shipClass, rotation: 0 }
        return [...ships, s]
      })
      dragVal.current = undefined
      return id
    }
  }
  const validConfig = useMemo(() => ({ ships, ais }), [ships, ais])
  useEffect(() => {
    const isValid =
      ships.length > 0 &&
      ships.reduce(
        (acc, val) => acc && Boolean(ais.find(ai => ai.sid === val.id)),
        true
      )
    props.onValidConfiguration(isValid ? validConfig : null)
  }, [ships, ais, props.onValidConfiguration])
  const lastPlacement = useRef({ x: 30, y: 30 })
  const selectedAID = ais.find(ai => ai.sid === selectedShip)?.aid
  const selectedAI = props.ais.find(ai => ai.id === selectedAID)
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
          state={tab}
          setState={setTab}
          ships={props.ships}
          onDragStart={onDragStart}
          team={team}
          setShipDetails={props.onShipClick}
          setAIDetails={props.onAIClick}
          ais={props.ais.filter(ai => !!ai.compiledValue)}
          onAIClick={(aid: string) => {
            setAIs(ais => {
              if (!selectedShip) return ais
              const filtered = ais.filter(ai => ai.sid !== selectedShip)
              return [...filtered, { sid: selectedShip, aid }]
            })
            if (quickEdition) setTab('ships')
          }}
          onShipClick={(shipClass: SHIP_CLASS) => {
            if (!lastPlacement.current) return
            const id = uuid()
            const x = lastPlacement.current.x
            const y = lastPlacement.current.y
            const newY = Math.max((y + 40) % 520, 30)
            const newX = newY < y ? Math.max((x + 40) % 240, 30) : x
            lastPlacement.current = { x: newX, y: newY }
            setShips(ships => {
              const s = { id, x, y, shipClass, rotation: 90 }
              setSelectedShip(id)
              return [...ships, s]
            })
            if (quickEdition) setTab('ai')
          }}
        />
        <Grid
          team={team}
          ships={ships}
          aiIDs={ais}
          ais={props.ais}
          selectedShip={selectedShip}
          setSelectedShip={setSelectedShip}
          onDrop={onDrop}
          quickEdition={quickEdition}
          setQuickEdition={() => setQuickEdition(s => !s)}
          onUpdate={(id, x, y) => {
            setShips(ships => {
              return ships.map(s => {
                if (s.id === id) return { ...s, x, y }
                return s
              })
            })
          }}
        />
        <Column flex={1} gap="xl">
          <ShipDetails
            team={team}
            ship={ships.find(s => s.id === selectedShip)}
            ai={selectedAI}
            unselect={() => setSelectedShip(undefined)}
            onDelete={ship => {
              setShips(ships => ships.filter(s => s.id !== ship.id))
              setAIs(ais => ais.filter(ai => ai.sid !== ship.id))
              setSelectedShip(undefined)
            }}
            onUpdate={ship => {
              setShips(ships => {
                return ships.map(s => {
                  if (s.id === ship.id) return ship
                  return s
                })
              })
            }}
          />
          {props.children}
        </Column>
      </Row>
    </Column>
  )
}
