import type { CSSProperties } from 'react'
import styles from './components.module.css'

export type Props = {
  onClick: () => void
  text: string
  primary?: boolean
  secondary?: boolean
  disabled?: boolean
  style?: CSSProperties
  small?: boolean
}
export const Button = ({ onClick, text, ...props }: Props) => {
  const cl = style(props)
  return (
    <button
      disabled={props.disabled}
      className={cl}
      onClick={onClick}
      style={props.style}
    >
      {text}
    </button>
  )
}

export type Style = { secondary?: boolean; primary?: boolean; small?: boolean }
export const style = ({ secondary, primary, small = false }: Style) => {
  const state = (() => {
    if (secondary) {
      return styles.secondaryButton
    } else if (primary) {
      return styles.primaryButton
    } else {
      return styles.button
    }
  })()
  if (small) return `${state} ${styles.smallButton}`
  return state
}
