import type { CSSProperties } from 'react'
import styles from './components.module.css'

export type Props = {
  onClick: () => void
  text: string
  primary?: boolean
  secondary?: boolean
  warning?: boolean
  disabled?: boolean
  style?: CSSProperties
  small?: boolean
  tiny?: boolean
  stopPropagation?: boolean
  preventDefault?: boolean
}
export const Button = ({ onClick, text, ...props }: Props) => {
  const cl = style(props)
  return (
    <button
      disabled={props.disabled}
      className={cl}
      onClick={event => {
        if (props.stopPropagation) event.stopPropagation()
        if (props.preventDefault) event.preventDefault()
        if (onClick) onClick()
      }}
      style={props.style}
    >
      {text}
    </button>
  )
}

export type Style = {
  warning?: boolean
  secondary?: boolean
  primary?: boolean
  small?: boolean
  tiny?: boolean
}
export const style = ({
  warning,
  secondary,
  primary,
  small = false,
  tiny = false,
}: Style) => {
  const state = (() => {
    if (warning) {
      return styles.warningButton
    } else if (secondary) {
      return styles.secondaryButton
    } else if (primary) {
      return styles.primaryButton
    } else {
      return styles.button
    }
  })()
  if (small) return `${state} ${styles.smallButton}`
  if (tiny) return `${state} ${styles.tinyButton}`
  return state
}
