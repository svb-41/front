import styles from './components.module.css'

export type Props = {
  onClick: () => void
  text: string
  primary?: boolean
  secondary?: boolean
  disabled?: boolean
}
export const Button = ({ onClick, text, ...props }: Props) => {
  const cl = props.secondary
    ? styles.secondaryButton
    : props.primary
    ? styles.primaryButton
    : styles.button
  return (
    <button disabled={props.disabled} className={cl} onClick={onClick}>
      {text}
    </button>
  )
}
