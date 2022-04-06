import { FC, useState, useRef, useEffect, useMemo } from 'react'
import { AI } from '@/lib/ai'
import { Button } from '@/components/button'
import * as selectors from '@/store/selectors'
import { useSelector, useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions/user'
import { Title, SubTitle, Explanations } from '@/components/title'
import { Row, Column } from '@/components/flex'
import { Icon } from '@/components/ship'
import { ShipSelector } from './tabs'
import { Grid } from './grid'
import { AllShips, AllAIs, Ship, Data, SHIP_CLASS } from './type'
import { getImage } from '@/helpers/ships'
import tsLogo from '@/components/monaco/ts.svg'
import * as helpers from '@/helpers'
import { v4 as uuid } from 'uuid'
import * as svb from '@svb-41/engine'
import styles from './fleet-manager.module.css'
import { Movable } from '@/components/movable'

export type { Data } from './type'

type FleetTitleProps = {
  team: string
  onLoad?: () => void
  onErase: () => void
  onSave: () => void
  usedConf?: string
  isValid: boolean
}
const FleetTitle = ({
  usedConf,
  team,
  onLoad,
  onErase,
  onSave,
  isValid,
}: FleetTitleProps) => {
  const background = `var(--team-${team})`
  return (
    <Column background="var(--eee)" padding="m" gap="s">
      <Row justify="space-between" gap="m">
        <Row gap="l" align="center">
          <Title content="Construct your fleet" />
          <span className={styles.teamName} style={{ background }}>
            {team.toUpperCase()}
          </span>
        </Row>
        <Row gap="s" align="flex-start">
          <Row background="var(--ddd)" padding="s">
            {usedConf && `Config: ${usedConf.replace(/-/g, '').slice(0, 10)}…`}
            {!usedConf && `No config used`}
          </Row>
          <Column gap="s" className={styles.alignSelfStart}>
            <Button
              disabled={!onLoad}
              small
              text="Load fleet config"
              onClick={() => onLoad?.()}
              secondary
            />
            <Button
              disabled={!usedConf || !isValid}
              small
              text="Erase config"
              onClick={onErase}
              secondary
            />
            <Button
              disabled={!isValid}
              small
              text="Save new config"
              onClick={onSave}
              secondary
            />
          </Column>
        </Row>
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
        alt="ship"
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

const useConfig = ({ onValidConfiguration }: Props) => {
  const dispatch = useDispatch()
  const confs = useSelector(selectors.fleetConfigs)
  const [visibleLoad, setVisibleLoad] = useState(false)
  const [ships, setShips] = useState<AllShips>([])
  const [ais, setAIs] = useState<AllAIs>([])
  const [usedConf, setUsedConf] = useState<string>()
  const validConfig = useMemo(() => ({ ships, ais }), [ships, ais])
  const isValid = useMemo(() => {
    if (ships.length <= 0) return false
    const f = (id: string) => ais.find(ai => ai.sid === id)
    return ships.reduce((acc, val) => acc && Boolean(f(val.id)), true)
  }, [ships, ais])
  useEffect(() => {
    const data = isValid ? validConfig : null
    onValidConfiguration(data)
  }, [isValid, validConfig, onValidConfiguration])
  const loadDataFromStore = () => setVisibleLoad(true)
  const erase = () => {
    if (isValid && usedConf) {
      const action = actions.saveFleetConfig(validConfig, usedConf)
      dispatch(action)
    }
  }
  const saveFleetConfig = async () => {
    if (isValid) {
      const action = actions.saveFleetConfig(validConfig)
      const id = await dispatch(action)
      setUsedConf(id)
    }
  }
  return {
    isValid,
    usedConf,
    ships,
    ais,
    setShips,
    setAIs,
    loadDataFromStore,
    saveFleetConfig,
    erase,
    visibleLoad,
    confs,
    closeVisible: () => {
      setVisibleLoad(false)
    },
    onLoad: (id: string) => {
      const value = confs[id]
      if (value) {
        const { ships, ais } = value
        setUsedConf(id)
        setShips(ships)
        setAIs(ais)
        setVisibleLoad(false)
      }
    },
  }
}

const LoadSaveFleet = ({
  onClose,
  confs,
  team,
  ais,
  onLoad,
}: {
  onClose: () => void
  onLoad: (id: string) => void
  confs: { [id: string]: Data }
  team: string
  ais: any
}) => {
  const [selectedConfig, setSelectedConfig] = useState('')
  const ships = !selectedConfig
    ? {}
    : confs[selectedConfig].ships.reduce((acc, val) => {
        const n = val.shipClass
        return { ...acc, [n]: (acc[n] ?? 0) + 1 }
      }, {} as { [key: string]: number })
  return (
    <Movable onClose={onClose}>
      <Column padding="xl" background="var(--ddd)" gap="l">
        <Title content="Saved configurations" />
        <Row gap="xl" align="flex-start">
          <Column
            gap="m"
            background="var(--eee)"
            padding="s"
            style={{ alignSelf: 'stretch' }}
          >
            {Object.keys(confs).map(key => (
              <Row
                key={key}
                background={
                  selectedConfig === key ? 'var(--ccc)' : 'var(--ddd)'
                }
                padding="s"
                onClick={() => setSelectedConfig(key)}
                style={{ fontSize: '1.2rem' }}
              >
                0x{key.replace(/-/g, '').slice(0, 10)}…
              </Row>
            ))}
          </Column>
          <Column>
            <Grid
              ships={confs[selectedConfig]?.ships ?? []}
              aiIDs={confs[selectedConfig]?.ais ?? []}
              ais={ais}
              team={team}
            />
          </Column>
          <Column gap="xl" width={350}>
            <div className={styles.renderShips}>
              {helpers.ships.ships.map((ship, index) => {
                const unlocked = Object.keys(ships).includes(ship)
                return (
                  <Column
                    key={index}
                    padding="m"
                    gap="m"
                    align="center"
                    background={unlocked ? 'var(--eee)' : 'var(--fff)'}
                    style={
                      unlocked
                        ? { background: 'var(--ccc)' }
                        : { filter: 'brightness(0.2)' }
                    }
                  >
                    <div>{unlocked ? `${ships[ship]} x ${ship}` : 'None'}</div>
                    <Icon shipClass={ship as any} team={team} />
                  </Column>
                )
              })}
            </div>
            <Row gap="m" justify="flex-end" align="center">
              {false && <Button warning text="Delete" onClick={() => {}} />}
              <Button
                disabled={!selectedConfig}
                primary
                text="Load"
                onClick={() => onLoad(selectedConfig)}
              />
            </Row>
          </Column>
        </Row>
      </Column>
    </Movable>
  )
}

const Credits = (props: { credits: number; maxCredits: number }) => {
  const percent = (props.credits / props.maxCredits) * 100
  const fst = Math.min(percent, 100)
  const snd = Math.max(Math.min(100, percent - 100), 0)
  return (
    <Column gap="s">
      Credits ${props.credits} / ${props.maxCredits}
      <div className={styles.creditsGauge}>
        <div className={styles.gaugeInside} style={{ width: `${fst}%` }}>
          <div className={styles.gaugeInside2} style={{ width: `${snd}%` }} />
        </div>
        <div className={styles.inscriptionGauge}>{percent.toFixed(0)} %</div>
      </div>
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
  maxCredits: number
}
export const FleetManager: FC<Props> = props => {
  const { team } = props
  const [selectedShip, setSelectedShip] = useState<string>()
  const dragVal = useRef<string | undefined>()
  const [tab, setTab] = useState<'ships' | 'ai'>('ships')
  const [quickEdition, setQuickEdition] = useState(true)
  const { ships, ais, setShips, setAIs, ...config } = useConfig(props)
  const lastPlacement = useRef({ x: 30, y: 30 })
  const onDragStart = (ship: string) => (dragVal.current = ship)
  const onDrop = ({ x, y }: { x: number; y: number }) => {
    if (dragVal.current) {
      const shipClass = dragVal.current as SHIP_CLASS
      const id = uuid()
      setShips(ships => [...ships, { id, x, y, shipClass, rotation: 0 }])
      dragVal.current = undefined
      return id
    }
  }
  const selectedAI = useMemo(() => {
    const selectedAID = ais.find(ai => ai.sid === selectedShip)?.aid
    return props.ais.find(ai => ai.id === selectedAID)
  }, [ais, selectedShip, props.ais])
  return (
    <Column gap="xl" flex={3}>
      {config.visibleLoad && (
        <LoadSaveFleet
          onClose={config.closeVisible}
          confs={config.confs}
          team={team}
          ais={props.ais}
          onLoad={config.onLoad}
        />
      )}
      <FleetTitle
        team={team}
        isValid={config.isValid}
        usedConf={config.usedConf}
        onSave={config.saveFleetConfig}
        onErase={config.erase}
        onLoad={
          Object.entries(config.confs).length > 0
            ? config.loadDataFromStore
            : undefined
        }
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
          {false && <Credits credits={50} maxCredits={props.maxCredits} />}
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
