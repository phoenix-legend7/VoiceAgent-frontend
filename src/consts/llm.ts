export const speechModels = [
  { label: "GPT-4o Realtime Preview", value: "gpt-4o-realtime-preview" },
  { label: "GPT-4o Mini Realtime Preview", value: "gpt-4o-mini-realtime-preview" },
]

export const languageModels = [
  { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
  { label: "GPT-4.1", value: "gpt-4.1" },
  { label: "GPT-4.1 Mini", value: "gpt-4.1-mini" },
  { label: "GPT-4.1 Nano", value: "gpt-4.1-nano" },
  { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-4o Mini", value: "gpt-4o-mini" },
  { label: "Llama 3 70B", value: "llama-3-70b" },
  { label: "Llama 3 1.8B", value: "llama-3-1-8b" },
  { label: "Llama 3 1.70B", value: "llama-3-1-70b" },
  { label: "Llama 3 1.405B", value: "llama-3-1-405b" },
  { label: "Mistral Large 2407", value: "mistral-large-2407" },
  { label: "L3.1 70B Euryale v2.2", value: "l3.1-70b-euryale-v2.2" },
  { label: "DeepSeek V3", value: "deepseek-v3" }
]

const llms = [
  ...speechModels,
  ...languageModels,
]

export default llms
