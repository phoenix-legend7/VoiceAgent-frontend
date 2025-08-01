interface CampaignTypeBase {
  name: string;
}

export interface CampaignRecordTypeBase {
  phone: string;
  metadata?: { [key: string]: string };
}

export interface CampaignRecordTypeRead extends CampaignRecordTypeBase {
  metadata: { [key: string]: string };
  call_status: "not_started" | "started" | "finished" | "failed";
}

export interface CampaignTypeRead extends CampaignTypeBase {
  id: string;
  status: "idle" | "started" | "paused" | "finished" | "failed";
  records: Array<CampaignRecordTypeRead>;
  created_at: number;
}

export interface CampaignInfoType {
  id: string;
  name: string;
  status: "idle" | "started" | "paused" | "finished" | "failed";
  created_at: number;
  include_metadata_in_prompt: boolean;
  caller?: string;
}

export default CampaignTypeBase;
