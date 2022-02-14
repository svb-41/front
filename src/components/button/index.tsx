import styles from './button.module.css'

const Button = ({
  text,
  color,
  onClick,
}: {
  text: string
  color?: string
  onClick: () => void
}) => (
  <div
    className={styles.button}
    style={{ background: color ?? 'darkblue' }}
    onClick={onClick}
  >
    {text}
  </div>
)

export default Button
