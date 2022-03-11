import { useState, useRef, useMemo } from 'react'
import Button from '@/components/button'
import { engine } from '@svb-41/engine'
import { Mission } from '@/services/mission'
import styles from './Missions.module.css'
import { useSelector } from '@/store/hooks'
import * as selector from '@/store/selectors'
import { getImage } from '@/components/ships/display'
import List from '@/components/list'
import background from '@/assets/backgrounds/darkPurple.png'
import { AI } from '@/store/reducers/ai'
import { findBuilder } from '@/missions/builders'

type Ship = engine.ship.Ship
type SHIP_CLASS = engine.ship.SHIP_CLASS

export type PlayerData = {
  ships: Array<Ship>
  AIs: Array<{ shipId: string; code: string }>
}

export type GridData = {
  ships: { [x: number]: { [y: number]: SHIP_CLASS } }
  AIs: { [x: number]: { [y: number]: string } }
}

type ShipImageProps = { ship: SHIP_CLASS; color: string; onClick: () => void }
const ShipImage = ({ ship, color, onClick }: ShipImageProps) => {
  const name = ship.toLowerCase()
  const src = getImage(name, color)
  return <img onClick={onClick} src={src} className={styles.img} alt={ship} />
}

type GridCellProps = {
  ship?: SHIP_CLASS
  color: string
  onClick: () => void
  onDragEnter: () => void
  onDragLeave: () => void
  onDrop: () => void
}
const GridCell = (props: GridCellProps) => {
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
    if (counter.current === 0) setLighted(false)
    props.onDragLeave()
  }
  const onDrop = (event: any) => {
    event.preventDefault()
    props.onDrop()
    counter.current = 0
    setLighted(false)
  }
  const background = lighted
    ? 'rgba(255,255,255,0.3)'
    : 'rgba(255, 255, 255, 0)'
  return (
    <div
      className={styles.cell}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={event => event.preventDefault()}
      onDrop={onDrop}
      style={{ background }}
    >
      <div className={styles.gridCell}>
        {ship && <ShipImage ship={ship} color={color} onClick={onClick} />}
      </div>
    </div>
  )
}

type GridProps = {
  grid: GridData
  width: number
  height: number
  cell: any
  setSelected: any
  color: string
  onDrop: () => void
}
const Grid = (props: GridProps) => {
  const { grid, width, height, cell, color, setSelected } = props
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
          <GridCell
            ship={(grid.ships[x] ?? {})[y]}
            color={color}
            key={`grid-cell-${index}`}
            onClick={() => setSelected({ x, y })}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDrop={props.onDrop}
          />
        )
      })}
    </div>
  )
}

export type PreMissionsProps = {
  onSubmit: (playerData: PlayerData) => void
  mission: Mission
  teams: Array<string>
}
export const PreMissions = ({ onSubmit, mission, teams }: PreMissionsProps) => {
  const playerData = useSelector(selector.userData)
  const ais = useSelector(selector.ais)
  const [grid, setGrid] = useState<GridData>({ ships: {}, AIs: [] })
  const [selected, setSelected] = useState<
    { x: number; y: number } | undefined
  >()
  const dragVal = useRef<string>()
  const cellOver = useRef<{ x: number; y: number }>()

  const onDragStart = (ship: string) => (dragVal.current = ship)
  const onDrop = () => {
    if (dragVal.current && cellOver.current !== undefined) {
      const shipClass = dragVal.current as SHIP_CLASS
      const { x, y } = cellOver.current!
      const atX = grid.ships[x] ?? {}
      const allShips = { ...atX, [y]: shipClass }
      const ships = { ...grid.ships, [x]: allShips }
      setGrid({ ...grid, ships })
      setSelected({ x, y })
      dragVal.current = undefined
      cellOver.current = undefined
    }
  }

  const selectAI = (ai: AI) => {
    if (selected && ai.compiledValue) {
      const atX = grid.AIs[selected.x] ?? {}
      const final = { ...atX, [selected.y]: ai.compiledValue }
      const AIs = { ...grid.AIs, [selected.x]: final }
      setGrid({ ...grid, AIs })
      setSelected(undefined)
    }
  }

  const submitMission = () => {
    const step = Math.floor(mission.size.height / 10)

    const starts = Object.entries(grid.ships).flatMap(([x_, values]) => {
      return Object.entries(values).map(([y_, value]) => {
        const x = parseInt(x_)
        const y = parseInt(y_)
        return { x, y, value: value.toUpperCase() }
      })
    })

    const ships_ = starts.flatMap(({ x, y, value }) => {
      const builder = findBuilder(value)
      const x_ = x * step
      const y_ = mission.size.height - y * step * 2
      const position = { pos: { x: x_, y: y_ }, direction: 0 }
      const team = teams[0]
      if (builder) {
        const ship = builder.builder({ position, team })
        const code = grid.AIs[x][y]
        const ai = { code, shipId: ship.id }
        return [{ ship, ai }]
      }
      return []
    })

    const ships = ships_.map(s => s.ship)
    const AIs = ships_.map(s => s.ai)
    const result: PlayerData = { ships, AIs }
    console.log(result)
    onSubmit(result)
  }

  return (
    <div className={styles.preMissions}>
      <div className={styles.ally} style={{ border: `4px solid ${teams[0]}` }}>
        <div className={styles.title}>
          Your team
          <div className={styles.subtitle}>Select ships</div>
        </div>
        <div className={styles.ships}>
          <div className={styles.shipSelector}>
            {playerData.unlockedShips.map((ship, i) => (
              <div key={i} className={styles.availableShip}>
                <img
                  draggable
                  onDragStart={() => onDragStart(ship)}
                  src={getImage(ship, teams[0])}
                  className={styles.img}
                  alt={ship}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.ai}>
          {selected ? (
            <List
              click={selectAI}
              rows={ais.filter(ai => !!ai.compiledValue)}
              cols={[
                {
                  key: 'file',
                  title: 'Name',
                  map: e => e.path,
                },
                {
                  key: 'tags',
                  title: 'Tags',
                  map: e => e.join(','),
                },
              ]}
            />
          ) : (
            'Click on a ship'
          )}
        </div>
        <Grid
          grid={grid}
          width={2}
          height={5}
          cell={cellOver}
          setSelected={setSelected}
          color={teams[0]}
          onDrop={onDrop}
        />
        <div className={styles.submit}>
          <Button
            text="Launch mission"
            onClick={submitMission}
            color={teams[0]}
          />
        </div>
      </div>
      <div className={styles.enemy} style={{ border: `4px solid ${teams[1]}` }}>
        <div className={styles.title}>
          <div>Enemy team</div>
          <div>{mission.title}</div>
        </div>
        <div className={styles.desc}>{mission.description}</div>
        <div className={styles.ships}>
          {mission.ships.map((ship, i) => (
            <div key={i}>
              <img
                src={getImage(ship.classShip.toLowerCase(), teams[1])}
                className={styles.img}
                alt={ship.classShip.toLowerCase()}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
