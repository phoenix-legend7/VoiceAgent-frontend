import LanguageType from "./language"
import LLMType from "./llm"
import { SpeechToTextProvider, VoiceProvider } from "./provider"

export interface AgentVoiceConfigType {
  provider: VoiceProvider
  voice_id?: string
  model?: string
  settings?: { [key: string]: string | number | boolean | null }
}

export interface AgentConfigType {
  prompt: string
  voice: AgentVoiceConfigType
  flow: {
    user_start_first?: boolean
    interruption?: {
      allowed?: boolean
      keep_interruption_message?: boolean
      first_messsage?: boolean
    }
    response_delay?: {
      generic_delay?: number
      number_input_delay?: number
    }
    auto_fill_responses?: {
      response_gap_threshold: number
      messages: string[]
    }
    agent_terminate_call?: {
      enabled: boolean
      instruction?: string
      messages?: string[]
    }
    voicemail?: {
      action: "hangup" | "message"
      message?: string
      continue_on_voice_activity?: boolean
    }
    call_transfer?: {
      phone: string
      instruction?: string
      messages?: string[]
    }
    inactivity_handling?: {
      idle_time: number
      message: string
    }
    dtmf_dial?: {
      enabled?: boolean
      instruction?: string
    }
  }
  first_message?: string
  tools?: {
    name: string
    params?: {
      name: string
      required: boolean
      type: string
      description: string
    }[]
    description: string
    webhook?: string
    header?: { [key: string]: string }
    method?: string
    timeout?: number
    run_after_call?: boolean
    messages?: string[]
    response_mode?: "strict" | "flexible"
    execute_after_message?: boolean
    exclude_session_id?: boolean
  }[]
  millis_functions?: {
    name: string
    description: string
    data: {
      param: {
        description: string
        name: string
        required: boolean
        type: string
      }
    }
    type: string
    messages?: string[]
    response_mode?: "strict" | "flexible"
  }[]
  app_functions?: {
    name: string
    credentials?: { [key: string]: string }
  }[]
  custom_llm_websocket?: string
  language: LanguageType
  vad_threshold?: number
  llm?: {
    model: LLMType
    temperature?: number
    history_settings?: {
      history_message_limit?: number
      history_tool_result_limit?: number
    }
  }
  session_timeout?: {
    max_duration?: number
    max_idle?: number
    message?: string
  }
  session_data_webhook?: string | {
    url: string
    headers?: { [key: string]: string }
  }
  privacy_settings?: {
    opt_out_data_collection: boolean
    do_not_call_detection?: boolean
  }
  custom_vocabulary?: { keywords: { [key: string]: number } }
  extra_prompt_webhook?: string | {
    url: string
    headers?: { [key: string]: string }
  }
  switch_language?: { languages: string[] }
  knowledge_base?: {
    files?: string[]
    messages?: string[]
  }
  speech_to_text?: {
    provider?: SpeechToTextProvider
    multilingual?: boolean
    model?: string
  }
  call_settings?: { enable_recording?: boolean }
  timezone?: string
}

interface AgentTypeBase {
  name: string
  config: AgentConfigType
}

export interface AgentTypeRead extends AgentTypeBase {
  id: string
  created_at: number
}

export default AgentTypeBase
