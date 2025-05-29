import { AgentConfigType } from "./agent"

interface PhoneTypeBase {
  id: string
  agent_id: string
  agent_config_override: AgentConfigType
}

export interface PhoneTypeRead extends PhoneTypeBase {
  create_at: number
  status: string
  tags?: string[]
}

export default PhoneTypeBase
