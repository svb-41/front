import styles from './input.module.css'

export type Props<Value> = {
  disabled?: boolean
  value: Value
  onChange: (value: Value) => void
  size?: number
  style: any
}

export type TextProps = Props<string>
export const Text = (props: TextProps) => (
  <input
    style={props.style}
    type="text"
    className={styles.input}
    size={props.size}
    disabled={props.disabled}
    value={props.value}
    onChange={event => props.onChange(event.target.value)}
  />
)

export type IntegerProps = Props<number> & {
  radix?: number
  max?: number
  min?: number
}
export const Integer = (props: IntegerProps) => (
  <input
    style={props.style}
    type="number"
    className={styles.input}
    size={props.size}
    disabled={props.disabled}
    value={props.value}
    max={props.max}
    min={props.min}
    onChange={event => {
      const x = parseInt(event.target.value, props.radix ?? 10)
      if (!isNaN(x)) props.onChange(x)
    }}
  />
)
