import { ChangeEvent, FormEvent } from 'react'
import styles from './input.module.css'

const input = (props: {
  value?: string
  onChange: (v: string) => void
  onSubmit: () => void
}) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.value)
  }
  const onSubmit = (v: FormEvent<HTMLFormElement>) => {
    v.preventDefault()
    props.onSubmit()
  }
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <input
        {...{ value: props.value ?? '', onChange }}
        type="text"
        className={styles.input}
      />
    </form>
  )
}

export default input
