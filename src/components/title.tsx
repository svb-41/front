import { createElement } from 'react'
import styles from './components.module.css'

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
const Level = (tag: Tag) => {
  return ({ content, blinking }: Props) => {
    const cl = blinking ? ' ' + styles.blinking : ''
    const className = `${styles[tag]}${cl}`
    return createElement(tag, { className }, content)
  }
}

export type Props = { content: string; blinking?: boolean }
export const Title = Level('h1')
export const SubTitle = Level('h2')
