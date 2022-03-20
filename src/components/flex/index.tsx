import { FC, CSSProperties, createElement } from 'react'
import styles from './flex.module.css'

export type Size = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'
export type Wrap = 'wrap' | 'no-wrap' | 'wrap-reverse'
export type Align =
  | 'flex-start'
  | 'baseline'
  | 'stretch'
  | 'center'
  | 'flex-end'

const flatten = ([key, value]: [string, Value]) => {
  if (typeof value === 'boolean' && value) return [styles[key]]
  if (value) return [styles[`${key}-${value}`]]
  return []
}

type Value = string | boolean | number | undefined
type Classes = { [key: string]: Value }
const classesNames = (values: Classes) => {
  const entries = Object.entries(values)
  const classes = entries.flatMap(flatten)
  return classes.join(' ')
}

export type Props = {
  gap?: Size
  padding?: Size
  background?: string
  align?: Align
  justify?: Align | 'space-between' | 'space-around' | 'space-evenly'
  width?: number | string
  flex?: number
  wrap?: Wrap
  maxWidth?: number
  minWidth?: number
  tag?: string
  className?: string
  color?: string
  onClick?: () => void
  style?: CSSProperties
  height?: number
}

const Flex = (r: { row: boolean; col: boolean }): FC<Props> => {
  return props => {
    const { children, tag = 'div', onClick } = props
    const { gap, padding = 'none', align, justify, wrap } = props
    const { background, width, flex, maxWidth, color, height, minWidth } = props
    const cursor = onClick ? 'pointer' : undefined
    const cl = classesNames({
      ...r,
      gap,
      padding,
      align,
      justify,
      wrap,
      cursor,
    })
    const className = props.className ? `${cl} ${props.className}` : cl
    const style = {
      ...props.style,
      background,
      width,
      flex,
      maxWidth,
      color,
      height,
      minWidth,
    }
    return createElement(tag, { className, style, onClick }, children)
  }
}

export const Row = Flex({ row: true, col: false })
export const Column = Flex({ row: false, col: true })
