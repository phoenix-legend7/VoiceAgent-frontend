import { BrowserRouter, Route, Routes } from 'react-router-dom'
import MasterLayout from './Layout/MasterLayout'
import Home from './pages/Home'
import NotFound from './pages/error/404'
import Agents from './pages/Agents'
import AgentDetails from './pages/AgentDetails'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<MasterLayout />}>
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentDetails />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
