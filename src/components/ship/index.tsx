import * as svb from '@svb-41/engine'
import { Column, Row } from '@/components/flex'
import { getImage } from '@/helpers/ships'
import styles from './ship.module.css'

type LabeledProps = {
  label: string
  content: string | number
  className?: string
  style?: any
  angle?: boolean
}
export const Labeled = ({
  label,
  content,
  className,
  style,
  angle,
}: LabeledProps) => {
  const val =
    typeof content === 'number' && angle
      ? (content / Math.PI).toFixed(2) + ' x pi'
      : content
  return content !== 0 ? (
    <div style={style}>
      <div className={styles.label}>{label}</div>
      <div className={className}>{val ?? 'None'}</div>
    </div>
  ) : (
    <></>
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
      <Column gap="s" className={styles.infos}>
        <Labeled label="ID" content={stats.id} className={styles.id} />
        <Row gap="m" flex={1}>
          <Column gap="s">
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
              <Labeled label="Turn" content={stats.stats.turn} angle />
              <Labeled label="Detection" content={stats.stats.detection} />
              <Labeled label="Visibility" content={stats.stealth} />
            </div>
          </Column>
          <div className={styles.weapons}>
            {stats.weapons.map((weapon: any, index: number) => (
              <Column gap="s" key={index}>
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
                  <Labeled
                    label="Turn"
                    content={weapon.bullet.stats.turn}
                    angle
                  />
                  <Labeled
                    label="Detection"
                    content={weapon.bullet.stats.detection}
                  />
                  <Labeled label="Range" content={weapon.bullet.range} />
                  <Labeled label="Cool Down" content={weapon.bullet.coolDown} />
                  <Labeled label="Munitions" content={weapon.amo} />
                </div>
              </Column>
            ))}
          </div>
          {!locked && (
            <Column gap="s">
              Price
              <div className={styles.infoCard} style={{ background: infoCard }}>
                <Labeled label="Credit" content={stats.price} />
              </div>
            </Column>
          )}
        </Row>
      </Column>
      <img
        src={getImage(ship, color)}
        className={styles.img}
        style={{ filter: locked ? 'brightness(0.2)' : undefined }}
        alt="ship"
      />
    </div>
  )
}

export type IconProps = { shipClass: svb.engine.ship.SHIP_CLASS; team: string }
export const Icon = ({ shipClass, team }: IconProps) => {
  const src = getImage(shipClass.toLowerCase(), team)
  const alt = `${shipClass}-${team}`
  const cl = styles.summaryShipImage
  return <img src={src} className={cl} alt={alt} />
}
