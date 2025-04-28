import { AgentConfigType } from "./agent"

interface KeyValueType {
  [key: string]: string
}

export type CallStatusType = 'registered' | 'queued' | 'dispatching' | 'provider_queued' | 'initiated' | 'ringing' | 'in-progress' | 'user-ended' | 'agent-ended' | 'api-ended' | 'voicemail-hangup' | 'voicemail-message' | 'timeout' | 'canceled' | 'busy' | 'no-answer' | 'failed' | 'error' | 'unknown'

interface CallLogType {
  agent_id: string | null
  agent_config: AgentConfigType | null
  duration: number | null
  ts: number | null
  chat: string | null
  chars_used: number | null
  session_id: string | null
  call_id: string | null
  cost_breakdown: Array<{
    completion_tokens: number
    credit: number
    prompt_tokens: number
    provider: string
    type: string
  }> | null
  voip: KeyValueType | null
  recording: KeyValueType | null
  metadata: KeyValueType | null
  function_calls: KeyValueType[] | null
  call_status: CallStatusType | null
}

export default CallLogType
