import { useEffect } from 'react'
import { Engine } from '@/engine'
import styles from './Missions.module.css'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selector from '@/store/selectors'
import { useNavigate } from 'react-router-dom'
import { getImage } from '@/components/ships/display'
import Button from '@/components/button'
import { unlockRewards } from '@/store/actions/user'
import { Mission } from '@/services/mission'

const PostMission = ({
  engine,
  restart,
  mission,
}: {
  engine: Engine
  restart: () => void
  mission: Mission
}) => {
  const playerData = useSelector(selector.userData)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const state = engine.state

  const playerWin = () =>
    state.ships
      .filter(s => s.team === playerData.color)
      .map(s => !s.destroyed)
      .reduce((acc, val) => acc || val, false)

  useEffect(() => {
    if (mission.rewards && playerWin()) {
      dispatch(unlockRewards(mission.rewards))
    }
  }, [mission])
  return (
    <div className={styles.postMission}>
      <div className={styles.result}>{playerWin() ? 'Victory' : 'Defeat'}</div>
      <div className={styles.time}>{state.timeElapsed / 1000} seconds</div>
      <div className={styles.shipsDestroyed}>
        <div className={styles.subtitle}>Ships destroyed</div>
        <div className={styles.ships}>
          <div className={styles.shipSelector}>
            {state.ships
              .filter(s => s.destroyed)
              .map((ship, i) => (
                <div key={i} className={styles.availableShip}>
                  <img
                    src={getImage(ship.shipClass.toLowerCase(), ship.team)}
                    className={styles.img}
                    alt={`${ship.shipClass}-${ship.team}`}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className={styles.shipsDestroyed}>
        <div className={styles.subtitle}>Surviving ships</div>
        <div className={styles.ships}>
          <div className={styles.shipSelector}>
            {state.ships
              .filter(s => !s.destroyed)
              .map((ship, i) => (
                <div key={i} className={styles.availableShip}>
                  <img
                    src={getImage(ship.shipClass.toLowerCase(), ship.team)}
                    className={styles.img}
                    alt={`${ship.shipClass}-${ship.team}`}
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Button text="Restart mission" onClick={restart} color="orange" />
        <Button text="Watch replay" onClick={() => {}} />
        <Button
          text="Go back to missions"
          onClick={() => {
            navigate('/missions')
          }}
          color="purple"
        />
      </div>
    </div>
  )
}

export default PostMission
