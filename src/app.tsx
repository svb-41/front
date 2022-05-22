import { useState, useEffect } from 'react'
import { initStore } from '@/store/actions/init'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@/services/auth0'
import { useDispatch, useSelector } from '@/store/hooks'
import * as selectors from '@/store/selectors'
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
import { Account } from '@/pages/account'
import { Skirmishes } from '@/pages/skirmishes'
import { AccountsConnection } from '@/pages/accounts-connection'
import * as documentation from '@/doc'
import silom from '@/assets/fonts/silom.ttf'
import unifont from '@/assets/fonts/unifont.ttf'

const App = () => {
  const connected = useSelector(selectors.connected)
  const [visible, setVisible] = useState(true)
  const dispatch = useDispatch()
  const auth = useAuth()
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
        auth.update(),
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
  if (!connected) return <AccountsConnection />
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="ai" element={<Ia />} />
      <Route path="ships" element={<Ships />} />
      <Route path="ai/:id" element={<AIEditor />} />
      <Route path="skirmishes" element={<Skirmishes />} />
      <Route path="sandbox" element={<Sandbox />} />
      <Route path="training" element={<Training />} />
      <Route path="missions" element={<Missions />} />
      <Route path="mission/:id" element={<Missions />} />
      <Route path="onboarding" element={<Onboarding />} />
      <Route path="database" element={<Database />} />
      <Route path="database/:id" element={<Database />} />
      <Route path="account" element={<Account />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
