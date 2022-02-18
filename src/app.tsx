import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/home'
import Ia from '@/pages/ia'
import Ships from '@/pages/ships'
import Missions from '@/pages/missions'
import Onboarding from '@/pages/onboarding'
import Mission from '@/pages/missions/mission'

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="ai" element={<Ia />} />
    <Route path="ships" element={<Ships />} />
    <Route path="missions" element={<Missions />} />
    <Route path="mission/:id" element={<Mission />} />
    <Route path="onboarding" element={<Onboarding />} />
  </Routes>
)

export default App
