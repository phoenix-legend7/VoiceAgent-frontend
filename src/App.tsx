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
import UrlScraper from './pages/UrlScraper'
import AutomationLibrary from './pages/AutomationLibrary'
import AccountInfo from './pages/Settings/AccountInfo'
import Billing from './pages/Settings/Billing'
import Credentials from './pages/Settings/Credentials'
import Tools from './pages/Settings/Tools'
import Transactions from './pages/Settings/Transactions'
import Calendars from './pages/Settings/Calendars'
import Dashboard from './pages/Dashboard'
import CampaignScheduling from './pages/CampaignSchedule'
import LoginScreen from './pages/Auth/Login'
import SignupScreen from './pages/Auth/Signup'
import Wizard from './pages/Wizard'
import BuildingAnimation from './pages/AgentBuilding'
import OAuthCallback from './pages/Auth/OAuthCallback'
import AdminDashboard from './pages/AdminDashboard'

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
      <Route path="credentials" element={<Credentials />} />
      <Route path="billing" element={<Billing />} />
      <Route path="tools" element={<Tools />} />
      <Route path="calendars" element={<Calendars />} />
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
              <Route path="/url-scraper" element={<UrlScraper />} />
              <Route path="/automation-library" element={<AutomationLibrary />} />
              <Route path="/histories" element={<CallLogs />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/settings/*" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </>
        ) : (
          <>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path='/login' element={<LoginScreen />} />
            <Route path='/signup' element={<SignupScreen />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
        <Route path='/oauth-callback' element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
