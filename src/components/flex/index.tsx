import { FC } from 'react'
import styles from './flex.module.css'

export type Size = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'
export type Align =
  | 'flex-start'
  | 'baseline'
  | 'stretch'
  | 'center'
  | 'flex-end'

type Classes = { [key: string]: string | boolean | number | undefined }
const classesNames = (values: Classes) => {
  return Object.entries(values)
    .flatMap(([key, value]) => {
      if (value) {
        if (typeof value === 'boolean') return [styles[key]]
        return [styles[`${key}-${value}`]]
      }
      return []
    })
    .join(' ')
}

export type Props = {
  gap?: Size
  padding?: Size
  background?: string
  align?: Align
  justify?: Align
}

export const Row: FC<Props> = props => {
  const { gap, padding, background, align, justify, children } = props
  const cl = classesNames({ row: true, gap, padding, align, justify })
  const st = { background }
  return (
    <div className={cl} style={st}>
      {children}
    </div>
  )
}

export const Column: FC<Props> = props => {
  const { gap, padding, background, align, justify, children } = props
  const cl = classesNames({ col: true, gap, padding, align, justify })
  const st = { background }
  return (
    <div className={cl} style={st}>
      {children}
    </div>
  )
}
