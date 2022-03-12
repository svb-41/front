import { useState, useRef, useMemo, useEffect } from 'react'
import { engine } from '@svb-41/engine'
import { AI } from '@/store/reducers/ai'
import { getImage } from '@/helpers/ships'
import Button from '@/components/button'
import background from '@/assets/backgrounds/darkPurple.png'
import styles from './fleet-manager.module.css'

type SHIP_CLASS = engine.ship.SHIP_CLASS
type XY = { x: number; y: number; idx: number }
type ByCoords<Data = any> = { [x: number]: { [y: number]: Data } }

export type Data = { ships: ByCoords<SHIP_CLASS[]>; AIs: ByCoords<string[]> }

type ShipImageProps = { ship: SHIP_CLASS; color: string; onClick: () => void }
const ShipImage = ({ ship, color, onClick }: ShipImageProps) => {
  const name = ship.toLowerCase()
  const src = getImage(name, color)
  return <img onClick={onClick} src={src} className={styles.img} alt={ship} />
}

type CellProps = {
  ship: SHIP_CLASS[]
  color: string
  onClick: (idx: number) => void
  onDragEnter: () => void
  onDragLeave: () => void
  onDrop: () => void
}
const Cell = (props: CellProps) => {
  const { ship, onClick, color } = props
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
  return (
    <div
      className={styles.cell}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={event => event.preventDefault()}
      onDrop={onDrop}
      style={{ background: `rgba(255, 255, 255, ${lighted ? 0.3 : 0})` }}
    >
      <div className={styles.gridCell}>
        {ship.map((s, index) => (
          <ShipImage
            key={`${s}-${index}`}
            ship={s}
            color={color}
            onClick={() => onClick(index)}
          />
        ))}
      </div>
    </div>
  )
}

type GridProps = {
  data: Data
  width: number
  height: number
  cell: any
  color: string
  onDrop: () => void
  onClick: (xy: XY) => void
}
const Grid = (props: GridProps) => {
  const { data, width, height, cell, color, onClick } = props
  const style = { backgroundImage: `url(${background})` }
  const filler = useMemo(() => {
    return new Array(width * height).fill(0).map((_, index) => {
      const x = index % width
      const y = Math.round(index / width)
      return { x, y }
    })
  }, [width, height])
  return (
    <div className={styles.pos} style={style}>
      {filler.map(({ x, y }, index) => {
        const onDragEnter = () => (cell.current = { x, y })
        const onDragLeave = () =>
          cell.current?.x === x &&
          cell.current?.y === y &&
          (cell.current = undefined)
        return (
          <Cell
            ship={(data.ships[x] ?? {})[y] ?? []}
            color={color}
            key={`data-cell-${index}`}
            onClick={idx => onClick({ x, y, idx })}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={props.onDrop}
          />
        )
      })}
    </div>
  )
}

type ShipsProps = {
  ships: string[]
  onDragStart: (ship: string) => void
  team: string
}
const Ships = ({ ships, onDragStart, team }: ShipsProps) => (
  <div className={styles.ships}>
    <div className={styles.shipSelector}>
      {ships.map((ship, index) => (
        <div key={index} className={styles.availableShip}>
          <img
            onDragStart={() => onDragStart(ship)}
            src={getImage(ship, team)}
            className={styles.img}
            alt={ship}
          />
        </div>
      ))}
    </div>
  </div>
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
      <Button text="Delete" onClick={onDelete} color="red" />
    </div>
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
  const [selected, setSelected] = useState<XY | undefined>()
  const dragVal = useRef<string>()
  const cell = useRef<XY>()
  const onDragStart = (ship: string) => (dragVal.current = ship)
  const onDrop = () => {
    if (dragVal.current && cell.current !== undefined) {
      const shipClass = dragVal.current as SHIP_CLASS
      const { x, y } = cell.current!
      const atX = data.ships[x] ?? {}
      const ships_ = atX[y] ?? []
      const allShips = { ...atX, [y]: [...ships_, shipClass] }
      const ships = { ...data.ships, [x]: allShips }
      setData({ ...data, ships })
      setSelected({ x, y, idx: ships_.length })
      dragVal.current = undefined
      cell.current = undefined
    }
  }
  const selectAI = (ai: AI) => {
    if (selected && ai.compiledValue) {
      const atX = data.AIs[selected.x] ?? {}
      const vals = [...(atX[selected.y] ?? [])]
      vals[selected.idx] = ai.compiledValue
      const final = { ...atX, [selected.y]: vals }
      const AIs = { ...data.AIs, [selected.x]: final }
      setData({ ...data, AIs })
      setSelected(undefined)
    }
  }
  const onDelete = () => {
    if (selected) {
      const { x, y, idx } = selected
      const atXShips = data.ships[x] ?? {}
      const atYShips = [...(atXShips[y] ?? [])]
      atYShips.splice(idx, 1)
      const ships = { ...data.ships, [x]: { ...data.ships[x], [y]: atYShips } }
      const atXAI = data.AIs[x] ?? {}
      const atYAI = [...(atXAI[y] ?? [])]
      atYAI.splice(idx, 1)
      const AIs = { ...data.ships, [x]: { ...data.ships[x], [y]: atYAI } }
      setData({ ...data, ships, AIs })
      setSelected(undefined)
    }
  }
  useEffect(() => {
    let atLeastOne = false
    const oneBy = (data: ByCoords<any[]>, comp: ByCoords<any[]>) => {
      return Object.entries(data).reduce((acc, [x, value]) => {
        const allTrue = Object.entries(value).reduce((acc2, [y, vals]) => {
          const x_ = parseInt(x)
          const y_ = parseInt(y)
          const dat = comp[x_]?.[y_] ?? []
          const exists = vals.reduce((a, _val, idx) => a && dat[idx], true)
          if (exists) atLeastOne = true
          return acc2 && exists
        }, acc)
        return acc && allTrue
      }, true)
    }
    const isValid =
      oneBy(data.ships, data.AIs) && oneBy(data.AIs, data.ships) && atLeastOne
    props.onValidConfiguration(isValid ? data : null)
  }, [data])
  return (
    <div className={styles.ally} style={{ border: `4px solid ${team}` }}>
      <div className={styles.title}>
        Your team
        <div className={styles.subtitle}>Select ships</div>
      </div>
      <Ships ships={ships} onDragStart={onDragStart} team={team} />
      <ListAi
        ais={ais}
        onClick={selectAI}
        displayed={!!selected}
        onDelete={onDelete}
      />
      <Grid
        data={data}
        width={props.width}
        height={props.height}
        cell={cell}
        onClick={setSelected}
        color={team}
        onDrop={onDrop}
      />
    </div>
  )
}
