import { useState, useRef, useEffect } from 'react'
import Button from '@/components/button'
import { Ship, SHIP_CLASS } from '@/engine/ship'
import { Mission } from './mission'
import styles from './Missions.module.css'
import { useSelector } from '@/store/hooks'
import * as selector from '@/store/selectors'
import { ships, getImage } from '@/components/ships/display'
import List from '@/components/list'
import { Color } from '@/store/reducers/user'
import background from '@/assets/backgrounds/darkPurple.png'
import { AI } from '@/store/reducers/ai'

export type PlayerData = {
  ships: Array<Ship>
  AIs: Array<{ shipId: string; code: string }>
}

export type GridData = {
  ships: Array<Array<SHIP_CLASS>>
  AIs: Array<Array<string>>
}

const GridCell = ({
  ships,
  color,
  onClick,
}: {
  ships: Array<SHIP_CLASS>
  color: string
  onClick: (i: number) => void
}) => (
  <div className={styles.gridCell}>
    {ships.map((ship, i) => (
      <img
        onClick={() => onClick(i)}
        key={i + 'ship'}
        src={getImage(ship.toLowerCase(), color)}
        className={styles.img}
        alt={ship}
      />
    ))}
  </div>
)

const PreMissions = ({
  onSubmit,
  mission,
  teams,
}: {
  onSubmit: (playerData: PlayerData) => void
  mission: Mission
  teams: Array<string>
}) => {
  const playerData = useSelector(selector.userData)
  const ais = useSelector(selector.ais)
  const [grid, setGrid] = useState<GridData>({
    ships: new Array(10).fill(1).map(() => []),
    AIs: new Array(10).fill(1).map(() => []),
  })
  const [selectedGridShip, setSelectedGridShip] =
    useState<{ cell: number; ship: number }>()
  const dragVal = useRef<string>()
  const cellOver = useRef<number>()

  const onDragStart = (ship: string) => () => {
    dragVal.current = ship
  }

  const onDragEnd = (e: any) => {
    if (dragVal.current && cellOver.current !== undefined) {
      const shipClass = dragVal.current as SHIP_CLASS
      const i = cellOver.current as number
      grid.ships[i] = [...grid.ships[i], shipClass]
      setGrid({ ...grid })
      dragVal.current = undefined
      cellOver.current = undefined
    }
  }

  const leaveCell = (i: number) => (e: any) => {
    setTimeout(() => {
      if (cellOver.current === i) cellOver.current = undefined
    }, 1000)
  }
  const overCell = (i: number) => () => {
    cellOver.current = i
  }

  const clickSelectedShip = (cell: number) => (ship: number) => {
    setSelectedGridShip({ cell, ship })
  }
  const selectAI = (ai: AI) => {
    if (selectedGridShip && ai.compiledValue) {
      grid.AIs[selectedGridShip.cell][selectedGridShip.ship] = ai.compiledValue
      setGrid({ ...grid })
      setSelectedGridShip(undefined)
    }
  }

  const submitMission = () => {
    // onSubmit()
  }

  return (
    <div className={styles.preMissions}>
      <div className={styles.ally} style={{ border: `4px solid ${teams[0]}` }}>
        <div className={styles.title}>Your team</div>
        <div className={styles.ships}>
          <div className={styles.subtitle}>Select ships</div>
          <div className={styles.shipSelector}>
            {playerData.unlockedShips.map((ship, i) => (
              <div key={i} className={styles.availableShip}>
                <img
                  onDragStart={onDragStart(ship)}
                  onDragEnd={onDragEnd}
                  src={getImage(ship, teams[0])}
                  className={styles.img}
                  alt={ship}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.ai}>
          {selectedGridShip ? (
            <List
              click={selectAI}
              rows={ais}
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
        <div
          className={styles.pos}
          style={{ backgroundImage: `url(${background})` }}
        >
          {grid.ships.map((cell, i) => (
            <div
              className={styles.cell}
              key={i}
              onDragOver={overCell(i)}
              onDragLeave={leaveCell(i)}
            >
              <GridCell
                ships={cell}
                color={teams[0]}
                key={i + 'gridcell'}
                onClick={clickSelectedShip(i)}
              />
            </div>
          ))}
        </div>
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

export default PreMissions
