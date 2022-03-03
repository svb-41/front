import { useState, useRef, useEffect } from 'react'
import Button from '@/components/button'
import { Ship } from '@/engine/ship'
import { Mission } from './mission'
import styles from './Missions.module.css'
import { useSelector } from '@/store/hooks'
import * as selector from '@/store/selectors'
import { ships, getImage } from '@/components/ships/display'
import List from '@/components/list'

export type PlayerData = {
  ships: Array<Ship>
  AIs: Array<{ shipId: string; code: string }>
}

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
  const gridContainer = useRef(null)
  const canvas = useRef(null)
  const [gridSize, setGridSize] = useState<{ height: number; width: number }>({
    height: 200,
    width: 200,
  })

  useEffect(() => {
    //@ts-ignore
    const { offsetHeight: height, offsetWidth: width } = gridContainer.current
    setGridSize({ height, width })
    //@ts-ignore
    const context = canvas.current?.getContext('2d')
    if (context) {
      context.fillStyle = '#ff000'
      context.strokeStyle = '#ff000'
      context.fillRect(0, 0, width / 2, height)
      context.stroke()
      console.log(context)
    }
  }, [])

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
                  src={getImage(ship, teams[0])}
                  className={styles.img}
                  alt={ship}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={styles.ai}>
          <List
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
        </div>
        <div className={styles.pos} ref={gridContainer}>
          <canvas
            height={gridSize.height}
            width={gridSize.width}
            ref={canvas}
          />
        </div>
        <div className={styles.submit}>
          <Button text="Launch mission" onClick={() => {}} color={teams[0]} />
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
