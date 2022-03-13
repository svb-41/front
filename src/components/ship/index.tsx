import * as svb from '@svb-41/engine'
import { getImage } from '@/helpers/ships'
import styles from './ship.module.css'

type LabeledProps = {
  label: string
  content: string | number
  className?: string
}
const Labeled = ({ label, content, className }: LabeledProps) => {
  const val = typeof content === 'number' ? content.toFixed(2) : content
  return (
    <div>
      <div className={styles.label}>{label}</div>
      <div className={className}>{val ?? 'None'}</div>
    </div>
  )
}

const empty = {}
const emptyStats = new Proxy(empty, {
  get(_, p) {
    if (p === 'weapons') return []
    if (p === 'stats') return new Proxy(empty, { get: () => '???' })
    return '???'
  },
})

export type DetailsProps = {
  ship: string
  locked: boolean
  color: string
  infoCard?: string
}
export const Details = ({ ship, locked, color, infoCard }: DetailsProps) => {
  const shipName = ship.toUpperCase()
  const stats_: any = (svb.engine.config.ship as any)[shipName]
  const stats = !locked ? stats_ : emptyStats
  return (
    <div key={ship} className={styles.cell}>
      <div className={styles.infos}>
        <Labeled label="ID" content={stats.id} className={styles.id} />
        <div style={{ display: 'flex', gap: 12 }}>
          <div className={styles.infoCardWrapper}>
            Infos
            <div className={styles.infoCard} style={{ background: infoCard }}>
              <Labeled
                label="Class"
                content={stats.shipClass}
                className={styles.class}
              />
              <Labeled label="Size" content={stats.stats.size} />
              <Labeled
                label="Acceleration"
                content={stats.stats.acceleration}
              />
              <Labeled label="Turn" content={stats.stats.turn} />
              <Labeled label="Detection" content={stats.stats.detection} />
              <Labeled label="Stealth" content={stats.stealth} />
            </div>
          </div>
          <div className={styles.weapons}>
            {stats.weapons.map((weapon: any, index: number) => (
              <div key={index} className={styles.infoCardWrapper}>
                Weapon #{index}
                <div
                  className={styles.infoCard}
                  style={{ background: infoCard }}
                >
                  <Labeled label="ID" content={weapon.bullet.id} />
                  <Labeled
                    label="Speed"
                    content={weapon.bullet.position.speed}
                  />
                  <Labeled label="Size" content={weapon.bullet.stats.size} />
                  <Labeled
                    label="Acceleration"
                    content={weapon.bullet.stats.acceleration}
                  />
                  <Labeled label="Turn" content={weapon.bullet.stats.turn} />
                  <Labeled
                    label="Detection"
                    content={weapon.bullet.stats.detection}
                  />
                  <Labeled label="Range" content={weapon.bullet.range} />
                  <Labeled label="Cool Down" content={weapon.bullet.coolDown} />
                  <Labeled label="Munitions" content={weapon.amo} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <img
        src={getImage(ship, color)}
        className={styles.img}
        style={{ filter: locked ? 'brightness(0.2)' : undefined }}
        alt="ship"
      />
    </div>
  )
}
