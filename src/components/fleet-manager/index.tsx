import { useState, useRef, useMemo, useEffect } from 'react'
import { engine } from '@svb-41/engine'
import { AI } from '@/lib/ai'
import { getImage } from '@/helpers/ships'
import { Button } from '@/components/button'
import { Title, SubTitle, Explanations } from '@/components/title'
import { Row, Column } from '@/components/flex'
import * as Ship from '@/components/ship'
import background from '@/assets/backgrounds/darkPurple.png'
import tsLogo from '@/components/monaco/ts.svg'
import * as helpers from '@/helpers/dates'
import styles from './fleet-manager.module.css'

type SHIP_CLASS = engine.ship.SHIP_CLASS
type XY = { x: number; y: number; idx: number }
type ByCoords<Data = any> = { [x: number]: { [y: number]: Data } }

export type Data = { ships: ByCoords<SHIP_CLASS>; AIs: ByCoords<string> }

type ShipImageProps = { ship: SHIP_CLASS; color: string }
const ShipImage = ({ ship, color }: ShipImageProps) => {
  const name = ship.toLowerCase()
  const src = getImage(name, color)
  return <img src={src} className={styles.img} alt={ship} />
}

type CellProps = {
  ship?: SHIP_CLASS
  color: string
  onDragEnter: () => void
  onDragLeave: () => void
  onDrop: () => void
  ais: AI[]
  ai?: string
  team: string
}
const Cell = (props: CellProps) => {
  const { ship, color } = props
  const counter = useRef(0)
  const [lighted, setLighted] = useState(false)
  const onDragEnter = (event: any) => {
    event.preventDefault()
    counter.current += 1
    setLighted(true)
    props.onDragEnter()
  }
  const onDragLeave = (event: any) => {
    event.preventDefault()
    counter.current -= 1
    if (counter.current === 0) {
      setLighted(false)
      props.onDragLeave()
    }
  }
  const onDrop = (event: any) => {
    event.preventDefault()
    props.onDrop()
    counter.current = 0
    setLighted(false)
  }
  const ai_ = props.ais.filter(i => props.ai === i.id)
  const a = ai_[0]
  return (
    <Column background={`url(${background})`}>
      <div
        className={styles.cell}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={event => event.preventDefault()}
        onDrop={onDrop}
        style={{ background: `rgba(255, 255, 255, ${lighted ? 0.3 : 0})` }}
      >
        <div className={styles.gridCell}>
          {ship && (
            <Column gap="xs">
              <ShipImage ship={ship} color={color} />
              {a && (
                <Row background={`var(--${props.team})`} padding="xs">
                  {a.file.path}
                </Row>
              )}
            </Column>
          )}
        </div>
      </div>
    </Column>
  )
}

type GridProps = {
  data: Data
  width: number
  height: number
  cell: any
  color: string
  onDrop: () => void
  ais: AI[]
  team: string
}
const Grid = (props: GridProps) => {
  const { data, width, height, cell, color } = props
  const filler = useMemo(() => {
    return new Array(width * height).fill(0).map((_, index) => {
      const x = index % width
      const y = Math.floor(index / width)
      return { x, y }
    })
  }, [width, height])
  return (
    <Column justify="center">
      <div className={styles.pos} style={{}}>
        {filler.map(({ x, y }, index) => {
          const onDragEnter = () => (cell.current = { x, y, idx: index })
          const onDragLeave = () =>
            cell.current?.x === x &&
            cell.current?.y === y &&
            (cell.current = undefined)
          return (
            <Cell
              team={props.team}
              ship={(data.ships[x] ?? {})[y]}
              color={color}
              key={`data-cell-${index}`}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDrop={props.onDrop}
              ais={props.ais}
              ai={(data.AIs[x] ?? {})[y]}
            />
          )
        })}
      </div>
    </Column>
  )
}

type ShipsProps = {
  ships: string[]
  onClick: (value: number) => void
  onDragStart: (ship: string) => void
  team: string
}
const Ships = ({ ships, onClick, onDragStart, team }: ShipsProps) => (
  <Row gap="m">
    {ships.map((ship, index) => (
      <div
        key={index}
        className={styles.availableShip}
        onClick={() => onClick(index)}
      >
        <div>{ship}</div>
        <img
          onDragStart={() => onDragStart(ship)}
          src={getImage(ship, team)}
          className={styles.img}
          alt={ship}
        />
      </div>
    ))}
  </Row>
)

type ListAiProps = {
  ais: AI[]
  onClick: (ai: AI) => void
  onDelete: () => void
  displayed: boolean
}
const ListAi = ({ ais, onClick, displayed, onDelete }: ListAiProps) => {
  const compiled = ais.filter(ai => !!ai.compiledValue)
  if (!displayed) return null
  return (
    <div className={styles.ai}>
      {compiled.map(ai => (
        <div
          key={ai.id}
          onClick={() => onClick(ai)}
          className={styles.aiButton}
        >
          <div className={styles.aiPath}>{ai.file.path}</div>
        </div>
      ))}
      <Button text="Delete" onClick={onDelete} />
    </div>
  )
}

const Tab = ({ onClick, text, className }: any) => (
  <button onClick={onClick} className={className}>
    {text}
  </button>
)

const ShipSelectorTabs = ({ state, setState }: any) => {
  const cl = (v: string) => (state === v ? styles.tab : styles.inactiveTab)
  const s = 'ships'
  return (
    <Row>
      <Tab onClick={() => setState(s)} className={cl(s)} text="Ships" />
      <Tab onClick={() => setState('ai')} className={cl('ai')} text="AI" />
    </Row>
  )
}

const RenderShips = ({ ships, setShipDetails, onDragStart, team }: any) => (
  <Column gap="m">
    <Ships
      ships={ships.slice(0, 3)}
      onClick={setShipDetails}
      onDragStart={onDragStart}
      team={team}
    />
    {ships.length >= 5 && (
      <Ships
        ships={ships.slice(3, 9)}
        onClick={(i: number) => setShipDetails(i + 3)}
        onDragStart={onDragStart}
        team={team}
      />
    )}
  </Column>
)

const ShipDetails = ({ shipDetails, ships, team }: any) => (
  <Row>
    {shipDetails !== null && (
      <Row background="var(--ddd)">
        <Ship.Details ship={ships[shipDetails]} locked={false} color={team} />
      </Row>
    )}
    {shipDetails === null && (
      <Column
        background="var(--ddd)"
        align="center"
        justify="center"
        padding="xl"
      >
        <div>Click on a ship</div>
        <div>to see its stats</div>
      </Column>
    )}
  </Row>
)

const RenderAIs = ({
  ais,
  setAIDetails,
  onAIDragStart,
}: {
  ais: AI[]
  setAIDetails: (value: string) => void
  onAIDragStart: (value: string) => void
}) => {
  const [cols, remaining] = ais.reduce(
    (acc, val, index) => {
      const [prev, act] = acc
      if (index === 0) return [prev, [...act, val]]
      if (index % 2 === 0) return [[...prev, act], [val]]
      return [prev, [...act, val]]
    },
    [[], []] as [AI[][], AI[]]
  )
  const final = [...cols, remaining]
  return (
    <Column gap="s">
      {final.map((ais, i) => (
        <Row gap="s" key={i}>
          {ais.map(ai => (
            <div
              className={styles.cursor}
              key={ai.id}
              draggable
              onDragStart={() => onAIDragStart(ai.id)}
              onClick={() => setAIDetails(ai.id)}
            >
              <Column background="var(--ccc)" padding="s" gap="s">
                <Row align="center" gap="s">
                  <img
                    src={tsLogo}
                    className={styles.logo}
                    alt="TypeScript Logo"
                  />
                  <div className={styles.pathName}>{ai.file.path}</div>
                </Row>
                <Column>
                  <div className={styles.dates}>
                    Created at {helpers.toLocale(new Date(ai.createdAt))}
                  </div>
                  <div className={styles.dates}>
                    Updated at {helpers.toLocale(new Date(ai.updatedAt))}
                  </div>
                </Column>
              </Column>
            </div>
          ))}
        </Row>
      ))}
    </Column>
  )
}

const AIDetails = ({
  aiDetails,
  ais,
  team,
}: {
  ais: AI[]
  aiDetails: string | null
  team: string
}) => {
  const ai = ais.find(ai => ai.id === aiDetails)
  if (ai)
    return (
      <Column background="var(--ddd)" padding="m" gap="m">
        <Row align="center" gap="s">
          <img src={tsLogo} className={styles.logo} alt="TypeScript Logo" />
          <div className={styles.pathName}>{ai.file.path}</div>
        </Row>
        {ai.tags.length >= 0 && (
          <Row gap="s">
            {ai.tags.map(tag => (
              <Row padding="s" background={`var(--${team})`}>
                {tag}
              </Row>
            ))}
          </Row>
        )}
        {ai.description && (
          <div style={{ maxWidth: 200, overflow: 'hidden' }}>
            {ai.description}
          </div>
        )}
        <Column align="flex-end">
          <div className={styles.dates}>
            Created at {helpers.toLocale(new Date(ai.createdAt))}
          </div>
          <div className={styles.dates}>
            Updated at {helpers.toLocale(new Date(ai.updatedAt))}
          </div>
        </Column>
      </Column>
    )
  return (
    <Column
      background="var(--ddd)"
      align="center"
      justify="center"
      padding="xl"
    >
      <div>Click on an AI</div>
      <div>to see its details</div>
    </Column>
  )
}

const ShipSelector = (props: any) => {
  const [state, setState] = useState<'ships' | 'ai'>('ships')
  const subtitle = state === 'ai' ? 'Available AI' : 'Available ships'
  return (
    <Column gap="xl">
      <Column>
        <ShipSelectorTabs state={state} setState={setState} />
        <Column background="var(--ddd)" padding="m" gap="s">
          <SubTitle content={subtitle} />
          {state === 'ships' && <RenderShips {...props} />}
          {state === 'ai' && <RenderAIs {...props} />}
        </Column>
      </Column>
      {state === 'ships' && <ShipDetails {...props} />}
      {state === 'ai' && <AIDetails {...props} />}
    </Column>
  )
}

export type Props = {
  ships: string[]
  team: string
  ais: AI[]
  onValidConfiguration: (data: Data | null) => void
  width: number
  height: number
}
export const FleetManager = (props: Props) => {
  const { team, ships, ais } = props
  const [data, setData] = useState<Data>({ ships: {}, AIs: {} })
  const dragVal = useRef<string | undefined>()
  const cell = useRef<XY>()
  const aiRef = useRef<string | undefined>()
  const onDragStart = (ship: string) => {
    aiRef.current = undefined
    dragVal.current = ship
  }
  const onAIDragStart = (ai: string) => {
    dragVal.current = undefined
    aiRef.current = ai
  }
  const onDrop = () => {
    if (dragVal.current && cell.current !== undefined) {
      const shipClass = dragVal.current as SHIP_CLASS
      const { x, y } = cell.current!
      const atX = data.ships[x] ?? {}
      const allShips = { ...atX, [y]: shipClass }
      const ships = { ...data.ships, [x]: allShips }
      setData({ ...data, ships })
      dragVal.current = undefined
      cell.current = undefined
    }
    if (aiRef.current && cell.current !== undefined) {
      const ai = ais.find(ai => ai.id === aiRef.current)
      if (ai) selectAI(cell.current.x, cell.current.y, ai)
    }
  }
  const selectAI = (x: number, y: number, ai: AI) => {
    if (ai.compiledValue) {
      const atX = data.AIs[x] ?? {}
      const vals = ai.id
      const final = { ...atX, [y]: vals }
      const AIs = { ...data.AIs, [x]: final }
      setData({ ...data, AIs })
    }
  }
  // const onDelete = () => {
  //   if (selected) {
  //     const { x, y, idx } = selected
  //     const atXShips = data.ships[x] ?? {}
  //     const atYShips = [...(atXShips[y] ?? [])]
  //     atYShips.splice(idx, 1)
  //     const ships = { ...data.ships, [x]: { ...data.ships[x], [y]: atYShips } }
  //     const atXAI = data.AIs[x] ?? {}
  //     const atYAI = [...(atXAI[y] ?? [])]
  //     atYAI.splice(idx, 1)
  //     const AIs = { ...data.ships, [x]: { ...data.ships[x], [y]: atYAI } }
  //     setData({ ...data, ships, AIs })
  //     setSelected(undefined)
  //   }
  // }
  const { onValidConfiguration } = props
  useEffect(() => {
    let atLeastOne = false
    const oneBy = (data: ByCoords<any>, comp: ByCoords<any>) => {
      return Object.entries(data).reduce((acc, [x, value]) => {
        const allTrue = Object.entries(value).reduce((acc2, [y, val]) => {
          const x_ = parseInt(x)
          const y_ = parseInt(y)
          const dat = comp[x_]?.[y_]
          const exists = dat && val
          if (exists) atLeastOne = true
          return acc2 && exists
        }, acc)
        return acc && allTrue
      }, true)
    }
    const isValid =
      oneBy(data.ships, data.AIs) && oneBy(data.AIs, data.ships) && atLeastOne
    onValidConfiguration(isValid ? data : null)
  }, [data, onValidConfiguration])
  const [shipDetails, setShipDetails] = useState<number | null>(null)
  const [aiDetails, setAIDetails] = useState<string | null>(null)
  return (
    <Column gap="xl">
      <Column background="var(--ddd)" padding="m" gap="s">
        <Row gap="l" align="center">
          <Title content="Construct your fleet" />
          <span
            className={styles.teamName}
            style={{ background: `var(--${team})` }}
          >
            {team.toUpperCase()}
          </span>
        </Row>
        <Explanations
          color="var(--888)"
          content="Select your ships, drag and drop, and give them an AI"
        />
      </Column>
      <Row gap="xl">
        <ShipSelector
          ships={ships}
          onDragStart={onDragStart}
          onAIDragStart={onAIDragStart}
          team={team}
          shipDetails={shipDetails}
          setShipDetails={setShipDetails}
          aiDetails={aiDetails}
          setAIDetails={setAIDetails}
          ais={ais}
        />
        <Grid
          team={team}
          data={data}
          width={props.width}
          height={props.height}
          cell={cell}
          color={team}
          onDrop={onDrop}
          ais={ais}
        />
      </Row>
    </Column>
  )
}
