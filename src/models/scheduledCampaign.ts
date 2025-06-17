export type CampaignScheduleFrequency = "daily" | "weekdays" | "weekends" | "weekly" | "monthly" | "custom";

export interface ScheduledCampaignCreate {
  campaign_name: string;
  caller: string;
  frequency: CampaignScheduleFrequency;
  start_time?: number;
  end_time?: number;
}

export interface ScheduledCampaignRead extends ScheduledCampaignCreate {
  id: string;
  created_at: number;
  error?: string;
  status: "active" | "paused" | "scheduled" | "error";
  campaign_name: string;
  campaign_status: "idle" | "started" | "paused" | "finished" | "failed";
  caller: string;
}
