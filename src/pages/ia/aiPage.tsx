import { useState, useEffect } from 'react'
import * as HUD from '@/components/hud'
import { useLocation } from 'react-router-dom'
import * as Monaco from '@/components/monaco'
import { useSelector, useDispatch } from '@/store/hooks'
import * as selectors from '@/store/selectors'
import { createAI, updateAI } from '@/store/actions/ai'

const Mission = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const search = location.pathname.split('/')
  const id = search[search.length - 1]
  const ai = useSelector(selectors.ai(id))
  const [file, setFile] = useState<Monaco.File>()

  const saveFile = (file: Monaco.File) => {
    if (ai) dispatch(updateAI({ ...ai, file }))
    else dispatch(createAI(id))
    setFile(file)
  }

  useEffect(() => {
    if (ai) setFile(ai.file)
  }, [ai])

  return (
    <>
      <HUD.HUD title="Artificial intelligence" back="/ai" />
      <HUD.Container>
        <Monaco.Monaco onChange={saveFile} file={file} />
      </HUD.Container>
    </>
  )
}

export default Mission
