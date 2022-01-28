import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/home'
import Ia from '@/pages/ia'
import Ships from '@/pages/ships'
import Missions from '@/pages/missions'
import Onboarding from '@/pages/onboarding'

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="ia" element={<Ia />} />
    <Route path="ships" element={<Ships />} />
    <Route path="missions" element={<Missions />} />
    <Route path="onboarding" element={<Onboarding />} />
  </Routes>
)

export default App
