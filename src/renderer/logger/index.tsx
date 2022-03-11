import { useState } from 'react'
import styles from './logger.module.css'

export type Props = { logs: string[] }

const RenderLogs: any = ({ logs }: Props) => {
  return logs.map((log, index) => (
    <div key={index} className={styles.overlayLine}>
      {log}
    </div>
  ))
}

const EmptyLine = () => {
  return <div className={styles.overlayLine}>Nothing to display…</div>
}

export const Render = ({ logs }: Props) => {
  const [visible, setVisible] = useState(false)
  const text = visible ? 'Hide Logs' : 'Show Logs'
  return (
    <div className={styles.wrapper}>
      <button className={styles.toggler} onClick={() => setVisible(!visible)}>
        {text}
      </button>
      {visible && (
        <div className={styles.overlay}>
          {logs.length > 0 && <RenderLogs logs={logs} />}
          {logs.length === 0 && <EmptyLine />}
        </div>
      )}
    </div>
  )
}
