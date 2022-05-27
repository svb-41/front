import * as Movable from '../movable'
import * as Flex from '../flex'
import { Dimensions } from '@/lib/window'

export type Fullscreen = { size: Dimensions; position: Movable.Position }
export type App = {
  id: string
  name: string
  render: React.ReactNode
  zIndex: number
  padding?: Flex.Size
  fullscreen?: boolean | Fullscreen
  initialSize?: { size?: Dimensions; position?: Movable.Position }
}
