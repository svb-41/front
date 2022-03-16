import React from 'react'
import styles from './components.module.css'

export type Props = {
  onClick: () => void
  text: string
  primary?: boolean
  secondary?: boolean
  disabled?: boolean
  style?: React.CSSProperties
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

export const style = ({
  secondary,
  primary,
}: {
  secondary?: boolean
  primary?: boolean
}) => {
  return secondary
    ? styles.secondaryButton
    : primary
    ? styles.primaryButton
    : styles.button
}
