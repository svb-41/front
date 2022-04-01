import { useState, useEffect } from 'react'
import { initStore } from '@/store/actions/init'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from '@/store/hooks'
import { Ia } from '@/pages/ai'
import { Home } from '@/pages/home'
import { Ships } from '@/pages/ships'
import { Sandbox } from '@/pages/sandbox'
import { AIEditor } from '@/pages/ai/editor'
import { Training } from '@/pages/training'
import { Missions } from '@/pages/missions'
import { Onboarding } from '@/pages/onboarding'
import { NotFound } from '@/pages/not-found'
import { Overlay } from '@/pages/overlay'
import { Database } from '@/pages/database'
import * as documentation from '@/doc'
import silom from '@/assets/fonts/silom.ttf'
import unifont from '@/assets/fonts/unifont.ttf'

const App = () => {
  const [visible, setVisible] = useState(true)
  const dispatch = useDispatch()
  useEffect(() => {
    const run = async () => {
      const time = Date.now()
      await dispatch(initStore)
      document.fonts.add(new FontFace('Silom', `url(${silom})`))
      document.fonts.add(new FontFace('Unifont', `url(${unifont})`))
      const results = Promise.all([
        document.fonts.load('1rem Silom'),
        document.fonts.load('1rem Unifont'),
        document.fonts.ready,
      ])
      await documentation.load()
      if (process.env.NODE_ENV === 'development') setVisible(false)
      if (process.env.NODE_ENV !== 'development') {
        await results
        const delta = Date.now() - time
        const temp = 5000 - delta
        const timeout = temp < 0 ? 0 : temp
        setTimeout(() => {
          setVisible(false)
        }, timeout)
      }
    }
    run()
  }, [dispatch])
  if (visible) return <Overlay />
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="ai" element={<Ia />} />
      <Route path="ships" element={<Ships />} />
      <Route path="ai/:id" element={<AIEditor />} />
      <Route path="sandbox" element={<Sandbox />} />
      <Route path="training" element={<Training />} />
      <Route path="missions" element={<Missions />} />
      <Route path="mission/:id" element={<Missions />} />
      <Route path="onboarding" element={<Onboarding />} />
      <Route path="database" element={<Database />} />
      <Route path="database/:id" element={<Database />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
