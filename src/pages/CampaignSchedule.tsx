import { Calendar, Clock, Plus, Play, Pause, Settings, AlertCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Badge } from "../components/ui/badge"
import { Switch } from "../components/ui/switch"

const scheduledCampaigns = [
  {
    id: "1",
    name: "Morning Solar Leads",
    agent: "Jess - Solar Battery Lead Generator",
    schedule: "Daily at 9:00 AM",
    timezone: "EST",
    status: "active",
    nextRun: "Tomorrow at 9:00 AM",
    startDate: "2025-01-15",
    endDate: "2025-03-15",
    frequency: "daily",
  },
  {
    id: "2",
    name: "B2B Afternoon Outreach",
    agent: "Ely - B2B Agent",
    schedule: "Mon-Fri at 2:00 PM",
    timezone: "PST",
    status: "paused",
    nextRun: "Paused",
    startDate: "2025-01-10",
    endDate: "2025-02-28",
    frequency: "weekdays",
  },
  {
    id: "3",
    name: "Weekend Follow-ups",
    agent: "Ely - Conversational AI Specialist",
    schedule: "Sat-Sun at 10:00 AM",
    timezone: "EST",
    status: "scheduled",
    nextRun: "Saturday at 10:00 AM",
    startDate: "2025-01-20",
    endDate: "2025-04-20",
    frequency: "weekends",
  },
  {
    id: "4",
    name: "Special Product Launch",
    agent: "Ely - B2B Agent",
    schedule: "One-time on Jan 25, 2025 at 10:00 AM",
    timezone: "EST",
    status: "scheduled",
    nextRun: "Jan 25, 2025 at 10:00 AM",
    startDate: "2025-01-25",
    endDate: "2025-01-25",
    frequency: "one-off",
  },
]

export default function CampaignScheduling() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-400 bg-clip-text text-transparent">
            Campaign Scheduling
          </h1>
          <p className="text-slate-400 mt-1">Automate your call campaigns with intelligent scheduling</p>
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
          <CardDescription className="text-slate-400">Set up a new scheduled campaign in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="campaign-name" className="text-slate-300">
                Campaign Name
              </Label>
              <Input
                id="campaign-name"
                placeholder="Enter campaign name"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Select Agent</Label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Choose agent" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="ely-specialist">Ely - Conversational AI Specialist</SelectItem>
                  <SelectItem value="jess-solar">Jess - Solar Battery Lead Generator</SelectItem>
                  <SelectItem value="ely-b2b">Ely - B2B Agent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Frequency</Label>
              <Select>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="one-off">One-off (Single Run)</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekdays">Weekdays Only</SelectItem>
                  <SelectItem value="weekends">Weekends Only</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-slate-300">
                Start Date
              </Label>
              <Input id="start-date" type="date" className="bg-slate-800 border-slate-700 text-white" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-slate-300">
                End Date (Optional for One-off)
              </Label>
              <Input id="end-date" type="date" className="bg-slate-800 border-slate-700 text-white" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="text-slate-300">
                Time
              </Label>
              <Input id="time" type="time" defaultValue="09:00" className="bg-slate-800 border-slate-700 text-white" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-cyan-600 via-cyan-600 to-emerald-500 hover:from-cyan-700 hover:via-cyan-700 hover:to-emerald-600 text-white">
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
          <CardDescription className="text-slate-400">Manage your automated campaign schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-800">
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-300">Campaign Name</TableHead>
                  <TableHead className="text-slate-300">Agent</TableHead>
                  <TableHead className="text-slate-300">Schedule</TableHead>
                  <TableHead className="text-slate-300">Frequency</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Next Run</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium text-white">{campaign.name}</TableCell>
                    <TableCell className="text-slate-400">{campaign.agent}</TableCell>
                    <TableCell className="text-slate-400">
                      {campaign.schedule} ({campaign.timezone})
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          campaign.frequency === "one-off"
                            ? "border-purple-500/50 text-purple-400"
                            : "border-slate-600 text-slate-400"
                        }
                      >
                        {campaign.frequency}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-slate-400">{campaign.nextRun}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                          {campaign.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
                          <Settings className="w-4 h-4" />
                        </Button>
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
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Global Scheduling Settings
          </CardTitle>
          <CardDescription className="text-slate-400">Configure default scheduling preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2 block">Default Timezone</Label>
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
                  <Label className="text-slate-300 font-medium">Respect Do Not Call Hours</Label>
                  <p className="text-xs text-slate-400">Automatically skip calls during restricted hours</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2 block">Business Hours</Label>
                <div className="flex gap-2">
                  <Input type="time" defaultValue="09:00" className="bg-slate-800 border-slate-700 text-white" />
                  <span className="text-slate-400 self-center">to</span>
                  <Input type="time" defaultValue="17:00" className="bg-slate-800 border-slate-700 text-white" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-300 font-medium">Weekend Scheduling</Label>
                  <p className="text-xs text-slate-400">Allow campaigns to run on weekends</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
