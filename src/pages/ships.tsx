import { useDispatch } from '@/store/hooks'
import DisplayShips from '@/components/ships/display'
import * as HUD from '@/components/hud'
import ColorPicker from '@/components/color-picker'
import { Color } from '@/store/reducers/user'
import { changeColor } from '@/store/actions/user'

const Ships = () => {
  const dispatch = useDispatch()
  const onColorChange = (color: Color) => {
    dispatch(changeColor(color))
  }
  return (
    <>
      <HUD.HUD title="your ships" back="/" />
      <HUD.Container>
        <ColorPicker onChange={onColorChange} />
        <DisplayShips />
      </HUD.Container>
    </>
  )
}

export default Ships
