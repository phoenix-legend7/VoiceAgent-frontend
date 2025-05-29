import { languageOptions } from "../../consts/languages";
import { AgentTypeRead } from "../../models/agent";

export const getLanguage = (agent: AgentTypeRead) => {
  if (!!agent.config.speech_to_text?.multilingual) {
    return 'Multilingual';
  }
  const switchLanguage = agent.config.switch_language;
  const language = agent.config.language;
  const languageLabel = languageOptions.find(lang => lang.value === language)?.label || 'English - default';
  if (switchLanguage?.languages.length) {
    return `${languageLabel} (+${switchLanguage.languages.length})`;
  }
  return languageLabel;
}