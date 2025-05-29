import { AgentConfigType } from "./agent"

interface KeyValueType {
  [key: string]: string
}

export type CallStatusType = 'registered' | 'queued' | 'dispatching' | 'provider_queued' | 'initiated' | 'ringing' | 'in-progress' | 'user-ended' | 'agent-ended' | 'api-ended' | 'voicemail-hangup' | 'voicemail-message' | 'timeout' | 'canceled' | 'busy' | 'no-answer' | 'failed' | 'error' | 'unknown'

interface CallLogType {
  agent_id?: string
  agent_config?: AgentConfigType
  duration?: number
  ts?: number
  chat?: string
  chars_used?: number
  session_id?: string
  call_id?: string
  cost_breakdown?: Array<{
    completion_tokens: number
    credit: number
    prompt_tokens: number
    provider: string
    type: string
  }>
  voip: KeyValueType
  recording: KeyValueType
  metadata: KeyValueType
  function_calls: KeyValueType[]
  call_status: CallStatusType
}

export default CallLogType
