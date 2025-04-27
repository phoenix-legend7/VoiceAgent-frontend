import { AgentConfigType } from "./agent"

interface PhoneTypeBase {
  id: string
  agent_id: string | null
  agent_config_override: AgentConfigType | null
}

export interface PhoneTypeRead extends PhoneTypeBase {
  create_at: number
  status: string
  tags: string[] | null
}

export default PhoneTypeBase
