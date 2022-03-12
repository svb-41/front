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
      <div className={className}>{val}</div>
    </div>
  )
}

const ShipDetails = ({ ship, stats, locked, color }: any) => (
  <div key={ship} className={styles.cell}>
    <div className={styles.infos}>
      <Labeled label="ID" content={stats.id} className={styles.id} />
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
      {stats.weapons.map((weapon: any) => {
        const vals: any = Object.entries(weapon)
        // return <div>{JSON.stringify(vals)}</div>
        return null
      })}
    </div>
    <img
      src={getImage(ship, color)}
      className={styles.img}
      style={{ filter: locked ? 'brightness(0.2)' : undefined }}
      alt="ship"
    />
  </div>
)

const ShipsDetails = ({ color, unlockedShips }: any) => (
  <div className={styles.container}>
    {ships.map(ship => {
      const shipName = ship.toUpperCase()
      const stats: any = (svb.engine.config.ship as any)[shipName]
      const isUnlocked = unlockedShips.includes(ship)
      return (
        <ShipDetails
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
