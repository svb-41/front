import { useState, useEffect } from 'react'
import styles from './carousel.module.css'

const ARROW_LEFT = 'ArrowLeft'
const ARROW_RIGHT = 'ArrowRight'
const ARROW_UP = 'ArrowUp'
const ARROW_DOWN = 'ArrowDown'

type Props = {
  element: Array<{ link: string; img: string; value: string }>
  onChange?: (i: number) => void
}
const Carousel = ({ element, onChange }: Props) => {
  const [selected, setSelected] = useState<number>(0)
  const move = (i: number | ((a: number) => number)) => {
    if (typeof i == 'number') {
      if (onChange) onChange(i)
      setSelected(i)
    } else if (onChange) {
      setSelected(s => {
        const n = i(s)
        onChange(n)
        return n
      })
    }
  }

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.code === ARROW_LEFT)
        move(selected => (selected > 0 ? selected - 1 : selected))

      if (event.code === ARROW_RIGHT)
        move(selected =>
          selected < element.length - 1 ? selected + 1 : selected
        )

      if (event.code === ARROW_UP) move(element.length - 1)
      if (event.code === ARROW_DOWN) move(0)
    }
    window.addEventListener('keydown', keydown)
    return () => {
      window.removeEventListener('keydown', keydown)
    }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.previous}>
        {element.slice(0, selected).map((e, i) => (
          <div key={i} className={styles.galleryCell}>
            <img src={e.img} onClick={() => move(i)} />
          </div>
        ))}
      </div>
      <div className={styles.center}>
        <div className={styles.galleryCellActive}>
          <img src={element[selected].img} />
        </div>
      </div>
      <div className={styles.next}>
        {element.slice(selected + 1).map((e, i) => (
          <div key={i} className={styles.galleryCell}>
            <img src={e.img} onClick={() => move(i + selected + 1)} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Carousel
