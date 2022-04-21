import { createElement } from 'react'
import styles from './components.module.css'

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p'
const Level = (tag: Tag, name: string, size?: number) => {
  const fun = ({ content, blinking, color }: Props) => {
    const cl = blinking ? ' ' + styles.blinking : ''
    const className = `${styles[tag]}${cl}`
    const style = { color, fontSize: size ? `${size}rem` : undefined }
    return createElement(tag, { className, style }, content)
  }
  fun.displayName = name
  return fun
}

export type Props = { content: string; blinking?: boolean; color?: string }
export const Title = Level('h1', 'Title')
export const SubTitle = Level('h2', 'SubTitle')
export const Explanations = Level('h3', 'Explanations')
export const Jumbotron = Level('h1', 'Jumbotron', 5)
export const Caption = Level('p', 'Caption')
