import { useDispatch } from '@/store/hooks'
import { Row, Column } from '@/components/flex'
import { HUD } from '@/components/hud'
import { Title } from '@/components/title'
import { ColorPicker } from '@/components/color-picker'
import { ships } from '@/helpers/ships'
import * as Ship from '@/components/ship'
import { Color } from '@/lib/color'
import { changeColor } from '@/store/actions/user'
import { useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import styles from './ships.module.css'
import s from '@/strings.json'

const ShipsDetails = ({ color, unlockedShips }: any) => (
  <div className={styles.container}>
    {ships.map((ship, index) => {
      const isUnlocked = unlockedShips.includes(ship)
      return (
        <Row background="var(--eee)">
          <Ship.Details
            infoCard="var(--ddd)"
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
      <Column flex={1} align="flex-start" padding="xl" gap="xl">
        <Column background="var(--eee)" padding="xl" gap="xl">
          <Title content={s.pages.ships.chooseColor} />
          <ColorPicker onChange={onColorChange} selected={color} />
        </Column>
        <ShipsDetails color={color} unlockedShips={unlockedShips} />
      </Column>
    </HUD>
  )
}
