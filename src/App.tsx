import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import MasterLayout from './Layout/MasterLayout'
// import Home from './pages/Home'
import NotFound from './pages/error/404'
import Agents from './pages/Agents'
import AgentDetails from './pages/AgentDetails'
import PhoneNumbers from './pages/PhoneNumbers'
import Campaigns from './pages/Campaigns'
import AgentKnowledge from './pages/Knowledge'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<Navigate to="/agents" />} />
        <Route element={<MasterLayout />}>
          <Route path="/agents" element={<Agents />} />
          <Route path="/agents/:id" element={<AgentDetails />} />
          <Route path="/phones" element={<PhoneNumbers />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/knowledge" element={<AgentKnowledge />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
