import { useState, useRef, useEffect, useMemo } from 'react'
import { engine } from '@svb-41/engine'
import { AI } from '@/lib/ai'
import { getImage } from '@/helpers/ships'
import { Button } from '@/components/button'
import * as selectors from '@/store/selectors'
import { useSelector, useDispatch } from '@/store/hooks'
import * as actions from '@/store/actions/user'
import { SubTitle } from '@/components/title'
import { Row, Column } from '@/components/flex'
import { ShipSelector } from './tabs'
import styles from './fleet-manager.module.css'
import background from '@/assets/backgrounds/black.png'
import { AllShips, SHIP_CLASS } from './type'
import { Checkbox } from '@/components/checkbox'

type ShipImageProps = {
  ship: SHIP_CLASS
  color: string
  small?: boolean
  draggable?: boolean
}
const ShipImage = ({ ship, color, small, draggable }: ShipImageProps) => {
  const name = ship.toLowerCase()
  const src = getImage(name, color)
  const cl = small ? styles.smallImg : styles.hugeImg
  return <img src={src} className={cl} alt={ship} draggable={draggable} />
}

const usePosition = (
  top: number,
  left: number,
  onUpdate: (x: number, y: number) => void
) => {
  const [position, setPosition] = useState({ top, left })
  useEffect(() => {
    setPosition({ top, left })
  }, [top, left])
  const popupRef = useRef<any>(null)
  const handlerRef = useRef<any>(null)
  const mouseupHandlerRef = useRef<any>(null)
  const mouseMove = (event: MouseEvent) => {
    if (popupRef.current) {
      const x_ = event.clientX - popupRef.current.x
      const y_ = event.clientY - popupRef.current.y
      const left_ = x_ + popupRef.current.initialPosition.left
      const top_ = y_ + popupRef.current.initialPosition.top
      const left = Math.min(300 - 32 - 8, Math.max(4, left_))
      const top = Math.min(600 - 32 - 8, Math.max(4, top_))
      setPosition({ top, left })
      onUpdate(left, top)
    }
  }
  const mouseUp = () => {
    popupRef.current = null
    if (handlerRef.current) {
      document.removeEventListener('mousemove', handlerRef.current)
      handlerRef.current = null
    }
    if (mouseupHandlerRef.current) {
      document.removeEventListener('mouseup', mouseupHandlerRef.current)
      mouseupHandlerRef.current = null
    }
  }
  const onMouseDown = (event: any) => {
    popupRef.current = {
      x: event.clientX,
      y: event.clientY,
      initialPosition: position,
    }
    handlerRef.current = mouseMove
    mouseupHandlerRef.current = mouseUp
    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('mouseup', mouseupHandlerRef.current)
  }
  return { position, onMouseDown }
}

const MovableShip = ({
  ship,
  team,
  x,
  y,
  onUpdate,
  displayGuides,
}: {
  ship: SHIP_CLASS
  team: string
  x: number
  y: number
  onUpdate: (x: number, y: number) => void
  displayGuides: boolean
}) => {
  const [visible, setVisible] = useState(false)
  const pos = usePosition(y, x, onUpdate)
  const st = {
    position: 'absolute',
    zIndex: visible ? 1000000 : 10000,
    ...pos.position,
  } as any
  const clr = visible ? 'var(--888)' : 'var(--ddd)'
  return (
    <>
      {(displayGuides || visible) && (
        <div
          style={{
            width: 0,
            height: pos.position.top - 4,
            border: `1px dashed ${clr}`,
            position: 'absolute',
            left: pos.position.left + 15,
            zIndex: visible ? 100000 : undefined,
          }}
        />
      )}
      {(displayGuides || visible) && (
        <div
          style={{
            position: 'absolute',
            top: -24,
            left: pos.position.left + 8,
            color: clr,
            zIndex: visible ? 100000 : undefined,
          }}
        >
          {pos.position.left}
        </div>
      )}
      {(displayGuides || visible) && (
        <div
          style={{
            width: pos.position.left - 6,
            height: 0,
            border: `1px dashed ${clr}`,
            position: 'absolute',
            top: pos.position.top + 16,
            zIndex: visible ? 100000 : undefined,
          }}
        />
      )}
      {(displayGuides || visible) && (
        <div
          style={{
            position: 'absolute',
            top: pos.position.top + 10,
            left: -28,
            color: clr,
            zIndex: visible ? 100000 : undefined,
          }}
        >
          {pos.position.top}
        </div>
      )}
      <div
        onMouseDown={pos.onMouseDown}
        style={st}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        <ShipImage draggable={false} ship={ship} color={team} small />
      </div>
    </>
  )
}

export type GridProps = {
  ships: AllShips
  width: number
  height: number
  onDrop: ({ x, y }: { x: number; y: number }) => void
  // ais: AI[]
  team: string
  onUpdate: (id: string, x: number, y: number) => void
}
export const Grid = (props: GridProps) => {
  const { ships, width, height, team, onUpdate } = props
  const filler = useMemo(() => {
    return new Array(width * height).fill(0).map((_, index) => {
      const x = index % width
      const y = Math.floor(index / width)
      return { x, y }
    })
  }, [width, height])
  const [displayGuides, setDisplayGuides] = useState(true)
  return (
    <Column
      background="var(--eee)"
      justify="center"
      padding="xxl"
      style={{ alignSelf: 'flex-start' }}
    >
      <div
        onDragOver={event => event.preventDefault()}
        onDragEnter={event => event.preventDefault()}
        onDragLeave={event => event.preventDefault()}
        onDrop={event => {
          event.preventDefault()
          const { target, clientX, clientY } = event
          const rect = (target as HTMLDivElement).getBoundingClientRect()
          const x = Math.round(clientX - rect.x - 16)
          const y = Math.round(clientY - rect.y - 16)
          props.onDrop({ x, y })
        }}
        style={{
          position: 'relative',
          width: 300,
          height: 600,
          border: '2px solid var(--ddd)',
          background: `url(${background})`,
        }}
      >
        {ships.map(ship => (
          <MovableShip
            displayGuides={displayGuides}
            key={ship.id}
            x={ship.x}
            y={ship.y}
            ship={ship.shipClass}
            team={team}
            onUpdate={(x, y) => onUpdate(ship.id, x, y)}
          />
        ))}
      </div>
      <Row align="center" gap="s" justify="flex-end" width={300} padding="s">
        <Checkbox
          checked={displayGuides}
          onChange={() => setDisplayGuides(s => !s)}
        />
        <div>Display guides</div>
      </Row>
    </Column>
  )
}
