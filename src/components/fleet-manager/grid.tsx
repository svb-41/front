import { useState, useRef, useEffect } from 'react'
import { getImage } from '@/helpers/ships'
import { Title } from '@/components/title'
import { Row, Column } from '@/components/flex'
import styles from './fleet-manager.module.css'
import background from '@/assets/backgrounds/black.png'
import { AllShips, AllAIs, SHIP_CLASS } from './type'
import { Checkbox } from '@/components/checkbox'
import { AI } from '@/lib/ai'

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
  onClick: () => void,
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
    onClick()
  }
  return { position, onMouseDown }
}

type GuidesProps = {
  displayGuides: boolean
  visible: boolean
  position: { top: number; left: number }
}
const Guides = ({ displayGuides, visible, position }: GuidesProps) => {
  const clNum = visible ? styles.visibleNumGuide : styles.numGuide
  const clLine = visible ? styles.visibleLineGuide : styles.lineGuide
  const { top, left } = position
  return (
    <>
      {top <= 300 && (displayGuides || visible) && (
        <div
          className={clLine}
          style={{ width: 0, height: top - 4, left: left + 15 }}
        />
      )}
      {left <= 150 && (displayGuides || visible) && (
        <div
          className={clLine}
          style={{ height: 0, width: left - 6, top: top + 16 }}
        />
      )}
      {top > 300 && (displayGuides || visible) && (
        <div
          className={clLine}
          style={{
            width: 0,
            height: 600 - top - 40,
            right: 300 - (left + 21),
            bottom: 0,
          }}
        />
      )}
      {left > 150 && (displayGuides || visible) && (
        <div
          className={clLine}
          style={{
            height: 0,
            width: 300 - (left + 42),
            bottom: 600 - (top + 22),
            right: 0,
          }}
        />
      )}
      {top <= 300 && (displayGuides || visible) && (
        <div className={clNum} style={{ left: left + 8, top: -24 }}>
          {left}
        </div>
      )}
      {left <= 150 && (displayGuides || visible) && (
        <div className={clNum} style={{ top: top + 10, left: -32 }}>
          {top}
        </div>
      )}
      {top > 300 && (displayGuides || visible) && (
        <div className={clNum} style={{ left: left + 8, bottom: -24 }}>
          {left}
        </div>
      )}
      {left > 150 && (displayGuides || visible) && (
        <div className={clNum} style={{ top: top + 10, right: -32 }}>
          {top}
        </div>
      )}
    </>
  )
}

type MovableShipProps = {
  selected: boolean
  ship: SHIP_CLASS
  ai?: AI
  team: string
  x: number
  y: number
  rotation: number
  onClick: () => void
  onUpdate: (x: number, y: number) => void
  displayGuides: boolean
}
const MovableShip = (props: MovableShipProps) => {
  const [visible, setVisible] = useState(false)
  const pos = usePosition(props.y, props.x, props.onClick, props.onUpdate)
  const st = {
    position: 'absolute',
    zIndex: visible ? 1000000 : 10000,
    transform: `rotate(${props.rotation}deg)`,
    ...pos.position,
  } as any
  return (
    <>
      <Guides
        displayGuides={props.displayGuides}
        visible={visible || props.selected}
        position={pos.position}
      />
      <div
        onMouseDown={pos.onMouseDown}
        style={st}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        <ShipImage
          draggable={false}
          ship={props.ship}
          color={props.team}
          small
        />
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: 14,
            padding: '0 var(--xs)',
            color: 'var(--white)',
            background: props.ai ? 'var(--ts-blue)' : 'var(--ddd)',
            textOverflow: 'clip',
            overflow: 'hidden',
            maxWidth: 40,
            whiteSpace: 'pre-wrap',
            fontSize: '.8rem',
          }}
        >
          {props.ai?.file?.path ?? '?'}
        </div>
      </div>
    </>
  )
}

export type GridProps = {
  ships: AllShips
  ais: AllAIs
  width: number
  height: number
  onDrop: ({ x, y }: { x: number; y: number }) => string | undefined
  selectedShip?: string
  setSelectedShip: (id: string | undefined) => void
  // ais: AI[]
  team: string
  onUpdate: (id: string, x: number, y: number) => void
}
export const Grid = (props: GridProps) => {
  const { ships, team, onUpdate } = props
  const [displayGuides, setDisplayGuides] = useState(true)
  return (
    <Column gap="xl">
      <Column background="var(--eee)" padding="xl" gap="m">
        <Column>
          <Title content="Options" />
          <p style={{ color: 'var(--888)' }}>Set options for the grid below</p>
        </Column>
        <Row align="center" gap="s">
          <Checkbox
            checked={displayGuides}
            onChange={() => setDisplayGuides(s => !s)}
          />
          <div>Display guides</div>
        </Row>
      </Column>
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
            const id = props.onDrop({ x, y })
            props.setSelectedShip(id)
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
              ai={props.ais.find(ai => ai.id === ship.id)?.ai}
              selected={props.selectedShip === ship.id}
              displayGuides={displayGuides}
              key={ship.id}
              x={ship.x}
              y={ship.y}
              rotation={ship.rotation}
              ship={ship.shipClass}
              team={team}
              onClick={() => props.setSelectedShip(ship.id)}
              onUpdate={(x, y) => onUpdate(ship.id, x, y)}
            />
          ))}
        </div>
      </Column>
    </Column>
  )
}
