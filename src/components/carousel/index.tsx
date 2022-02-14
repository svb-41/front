import { useState, useEffect } from 'react'
import Button from '@/components/button'
import styles from './carousel.module.css'

const ARROW_LEFT = 'ArrowLeft'
const ARROW_RIGHT = 'ArrowRight'
const ARROW_UP = 'ArrowUp'
const ARROW_DOWN = 'ArrowDown'

type Props = {
  element: Array<{ link: string; img: string; value: string }>
}
const Carousel = ({ element }: Props) => {
  const [selected, setSelected] = useState<number>(0)

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.code === ARROW_LEFT)
        setSelected(selected => (selected > 0 ? selected - 1 : selected))

      if (event.code === ARROW_RIGHT)
        setSelected(selected =>
          selected < element.length - 1 ? selected + 1 : selected
        )

      if (event.code === ARROW_UP) setSelected(element.length - 1)
      if (event.code === ARROW_DOWN) setSelected(0)
    }
    window.addEventListener('keydown', keydown)
    return () => {
      window.removeEventListener('keydown', keydown)
    }
  }, [])

  return (
    <div className={styles.missions}>
      <div className={styles.container}>
        <div className={styles.previous}>
          {element.slice(0, selected).map((e, i) => (
            <div key={i} className={styles.galleryCell}>
              <img src={e.img} onClick={() => setSelected(i)} />
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
              <img src={e.img} onClick={() => setSelected(i + selected + 1)} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.info}>
        Mission number {selected + 1}
        <Button text="Start mission" onClick={() => {}} color="darkgreen" />
      </div>
    </div>
  )
}

export default Carousel
