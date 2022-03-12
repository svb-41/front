import { useDispatch } from '@/store/hooks'
import DisplayShips from '@/components/ships/display'
import { HUD } from '@/components/hud'
import ColorPicker from '@/components/color-picker'
import { Color } from '@/store/reducers/user'
import { changeColor } from '@/store/actions/user'

export const Ships = () => {
  const dispatch = useDispatch()
  const onColorChange = (color: Color) => {
    dispatch(changeColor(color))
  }
  return (
    <HUD>
      <ColorPicker onChange={onColorChange} />
      <DisplayShips />
    </HUD>
  )
}
