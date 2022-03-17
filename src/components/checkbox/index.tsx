import styles from './checkbox.module.css'

export type Props = { checked: boolean; onChange?: (value: boolean) => void }
export const Checkbox = ({ checked, onChange }: Props) => {
  return (
    <label>
      <input
        className={styles.inputCheckbox}
        type="checkbox"
        checked={checked}
        onChange={() => onChange?.(!checked)}
      />
      <div className={checked ? styles.checkedBox : styles.uncheckedBox}>
        {checked && <div className={styles.checkedMark}>x</div>}
      </div>
    </label>
  )
}
