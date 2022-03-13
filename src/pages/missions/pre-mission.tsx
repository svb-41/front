import { useState } from 'react'
import { Button } from '@/components/button'
import { engine } from '@svb-41/engine'
import { Mission } from '@/services/mission'
import styles from './Missions.module.css'
import { useSelector } from '@/store/hooks'
import * as selector from '@/store/selectors'
import { getImage } from '@/helpers/ships'
import { FleetManager, Data } from '@/components/fleet-manager'
import { findBuilder } from '@/missions/builders'

type Ship = engine.ship.Ship

export type PlayerData = {
  ships: Array<Ship>
  AIs: Array<{ shipId: string; code: string }>
}

export type PreMissionsProps = {
  onSubmit: (playerData: PlayerData) => void
  mission: Mission
  teams: Array<string>
}
export const PreMissions = ({ onSubmit, mission, teams }: PreMissionsProps) => {
  const playerData = useSelector(selector.userData)
  const { ais } = useSelector(selector.ais)
  const [data, setData] = useState<Data | null>(null)

  return (
    <div className={styles.preMissions}>
      <FleetManager
        team={teams[0]}
        ships={playerData.unlockedShips}
        ais={ais}
        onValidConfiguration={setData}
        width={2}
        height={5}
      />
      <div className={styles.submit}>
        <Button text="Launch mission" onClick={() => {}} />
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
