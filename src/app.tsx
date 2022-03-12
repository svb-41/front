import { useEffect } from 'react'
import { initStore } from '@/store/actions/init'
import { Routes, Route } from 'react-router-dom'
import { useDispatch } from '@/store/hooks'
import { Ia } from '@/pages/ia'
import { Home } from '@/pages/home'
import { Ships } from '@/pages/ships'
import { Sandbox } from '@/pages/sandbox'
import { AI } from '@/pages/ia/aiPage'
import { Training } from '@/pages/training'
import { Missions } from '@/pages/missions'
import { Onboarding } from '@/pages/onboarding'
import { Mission } from '@/pages/missions/mission'

const App = () => {
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(initStore)
  }, [])
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="ai" element={<Ia />} />
      <Route path="ships" element={<Ships />} />
      <Route path="ai/:id" element={<AI />} />
      <Route path="sandbox" element={<Sandbox />} />
      <Route path="training" element={<Training />} />
      <Route path="missions" element={<Missions />} />
      <Route path="mission/:id" element={<Mission />} />
      <Route path="onboarding" element={<Onboarding />} />
    </Routes>
  )
}

export default App
