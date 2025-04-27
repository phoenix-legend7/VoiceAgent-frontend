import LanguageType from "./language"
import LLMType from "./llm"
import { SpeechToTextProvider, VoiceProvider } from "./provider"

export interface AgentConfigType {
  prompt: string
  voice: {
    provider: VoiceProvider
    voice_id: string | null
    model: string | null
    settings: { [key: string]: string | number | boolean | null } | null
  }
  flow: {
    user_start_first: boolean | null
    interruption: null | {
      allowed: boolean | null
      keep_interruption_message: boolean | null
      first_messsage: boolean | null
    }
    response_delay: null | {
      generic_delay: number | null
      number_input_delay: number | null
    }
    auto_fill_responses: null | {
      response_gap_threshold: number
      messages: string[]
    }
    agent_terminate_call: null | {
      enabled: boolean
      instruction: string | null
      messages: string[] | null
    }
    voicemail: null | {
      action: "hangup" | "message"
      message: string | null
      continue_on_voice_activity: boolean | null
    }
    call_transfer: null | {
      phone: string
      instruction: string | null
      messages: string[] | null
    }
    inactivity_handling: null | {
      idle_time: number
      message: string
    }
    dtmf_dial: null | {
      enabled?: boolean
      instruction: string | null
    }
  }
  first_message: string | null
  tools: null | {
    name: string
    params: null | {
      name: string
      required: boolean
      type: string
      description: string
    }[]
    description: string
    webhook: string | null
    header: null | { [key: string]: string }
    method: string | null
    timeout: number | null
    run_after_call: boolean | null
    messages: string[] | null
    response_mode: "strict" | "flexible" | null
    execute_after_message: boolean | null
    exclude_session_id: boolean | null
  }[]
  millis_functions: null | {
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
    messages: string[] | null
    response_mode: "strict" | "flexible" | null
  }[]
  app_functions: null | {
    name: string
    credentials: { [key: string]: string } | null
  }[]
  custom_llm_websocket: string | null
  language: LanguageType
  vad_threshold: number | null
  llm: null | {
    model: LLMType
    temperature?: number
    history_settings: null | {
      history_message_limit: number | null
      history_tool_result_limit: number | null
    }
  }
  session_timeout: null | {
    max_duration: number | null
    max_idle: number | null
    message: string | null
  }
  session_data_webhook: string | null | {
    url: string
    headers: { [key: string]: string } | null
  }
  privacy_settings: null | {
    opt_out_data_collection: boolean
    do_not_call_detection?: boolean
  }
  custom_vocabulary: null | { keywords: { [key: string]: number } }
  extra_prompt_webhook: string | null | {
    url: string
    headers: { [key: string]: string } | null
  }
  switch_language: null | { languages: string[] }
  knowledge_base: null | {
    files: string[] | null
    messages: string[] | null
  }
  speech_to_text: null | {
    provider: SpeechToTextProvider | null
    multilingual: boolean | null
    model: string | null
  }
  call_settings: { enable_recording?: boolean } | null
  timezone: string | null
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
