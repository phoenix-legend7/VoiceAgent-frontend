import { useEffect, useState } from "react";
import DateTimePicker from "react-tailwindcss-datetimepicker";
import {
  Calendar,
  Clock,
  Plus,
  Play,
  Pause,
  Trash2,
  Square,
} from "lucide-react";
import { FaPhoneAlt, FaUser } from "react-icons/fa";
import { MdInsertLink } from "react-icons/md";
import { toast } from "react-toastify";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import axiosInstance, { handleAxiosError } from "../core/axiosInstance";
import Content from "../Layout/Content";
import { AgentTypeRead } from "../models/agent";
import { CampaignTypeRead } from "../models/campaign";
import { PhoneTypeRead } from "../models/phone";
import {
  CampaignScheduleFrequency,
  ScheduleByExistingCampaign,
  ScheduledCampaignCreate,
  ScheduledCampaignRead,
} from "../models/scheduledCampaign";
import { formatDateTime, formatNextRunCampaign } from "../utils/helpers";

export default function CampaignScheduling() {
  const initTimeRange = {
    start: new Date(),
    end: (() => {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      return now;
    })(),
  };
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledCampaigns, setScheduledCampaigns] = useState<
    ScheduledCampaignRead[]
  >([]);
  const [campaigns, setCampaigns] = useState<CampaignTypeRead[]>([]);
  const [agents, setAgents] = useState<AgentTypeRead[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneTypeRead[]>([]);
  const [createNew, setCreateNew] = useState(true);
  const [campaignName, setCampaignName] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState<string>();
  const [selectedPhone, setSelectedPhone] = useState<string>();
  const [frequency, setFrequency] =
    useState<CampaignScheduleFrequency>("daily");
  const [selectedRange, setSelectedRange] = useState(initTimeRange);

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        const response = await axiosInstance.get(`/phones`);
        const data = response.data;
        setPhoneNumbers(data);
      } catch (error) {
        handleAxiosError('Failed to fetch phone numbers', error);
      }
    };
    fetchPhones();
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
    const fetchSchedules = async () => {
      try {
        const response = await axiosInstance.get(`/campaign-schedule`);
        const data = response.data;
        setScheduledCampaigns(data.scheduled_campaigns);
        setCampaigns(data.not_scheduled_campaigns);
      } catch (error) {
        handleAxiosError('Failed to fetch campaign schedules', error);
      }
    };
    fetchSchedules();
  }, []);

  const resetForm = () => {
    setSelectedPhone(undefined);
    setFrequency("daily");
    setCampaignName("");
    setSelectedRange(initTimeRange);
    setSelectedCampaign(undefined);
    setCreateNew(true);
  };
  function handleTimeRangeApply(startDate: Date, endDate: Date) {
    setSelectedRange({ start: startDate, end: endDate });
  }
  const handleCreateSchedule = async () => {
    try {
      if (createNew && !campaignName) {
        toast.warning("Campaign name is required.");
        return;
      }
      if (!createNew && !selectedCampaign) {
        toast.warning("You must select a campaign.");
        return;
      }
      if (!selectedPhone) {
        toast.warning("Phone number is required.");
        return;
      }
      if (createNew) {
        const payload: ScheduledCampaignCreate = {
          caller: selectedPhone,
          campaign_name: campaignName,
          frequency: frequency,
        };
        if (frequency === "custom") {
          payload.start_time = selectedRange.start.getTime();
          payload.end_time = selectedRange.end.getTime();
        }
        setIsLoading(true);
        const response = await axiosInstance.post(`/campaign-schedule`, payload);
        setScheduledCampaigns((prev) => [...prev, response.data]);
      } else {
        const campaign = campaigns.find((c) => c.id === selectedCampaign);
        if (!campaign) return;
        const payload: ScheduleByExistingCampaign = {
          campaign_id: campaign.name,
          campaign_name: campaign.name,
          campaign_status: campaign.status,
          created_at: campaign.created_at,
          caller: selectedPhone,
          frequency: frequency,
        };
        if (frequency === "custom") {
          payload.start_time = selectedRange.start.getTime();
          payload.end_time = selectedRange.end.getTime();
        }
        setIsLoading(true);
        const response = await axiosInstance.post(`/campaign-schedule/exist`, payload);
        setScheduledCampaigns((prev) => [...prev, response.data]);
      }
      resetForm();
    } catch (e) {
      handleAxiosError('Failed to create a campaign schedule', e);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteCampaignSchedule = async (id: string) => {
    try {
      setIsLoading(true);
      await axiosInstance.delete(`/campaign-schedule/${id}`);
      setScheduledCampaigns(scheduledCampaigns.filter((s) => s.id !== id));
    } catch (e) {
      handleAxiosError('Failed to delete campaign schedule', e);
    } finally {
      setIsLoading(false);
    }
  };
  const handleStopCampaignSchedule = async (
    id: string,
    status: "paused" | "scheduled" = "paused"
  ) => {
    try {
      setIsLoading(true);
      await axiosInstance.post(`/campaign-schedule/${id}/pause`, undefined, {
        params: { status },
      });
      const cloned = structuredClone(scheduledCampaigns);
      const campaign = cloned.find((s) => s.id === id);
      if (campaign) {
        campaign.status = status;
        setScheduledCampaigns(cloned);
      }
    } catch (e) {
      handleAxiosError(`Failed to ${status} campaign schedule`, e);
    } finally {
      setIsLoading(false);
    }
  };
  const handleResumeCampaignSchedule = async (id: string) => {
    try {
      setIsLoading(true);
      await axiosInstance.post(`/campaign-schedule/${id}/resume`);
      const cloned = structuredClone(scheduledCampaigns);
      const campaign = cloned.find((s) => s.id === id);
      if (campaign) {
        campaign.status = "active";
        setScheduledCampaigns(cloned);
      }
    } catch (e) {
      handleAxiosError('Failed to resume campaign schedule', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Content className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-400 bg-clip-text text-transparent">
            Campaign Scheduling
          </h1>
          <p className="text-slate-400 mt-1">
            Automate your call campaigns with intelligent scheduling
          </p>
        </div>
        <Button className="bg-gradient-to-r from-cyan-600 via-cyan-600 to-emerald-500 hover:from-cyan-700 hover:via-cyan-700 hover:to-emerald-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Schedule New Campaign
        </Button>
      </div>

      {/* Quick Schedule Form */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Quick Schedule
          </CardTitle>
          <CardDescription className="text-slate-400">
            Set up a new scheduled campaign in minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <div>
              <Label className="text-slate-300 font-medium">
                Schedule By Existing Campaign
              </Label>
            </div>
            <Switch checked={createNew} onCheckedChange={setCreateNew} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="campaign-name" className="text-slate-300">
                Campaign Name
              </Label>
              {createNew ? (
                <Input
                  id="campaign-name"
                  placeholder="Enter campaign name"
                  className="bg-slate-800 border-slate-700 text-white"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  disabled={isLoading}
                />
              ) : (
                <Select
                  value={selectedCampaign}
                  onValueChange={setSelectedCampaign}
                  disabled={isLoading}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Select Caller</Label>
              <Select
                value={selectedPhone}
                onValueChange={setSelectedPhone}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue
                    className="bg-red-500"
                    placeholder="Choose caller"
                  />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {!phoneNumbers.length && (
                    <div className="text-gray-400 px-3 py-1">
                      Not found phone numbers.
                    </div>
                  )}
                  {phoneNumbers.map((phone, index) => {
                    const agent = agents.find(
                      (agent) => agent.id === phone.agent_id
                    );
                    return (
                      <SelectItem value={phone.id} key={index}>
                        <div className="flex items-center text-nowrap gap-2">
                          <div className="flex items-center p-1 gap-2 rounded bg-gray-700">
                            <div>
                              <FaPhoneAlt />
                            </div>
                            {phone.id}
                          </div>
                          {!!agent && (
                            <>
                              <div className="w-5">
                                <MdInsertLink />
                              </div>
                              <div className="flex items-center p-1 gap-2 rounded bg-gray-700">
                                <div>
                                  <FaUser />
                                </div>
                                {agent.name}
                              </div>
                            </>
                          )}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Frequency</Label>
              <Select
                value={frequency}
                onValueChange={(e) =>
                  setFrequency(e as CampaignScheduleFrequency)
                }
                disabled={isLoading}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekdays">Weekdays Only</SelectItem>
                  <SelectItem value="weekends">Weekends Only</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {frequency === "custom" &&
              (isLoading ? (
                <button
                  type="button"
                  className="cursor-pointer flex flex-wrap gap-x-2 rounded-md border border-input px-3 py-2 text-base ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-slate-800 border-slate-700 text-white"
                  disabled
                >
                  <div>{formatDateTime(selectedRange.start.getTime())}</div>
                  <div>~</div>
                  <div>{formatDateTime(selectedRange.end.getTime())}</div>
                </button>
              ) : (
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="start-date" className="text-slate-300">
                    Time Range
                  </Label>
                  <DateTimePicker
                    ranges={{}}
                    start={selectedRange.start}
                    end={selectedRange.end}
                    minDate={new Date()}
                    autoApply
                    applyCallback={handleTimeRangeApply}
                    classNames={{
                      rangesContainer: "w-0 overflow-hidden",
                      applyButton: "cursor-pointer transition-all duration-300",
                      cancelButton:
                        "capitalize cursor-pointer transition-all duration-300",
                      footerContainer: "hidden sm:hidden",
                    }}
                    twelveHoursClock
                  >
                    <button
                      type="button"
                      className="cursor-pointer flex flex-wrap gap-x-2 rounded-md border border-input px-3 py-2 text-base ring-offset-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-slate-800 border-slate-700 text-white"
                    >
                      <div>{formatDateTime(selectedRange.start.getTime())}</div>
                      <div>~</div>
                      <div>{formatDateTime(selectedRange.end.getTime())}</div>
                    </button>
                  </DateTimePicker>
                </div>
              ))}
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-gradient-to-r from-cyan-600 via-cyan-600 to-emerald-500 hover:from-cyan-700 hover:via-cyan-700 hover:to-emerald-600 text-white disabled:cursor-not-allowed"
              onClick={handleCreateSchedule}
              disabled={isLoading}
            >
              Create Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Campaigns Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Scheduled Campaigns
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage your automated campaign schedules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-800">
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-300">
                    Campaign Name
                  </TableHead>
                  <TableHead className="text-slate-300">Caller</TableHead>
                  <TableHead className="text-slate-300">Frequency</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Next Run</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!scheduledCampaigns.length && (
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell
                      className="text-slate-400 text-center"
                      colSpan={6}
                    >
                      There is no scheduled campaigns.
                    </TableCell>
                  </TableRow>
                )}
                {scheduledCampaigns.map((campaign) => (
                  <TableRow
                    key={campaign.id}
                    className="border-slate-800 hover:bg-slate-800/50"
                  >
                    <TableCell className="font-medium text-white">
                      {campaign.campaign_name}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {campaign.caller}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          campaign.frequency === "custom"
                            ? "border-purple-500/50 text-purple-400"
                            : "border-slate-600 text-slate-400"
                        }
                      >
                        {campaign.frequency}
                      </Badge>
                      {!!campaign.start_time && !!campaign.end_time && (
                        <div>
                          {formatDateTime(campaign.start_time)} -{" "}
                          {formatDateTime(campaign.end_time)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="capitalize">
                        <Badge
                          variant={
                            campaign.status === "active"
                              ? "default"
                              : campaign.status === "scheduled"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            campaign.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                              : campaign.status === "scheduled"
                              ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      {!!campaign.error && <div>{campaign.error}</div>}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {formatNextRunCampaign(
                        campaign.status,
                        campaign.frequency
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {campaign.status === "active" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-white"
                            disabled={isLoading}
                            onClick={() =>
                              handleStopCampaignSchedule(campaign.id)
                            }
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        )}
                        {campaign.status === "paused" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-white"
                            disabled={isLoading}
                            onClick={() =>
                              handleResumeCampaignSchedule(campaign.id)
                            }
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        )}
                        {campaign.status === "active" ||
                        campaign.status === "paused" ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-white"
                            disabled={isLoading}
                            onClick={() =>
                              handleStopCampaignSchedule(
                                campaign.id,
                                "scheduled"
                              )
                            }
                          >
                            <Square className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-white"
                            disabled={isLoading}
                            onClick={() =>
                              handleDeleteCampaignSchedule(campaign.id)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Global Settings */}
      {/* <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Global Scheduling Settings
          </CardTitle>
          <CardDescription className="text-slate-400">
            Configure default scheduling preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Default Timezone
                </Label>
                <Select defaultValue="est">
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="est">Eastern Time (EST)</SelectItem>
                    <SelectItem value="cst">Central Time (CST)</SelectItem>
                    <SelectItem value="mst">Mountain Time (MST)</SelectItem>
                    <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-300 font-medium">
                    Respect Do Not Call Hours
                  </Label>
                  <p className="text-xs text-slate-400">
                    Automatically skip calls during restricted hours
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2 block">
                  Business Hours
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="time"
                    defaultValue="09:00"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <span className="text-slate-400 self-center">to</span>
                  <Input
                    type="time"
                    defaultValue="17:00"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-300 font-medium">
                    Weekend Scheduling
                  </Label>
                  <p className="text-xs text-slate-400">
                    Allow campaigns to run on weekends
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </Content>
  );
}
