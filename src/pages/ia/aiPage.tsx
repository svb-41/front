import { useState, useEffect } from 'react'
import * as HUD from '@/components/hud'
import { useLocation } from 'react-router-dom'
import * as Monaco from '@/components/monaco'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import { createAI } from '@/store/actions/ai'

import styles from './ai.module.css'

const Mission = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const search = location.pathname.split('/')
  const id = search[search.length - 1]
  const ai = useSelector(selectors.ai(id))
  const [files, setFiles] = useState<Monaco.Files>({})

  useEffect(() => {
    if (ai === undefined) {
      dispatch(createAI(id))
    } else {
      setFiles({
        [id]: ai.file,
      })
    }
  }, [dispatch, ai])

  return (
    <>
      <HUD.HUD title="Artificial intelligence" back="/ai" />
      <HUD.Container>
        <Monaco.Monaco onChange={setFiles} files={files} />
      </HUD.Container>
    </>
  )
}

export default Mission
