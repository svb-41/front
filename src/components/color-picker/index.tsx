import { Color } from '@/lib/color'
import styles from './colorPicker.module.css'

export type Props = { onChange: (color: Color) => void; selected?: Color }
export const ColorPicker = ({ onChange, selected }: Props) => (
  <div className={styles.colorPicker}>
    {Object.values(Color).map((color: Color) => {
      const onClick = () => onChange(color)
      const activeCl = selected === color ? ' ' + styles.active : ''
      const className = styles['tile-' + color] + activeCl
      return <div key={color} onClick={onClick} className={className} />
    })}
  </div>
)
