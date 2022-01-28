import { Color } from '@/store/reducers/user'
import styles from './colorPicker.module.css'

const ColorPicker = ({ onChange }: { onChange: (color: Color) => void }) => (
  <div className={styles.colorPicker}>
    {Object.values(Color).map((color: Color) => (
      <div
        key={color}
        onClick={() => onChange(color)}
        className={styles['tile-' + color]}
      />
    ))}
  </div>
)

export default ColorPicker
