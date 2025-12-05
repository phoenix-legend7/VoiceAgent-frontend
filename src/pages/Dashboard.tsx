import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Bot,
  TrendingUp,
  DollarSign,
  Calendar,
  Zap,
  Activity,
  Users,
  Clock,
  PhoneCall,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { AnimatedCounter } from "../components/Animate/Counter";
import { AnimatedCurrency } from "../components/Animate/Currency";
import { AnimatedPercentage } from "../components/Animate/Percentage";
import axiosInstance, { handleAxiosError } from "../core/axiosInstance";
import { AgentTypeRead } from "../models/agent";
import Content from "../Layout/Content";

interface DashboardDataType {
  total_calls: number;
  total_minutes: number;
  total_cost: number;
  success_rate: number;
  dispositions: {
    qualified: number;
    answering: number;
    no_answer: number;
    busy: number;
  };
  performances: Array<{
    agent_name: string;
    total_call: number;
    total_minutes: number;
    total_cost: number;
    cost_per_minute: number;
    success_call: number;
  }>;
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [agents, setAgents] = useState<AgentTypeRead[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [dashboardData, setDashboardData] = useState<DashboardDataType | null>(
    null
  );

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboarding-complete');
    if (!onboardingComplete && !location.pathname.includes('/onboarding') && !location.pathname.includes('/wizard')) {
      navigate('/onboarding');
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get("/agent");
        const data = response.data;
        setAgents(data);
      } catch (error) {
        handleAxiosError('Failed to fetch agents', error);
      }
    };
    fetchAgents();
    setMounted(true);
  }, []);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const params = {
          agent_id: selectedAgent !== "all" ? selectedAgent : undefined,
          time_period: selectedPeriod,
        };
        const response = await axiosInstance.get("/dashboard", { params });
        const data = response.data;
        setDashboardData(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDashboardData();
    const timerId = setInterval(() => {
      fetchDashboardData();
    }, 10000);
    return () => {
      if (timerId !== undefined) {
        clearInterval(timerId);
      }
    };
  }, [selectedAgent, selectedPeriod]);

  if (!mounted) return null;

  return (
    <Content className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back to your AI call platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-cyan-500/50 text-cyan-600 dark:text-cyan-400 animate-pulse"
          >
            <div className="w-2 h-2 bg-cyan-600 dark:bg-cyan-400 rounded-full mr-2" />
            All Systems Operational
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-700 dark:text-slate-300">Filter by Agent</label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents.map((agent, index) => (
                    <SelectItem value={agent.id} key={index}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-700 dark:text-slate-300">Time Period</label>
              <Select
                defaultValue="today"
                onValueChange={(e) => setSelectedPeriod(e)}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-black dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600">
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Calls"
          icon={PhoneCall}
          value={<AnimatedCounter value={dashboardData?.total_calls || 0} />}
        />
        <StatCard
          title="Total Minutes"
          icon={Clock}
          value={<AnimatedCounter value={dashboardData?.total_minutes || 0} />}
          description="Talk time across all calls"
        />
        <StatCard
          title="Total Cost"
          icon={DollarSign}
          value={
            <AnimatedCurrency value={(dashboardData?.total_cost || 0) / 100} />
          }
          description="Campaign costs today"
        />
        <StatCard
          title="Success Rate"
          icon={TrendingUp}
          value={<AnimatedPercentage value={dashboardData?.success_rate || 0} />}
        />
      </div>

      {/* Call Dispositions */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Call Dispositions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-cyan-500/80 dark:border-cyan-500/20">
              <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                <AnimatedCounter
                  value={dashboardData?.dispositions.qualified || 0}
                />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Qualified Leads</div>
              <div className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                {(
                  ((dashboardData?.dispositions.qualified || 0) /
                    (dashboardData?.total_calls || 1)) *
                  100
                ).toFixed(1)}
                % of calls
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-yellow-500/80 dark:border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                <AnimatedCounter
                  value={dashboardData?.dispositions.answering || 0}
                />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Answering Machine</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {(
                  ((dashboardData?.dispositions.answering || 0) /
                    (dashboardData?.total_calls || 1)) *
                  100
                ).toFixed(1)}
                % of calls
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-red-500/80 dark:border-red-500/20">
              <div className="text-2xl font-bold text-red-400 mb-1">
                <AnimatedCounter
                  value={dashboardData?.dispositions.no_answer || 0}
                />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">No Answer</div>
              <div className="text-xs text-red-400 dark:text-red-600 mt-1">
                {(
                  ((dashboardData?.dispositions.answering || 0) /
                    (dashboardData?.total_calls || 1)) *
                  100
                ).toFixed(1)}
                % of calls
              </div>
            </div>

            <div className="text-center p-4 rounded-lg bg-slate-100/50 dark:bg-slate-800/50 border border-orange-500/80 dark:border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                <AnimatedCounter
                  value={dashboardData?.dispositions.busy || 0}
                />
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Busy Signal</div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                {(
                  ((dashboardData?.dispositions.answering || 0) /
                    (dashboardData?.total_calls || 1)) *
                  100
                ).toFixed(1)}
                % of calls
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Performance & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            {!dashboardData?.performances.length ? (
              <div className="text-center mt-5">There is no performances.</div>
            ) : (
              dashboardData.performances.map((performance, index) => (
                <div className="space-y-3" key={index}>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-black dark:text-white font-medium">
                        {performance.agent_name}
                      </span>
                      <div className="text-xs text-slate-400">
                        {performance.success_call}/{performance.total_call}{" "}
                        calls • ${(performance.total_cost / 100).toFixed(2)} cost •{" "}
                        {performance.total_minutes} minutes
                      </div>
                    </div>
                    <span className="text-cyan-400 font-mono">
                      {(
                        (performance.success_call /
                          (performance.total_call || 1)) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      (performance.success_call /
                        (performance.total_call || 1)) *
                      100
                    }
                    className="h-2"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6">
            <Button
              className="w-full bg-gradient-to-r from-cyan-600 via-cyan-600 to-emerald-500 hover:from-cyan-700 hover:via-cyan-700 hover:to-emerald-600 text-white"
              onClick={() => navigate("/agents")}
            >
              <Bot className="w-4 h-4 mr-2" />
              Create New Agent
            </Button>
            <Button
              variant="outline"
              className="w-full border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
              onClick={() => navigate("/campaign-schedule")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Campaign
            </Button>
            {/* <Button
              variant="outline"
              className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Set Billing Rates
            </Button>
            <Button
              variant="outline"
              className="w-full border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Zap className="w-4 h-4 mr-2" />
              Open Toolbox
            </Button> */}
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Cost Breakdown by Agent
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {!dashboardData?.performances.length ? (
              <div className="text-center md:col-span-3">
                There is no breakdowns.
              </div>
            ) : (
              dashboardData.performances.map((performance, index) => (
                <div
                  className="text-center p-4 rounded-lg dark:bg-slate-800/50"
                  key={index}
                >
                  <div className="text-xl font-bold text-white mb-1">
                    ${(performance.total_cost / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-slate-400 mb-1">
                    {performance.agent_name}
                  </div>
                  <div className="text-xs text-cyan-400">
                    ${(performance.cost_per_minute / 100).toFixed(2)}/min •{" "}
                    {performance.total_minutes} minutes
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </Content>
  );
}

function StatCard({
  title,
  icon: Icon,
  value,
  description,
}: {
  title: string;
  icon: any;
  value: React.ReactNode;
  description?: string;
}) {
  return (
    <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all duration-300 group">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-400 flex items-center justify-between">
          {title}
          <Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </div>
        {description && (
          <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}