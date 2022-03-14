import { useDispatch } from '@/store/hooks'
import { Row } from '@/components/flex'
import { HUD } from '@/components/hud'
import { ColorPicker } from '@/components/color-picker'
import { getImage, ships } from '@/helpers/ships'
import * as Ship from '@/components/ship'
import { Color } from '@/lib/color'
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

const ShipsDetails = ({ color, unlockedShips }: any) => (
  <div className={styles.container}>
    {ships.map((ship, index) => {
      const isUnlocked = unlockedShips.includes(ship)
      return (
        <Row background="#eee">
          <Ship.Details
            infoCard="#ddd"
            key={index}
            ship={ship}
            locked={!isUnlocked}
            color={color}
          />
        </Row>
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
