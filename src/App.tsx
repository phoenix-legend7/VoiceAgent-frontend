import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import MasterLayout from './Layout/MasterLayout'
// import Home from './pages/Home'
// import NotFound from './pages/error/404'
import Agents from './pages/Agents'
import AgentDetails from './pages/AgentDetails'
import PhoneNumbers from './pages/PhoneNumbers'
import Campaigns from './pages/Campaigns'
import CampaignDetails from './pages/CampaignDetails'
import AgentKnowledge from './pages/Knowledge'
import CallLogs from './pages/CallLogs'
import Credentials from './pages/Settings/Credentials'
import Billing from './pages/Settings/Billing'
import Transactions from './pages/Settings/Transactions'

const Settings = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/settings/credentials" />} />
      <Route path="credentials" element={<Credentials />} />
      <Route path="billing" element={<Billing />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="*" element={<Navigate to="/settings/credentials" />} />
    </Routes>
  )
}

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
          <Route path="/campaigns/:id" element={<CampaignDetails />} />
          <Route path="/knowledge" element={<AgentKnowledge />} />
          <Route path="/histories" element={<CallLogs />} />
          <Route path="/settings/*" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/agents" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
