import { createElement } from 'react'
import styles from './components.module.css'

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
const Level = (tag: Tag, size?: number) => {
  return ({ content, blinking, color }: Props) => {
    const cl = blinking ? ' ' + styles.blinking : ''
    const className = `${styles[tag]}${cl}`
    const style = { color, fontSize: size ? `${size}rem` : undefined }
    return createElement(tag, { className, style }, content)
  }
}

export type Props = { content: string; blinking?: boolean; color?: string }
export const Title = Level('h1')
export const SubTitle = Level('h2')
export const Explanations = Level('h3')
export const Jumbotron = Level('h1', 5)
