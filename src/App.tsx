import { useCallback, useState } from 'react'
import { BrowserRouter, Route, Routes, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './core/authProvider'
import MasterLayout from './Layout/MasterLayout'
// import Home from './pages/Home'
import NotFound from './pages/error/404'
import Agents from './pages/Agents'
import AgentDetails from './pages/AgentDetails'
import PhoneNumbers from './pages/PhoneNumbers'
import Campaigns from './pages/Campaigns'
import CampaignDetails from './pages/CampaignDetails'
import AgentKnowledge from './pages/Knowledge'
import CallLogs from './pages/CallLogs'
import AccountInfo from './pages/Settings/AccountInfo'
import Billing from './pages/Settings/Billing'
import Transactions from './pages/Settings/Transactions'
import Dashboard from './pages/Dashboard'
import CampaignScheduling from './pages/CampaignSchedule'
import LoginScreen from './pages/Login'
import Wizard from './pages/Wizard'
import BuildingAnimation from './pages/AgentBuilding'
import OAuthCallback from './pages/OAuthCallback'

const WizardRoute = () => {
  const [agentData, setAgentData] = useState<any>();

  const navigate = useNavigate();

  const handleWizardComplete = useCallback((data: any) => {
    setAgentData(data);
  }, []);
  const handleBuildingComplete = useCallback(() => {
    navigate('/');
  }, [navigate]);

  return agentData ? (
    <BuildingAnimation
      agentData={agentData}
      setAgentData={setAgentData}
      onComplete={handleBuildingComplete} />
  ) : (
    <Wizard onComplete={handleWizardComplete} />
  );
};

const Settings = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/settings/account" />} />
      <Route path="account" element={<AccountInfo />} />
      <Route path="billing" element={<Billing />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="*" element={<Navigate to="/settings/account" />} />
    </Routes>
  )
}

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {currentUser ? (
          <>
            <Route path='/wizard' element={<WizardRoute />} />
            <Route element={<MasterLayout />}>
              <Route path='/login' element={<Navigate to="/" />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/agents/:id" element={<AgentDetails />} />
              <Route path="/phones" element={<PhoneNumbers />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaign-schedule" element={<CampaignScheduling />} />
              <Route path="/campaigns/:id" element={<CampaignDetails />} />
              <Route path="/knowledge" element={<AgentKnowledge />} />
              <Route path="/histories" element={<CallLogs />} />
              <Route path="/settings/*" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </>
        ) : (
          <>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path='/login' element={<LoginScreen />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
        <Route path='/oauth-callback' element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
