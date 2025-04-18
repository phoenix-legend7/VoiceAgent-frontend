interface VoiceType {
  name: string
  provider: string
  voice_id: string
  preview_url?: string
  language?: string
  category?: string
}

export default VoiceType
