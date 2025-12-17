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
import VerifyEmailScreen from './pages/Auth/VerifyEmail'
import PaymentSetupScreen from './pages/Auth/PaymentSetup'
import ForgotPasswordScreen from './pages/Auth/ForgotPassword'
import ResetPasswordScreen from './pages/Auth/ResetPassword'
import CreateAgentWizard from './pages/CreateAgentWizard'
import OnboardingWizard from './pages/OnboardingWizard'
import BuildingAnimation from './pages/AgentBuilding'
import OAuthCallback from './pages/Auth/OAuthCallback'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

const CreateAgentWizardRoute = () => {
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
    <CreateAgentWizard onComplete={handleWizardComplete} />
  );
};

const OnboardingWizardRoute = () => {
  const handleOnboardingComplete = useCallback(() => {
    // Mark onboarding as complete
    localStorage.setItem('onboarding-complete', 'true');
  }, []);

  return <OnboardingWizard onComplete={handleOnboardingComplete} />;
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
            <Route path='/onboarding' element={<OnboardingWizardRoute />} />
            <Route path='/wizard' element={<CreateAgentWizardRoute />} />
            <Route element={<MasterLayout />}>
              <Route path='/login' element={<Navigate to="/" />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
              <Route path="/agents/:id" element={<ProtectedRoute><AgentDetails /></ProtectedRoute>} />
              <Route path="/phones" element={<ProtectedRoute><PhoneNumbers /></ProtectedRoute>} />
              <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
              <Route path="/campaign-schedule" element={<ProtectedRoute><CampaignScheduling /></ProtectedRoute>} />
              <Route path="/campaigns/:id" element={<ProtectedRoute><CampaignDetails /></ProtectedRoute>} />
              <Route path="/knowledge" element={<ProtectedRoute><AgentKnowledge /></ProtectedRoute>} />
              <Route path="/url-scraper" element={<ProtectedRoute><UrlScraper /></ProtectedRoute>} />
              <Route path="/automation-library" element={<ProtectedRoute><AutomationLibrary /></ProtectedRoute>} />
              <Route path="/histories" element={<ProtectedRoute><CallLogs /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/settings/*" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </>
        ) : (
          <>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path='/login' element={<LoginScreen />} />
            <Route path='/signup' element={<SignupScreen />} />
            <Route path='/forgot-password' element={<ForgotPasswordScreen />} />
            <Route path='/reset-password' element={<ResetPasswordScreen />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
        <Route path='/verify-email' element={<VerifyEmailScreen />} />
        <Route path='/setup-payment' element={<PaymentSetupScreen />} />
        <Route path='/oauth-callback' element={<OAuthCallback />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
