import { FC } from 'react'
import styles from './flex.module.css'

export type Size = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'
export type Wrap = 'wrap' | 'no-wrap' | 'wrap-reverse'
export type Align =
  | 'flex-start'
  | 'baseline'
  | 'stretch'
  | 'center'
  | 'flex-end'

type Value = string | boolean | number | undefined
type Classes = { [key: string]: Value }

const flatten = ([key, value]: [string, Value]) => {
  if (typeof value === 'boolean') return [styles[key]]
  if (value) return [styles[`${key}-${value}`]]
  return []
}

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
}

export const Row: FC<Props> = props => {
  const {
    gap,
    padding,
    background,
    align,
    justify,
    children,
    width,
    flex,
    wrap,
    maxWidth,
  } = props
  const cl = classesNames({
    row: true,
    gap,
    padding,
    align,
    justify,
    wrap,
  })
  const st = { background, width, flex, maxWidth }
  return (
    <div className={cl} style={st}>
      {children}
    </div>
  )
}

export const Column: FC<Props> = props => {
  const {
    gap,
    padding,
    background,
    align,
    justify,
    children,
    width,
    flex,
    wrap,
    maxWidth,
  } = props
  const cl = classesNames({
    col: true,
    gap,
    padding,
    align,
    justify,
    wrap,
  })
  const st = { background, width, flex, maxWidth }
  return (
    <div className={cl} style={st}>
      {children}
    </div>
  )
}
