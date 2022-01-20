import { Routes, Route } from 'react-router-dom'
import Home from '@/pages/home'
import Ships from '@/pages/ships'

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="ships" element={<Ships />} />
  </Routes>
)

export default App
