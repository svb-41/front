import * as Movable from '../movable'
import * as Flex from '../flex'

export type Fullscreen = { size: Movable.Size; position: Movable.Position }
export type App = {
  id: string
  name: string
  render: React.ReactNode
  zIndex: number
  padding?: Flex.Size
  fullscreen?: boolean | Fullscreen
}
