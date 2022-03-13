import { useDispatch } from '@/store/hooks'
import { HUD } from '@/components/hud'
import { ColorPicker } from '@/components/color-picker'
import { getImage, ships } from '@/helpers/ships'
import { Color } from '@/store/reducers/user'
import { changeColor } from '@/store/actions/user'
import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import styles from './ships.module.css'
import * as svb from '@svb-41/engine'

type LabeledProps = {
  label: string
  content: string | number
  className?: string
}
const Labeled = ({ label, content, className }: LabeledProps) => {
  const val = typeof content === 'number' ? content.toFixed(2) : content
  return (
    <div>
      <div className={styles.label}>{label}</div>
      <div className={className}>{val ?? 'None'}</div>
    </div>
  )
}

const ShipDetails = ({ ship, stats, locked, color }: any) => (
  <div key={ship} className={styles.cell}>
    <div className={styles.infos}>
      <Labeled label="ID" content={stats.id} className={styles.id} />
      <div style={{ display: 'flex', gap: 12 }}>
        <div className={styles.infoCardWrapper}>
          Infos
          <div className={styles.infoCard}>
            <Labeled
              label="Class"
              content={stats.shipClass}
              className={styles.class}
            />
            <Labeled label="Size" content={stats.stats.size} />
            <Labeled label="Acceleration" content={stats.stats.acceleration} />
            <Labeled label="Turn" content={stats.stats.turn} />
            <Labeled label="Detection" content={stats.stats.detection} />
            <Labeled label="Stealth" content={stats.stealth} />
          </div>
        </div>
        <div className={styles.weapons}>
          {stats.weapons.map((weapon: any, index: number) => (
            <div key={index} className={styles.infoCardWrapper}>
              Weapon #{index}
              <div className={styles.infoCard}>
                <Labeled label="ID" content={weapon.bullet.id} />
                <Labeled label="Speed" content={weapon.bullet.position.speed} />
                <Labeled label="Size" content={weapon.bullet.stats.size} />
                <Labeled
                  label="Acceleration"
                  content={weapon.bullet.stats.acceleration}
                />
                <Labeled label="Turn" content={weapon.bullet.stats.turn} />
                <Labeled
                  label="Detection"
                  content={weapon.bullet.stats.detection}
                />
                <Labeled label="Range" content={weapon.bullet.range} />
                <Labeled label="Cool Down" content={weapon.bullet.coolDown} />
                <Labeled label="Munitions" content={weapon.amo} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <img
      src={getImage(ship, color)}
      className={styles.img}
      style={{ filter: locked ? 'brightness(0.2)' : undefined }}
      alt="ship"
    />
  </div>
)

const empty = {}
const emptyStats = new Proxy(empty, {
  get(_, p) {
    if (p === 'weapons') return []
    if (p === 'stats') return new Proxy(empty, { get: () => '???' })
    return '???'
  },
})

const ShipsDetails = ({ color, unlockedShips }: any) => (
  <div className={styles.container}>
    {ships.map((ship, index) => {
      const shipName = ship.toUpperCase()
      const stats_: any = (svb.engine.config.ship as any)[shipName]
      const isUnlocked = unlockedShips.includes(ship)
      const stats = isUnlocked ? stats_ : emptyStats
      return (
        <ShipDetails
          key={index}
          ship={ship}
          stats={stats}
          locked={!isUnlocked}
          color={color}
        />
      )
    })}
  </div>
)

export const Ships = () => {
  const dispatch = useDispatch()
  const { color, unlockedShips } = useSelector(selectors.userData)
  const onColorChange = (color: Color) => dispatch(changeColor(color))
  return (
    <HUD>
      <div className={styles.wrapper}>
        <div className={styles.colorPicker}>
          <div>Choose your team color</div>
          <ColorPicker onChange={onColorChange} selected={color} />
        </div>
        <ShipsDetails color={color} unlockedShips={unlockedShips} />
      </div>
    </HUD>
  )
}
