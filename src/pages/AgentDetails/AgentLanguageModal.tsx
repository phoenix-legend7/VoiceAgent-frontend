import clsx from "clsx";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { languageOptions } from "../../consts/languages";
import axiosInstance from "../../core/axiosInstance";
import { InputBox, SwtichWithLabel } from "../../library/FormField";
import Modal from "../../library/ModalProvider";
import Select from "../../library/Select";
import { AgentTypeRead } from "../../models/agent";
import { SelectOptionType } from "../../models/common";
import { SpeechToTextProvider } from "../../models/provider";
import VoiceType from "../../models/voice";

const sttProviderOptions = [
  { label: "Millis - Auto Select Best Option", value: "" },
  { label: "Deepgram", value: "deepgram" },
  { label: "Gladia", value: "gladia" },
];
const deepgramModelOptions = [
  "nova-3",
  "nova-2",
  "nova-2-phonecall",
  "nova-2-conversationalai",
].map((op) => ({ label: op, value: op }));
const multiLangOptionList = [
  {
    value: "en-sp",
    title: "English & Spanish",
    description: "Agent can understand and speak both English and Spanish",
  },
  {
    value: "multi",
    title: "Multilingual",
    description:
      "Agent can automatically detect the user’s spoken language and respond in the same language (this may increase latency).",
  },
  {
    value: "switch",
    title: "Language Switching",
    description:
      "Agent can switch languages during the conversation when the user requests it in the language the agent is currently speaking.",
  },
];

interface Props {
  agent: AgentTypeRead;
  isOverlayShow: boolean;
  showAgentLangModal: boolean;
  voices: VoiceType[];
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
  setShowAgentLangModal: Dispatch<SetStateAction<boolean>>;
  setVoices: Dispatch<SetStateAction<VoiceType[]>>;
}

const AgentLanguageModal: FC<Props> = ({
  agent,
  isOverlayShow,
  showAgentLangModal,
  voices,
  setAgent,
  setIsOverlayShow,
  setShowAgentLangModal,
  setVoices,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string | undefined>(
    ""
  );
  const [isMultiLangSupport, setIsMultiLangSupport] = useState<boolean>(false);
  const [multiLangOption, setMultiLangOption] = useState<string | undefined>(
    undefined
  );
  const [terms, setTerms] = useState<string[]>([]);
  const [typingTerm, setTypingTerm] = useState<string>("");
  const [sttProvider, setSttProvider] = useState<SpeechToTextProvider>();
  const [sttModel, setSttModel] = useState<string>();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showAgentLangModal) {
      const isMulti = !!agent.config.speech_to_text?.multilingual;
      const language = agent.config.language;
      const switchLanguages = agent.config.switch_language?.languages || [];
      setSelectedLanguage(language);
      setIsMultiLangSupport(isMulti || !!switchLanguages.length);
      if (isMulti) {
        setMultiLangOption("en-sp");
      } else if (language === "multi") {
        setMultiLangOption("multi");
      } else if (agent.config.switch_language?.languages.length) {
        setMultiLangOption("switch");
      } else {
        setMultiLangOption(undefined);
      }
      setTerms(Object.keys(agent.config.custom_vocabulary?.keywords || {}));
      setSttProvider(agent.config.speech_to_text?.provider);
      setSttModel(agent.config.speech_to_text?.model);
      setSelectedLanguages(switchLanguages);
    } else {
      setSelectedLanguage(undefined);
      setMultiLangOption(undefined);
      setTerms([]);
      setSttProvider(undefined);
      setSttModel(undefined);
      setSelectedLanguages([]);
    }
  }, [agent, showAgentLangModal]);
  useEffect(() => {
    if (sttProvider === "deepgram") {
      setSttModel(sttModel || "nova-3");
    }
  }, [sttModel, sttProvider]);
  useEffect(() => {
    const fetchVoices = async (lang: string) => {
      const response = await axiosInstance.get("/voice/custom", {
        params: { lang_code: lang },
      });
      setVoices(response.data);
    };
    if (selectedLanguage === undefined) return;
    fetchVoices(selectedLanguage || "en-US");
  }, [selectedLanguage]);

  const onClose = () => {
    setShowAgentLangModal(false);
    setTypingTerm("");
  };
  const onSubmit = async () => {
    const editData: { [key: string]: any } = {
      name: agent.name,
      config: {},
    };
    editData.config.language = selectedLanguage || "en-US";
    editData.config.speech_to_text = null;
    editData.config.switch_language = null;
    if (isMultiLangSupport) {
      if (multiLangOption === "en-sp") {
        editData.config.language = "multi";
      } else if (multiLangOption === "switch" || multiLangOption === "multi") {
        if (selectedLanguages.length) {
          editData.config.switch_language = {
            languages: selectedLanguages,
          };
        }
      } else if (multiLangOption === "multi") {
        if (!editData.config.speech_to_text) {
          editData.config.speech_to_text = {};
        }
        editData.config.speech_to_text.multilingual = true;
      }
    }
    if (terms.length) {
      const keywords: { [key: string]: 1 } = {};
      terms.forEach((t) => {
        keywords[t] = 1;
      });
      editData.config.custom_vocabulary = { keywords };
    }
    if (sttProvider) {
      if (!editData.config.speech_to_text) {
        editData.config.speech_to_text = {};
      }
      editData.config.speech_to_text.provider = sttProvider;
      if (sttProvider === "deepgram" && sttModel !== "nova-3") {
        editData.config.speech_to_text.model = sttModel;
      } else {
        editData.config.speech_to_text.model = undefined;
      }
    }
    if (voices.length && agent.config.language !== editData.config.language) {
      editData.config.voice = {
        provider: voices[0].provider,
        voice_id: voices[0].voice_id,
      }
    }
    setIsOverlayShow(true);
    try {
      await axiosInstance.put(`/agent/${agent.id}`, editData);
      toast.success("Agent updated successfully");
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          ...editData.config,
        }
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update agent");
    } finally {
      setIsOverlayShow(false);
    }
  };
  const handleAddTerm = () => {
    if (typingTerm.trim()) {
      const newTerms = new Set([...terms, typingTerm]);
      setTerms(Array.from(new Set(newTerms)));
    }
    setTypingTerm("");
  };

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={showAgentLangModal}
      onClose={onClose}
      onOK={onSubmit}
      title="Agent Language"
      okBtnLabel="Save Changes"
      modalSize="max-w-xl"
      ref={modalRef}
    >
      <div className="flex flex-col gap-2">
        <div>Default Language</div>
        <Select
          options={languageOptions}
          value={languageOptions.find(
            (lang) => lang.value === selectedLanguage
          )}
          isSearchable
          onChange={(e) =>
            setSelectedLanguage(
              (e as SelectOptionType).value as string | undefined
            )
          }
          placeholder="Default Language"
        />
      </div>
      <div className="flex items-center justify-between gap-3 p-4 my-3">
        <div>
          <div className="text-lg font-semibold">Multi Language Support</div>
          <div className="text-gray-400 text-sm">
            Allow agent to support multiple languages
          </div>
        </div>
        <SwtichWithLabel
          onChange={(e) => setIsMultiLangSupport(e)}
          value={isMultiLangSupport}
          label="Enable"
        />
      </div>
      <div
        className={clsx(
          "border-l-gray-700 border-b-gray-950 rounded-md mx-4 pl-3 overflow-hidden transition-all duration-300",
          isMultiLangSupport
            ? "border-l-[0.5px] border-b-[0.5px] max-h-96 py-2"
            : "max-h-0 border-0"
        )}
      >
        {multiLangOptionList.map((option, index) => (
          <div key={`option-${index}`}>
            {index > 0 && <hr className="text-gray-800 my-2" />}
            <label
              className="flex gap-3 items-center cursor-pointer"
              onClick={() => {
                setMultiLangOption(option.value);
              }}
            >
              <div>
                <div
                  className={clsx(
                    "size-[18px] rounded-full",
                    option.value === multiLangOption
                      ? "border-4 border-sky-400"
                      : "border-2 border-gray-400"
                  )}
                />
              </div>
              <div>
                <div className="mb-0.5">{option.title}</div>
                <div className="text-xs text-gray-400 leading-5">
                  {option.description}
                </div>
              </div>
            </label>
          </div>
        ))}
        {multiLangOption !== "en-sp" && (
          <div className="ml-8 mt-2 flex flex-col gap-1">
            <div>Languages Supported</div>
            <div>
              <Select
                options={languageOptions.filter((o) => o.value)}
                value={languageOptions.filter((o) =>
                  selectedLanguages.find((l) => l === o.value)
                )}
                isMulti
                isSearchable
                menuPortalTarget={modalRef.current}
                placeholder="Select Languages"
                onChange={(e) =>
                  setSelectedLanguages(
                    (e as SelectOptionType[]).map((o) => o.value as string)
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
      <div className="my-6 mx-4">
        <div className="text-lg font-semibold">Custom Vocabulary</div>
        <div className="text-sm text-gray-400">
          Provide a list of specialized terms or uncommon proper nouns for the
          agent to recognize, enhancing model accuracy with new vocabulary.
        </div>
        <div className="my-5">
          <InputBox
            onChange={setTypingTerm}
            value={typingTerm}
            placeholder="Enter keywords separated by commas or enter key"
            onBlur={handleAddTerm}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "NumpadEnter" ||
                e.key === ","
              ) {
                handleAddTerm();
              }
            }}
          />
          <div className="flex items-center flex-wrap mt-4 text-sm gap-x-3 gap-y-2">
            {terms.map((term, index) => (
              <div
                key={`phrase-${index}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-neutral-500"
              >
                <div className="text-gray-400">{term}</div>
                <button
                  className="cursor-pointer text-gray-600 hover:text-gray-400 transition-colors duration-300"
                  onClick={() => {
                    setTerms(terms.filter((_, i) => i !== index));
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="my-4 flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
        <div className="px-2.5 text-center text-nowrap text-lg">
          Advanced Settings
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div>STT Provider</div>
        <Select
          options={sttProviderOptions}
          className="grow"
          value={sttProviderOptions.find((o) => o.value === sttProvider)}
          onChange={(e) =>
            setSttProvider(
              (e as SelectOptionType).value as SpeechToTextProvider
            )
          }
        />
      </div>
      {sttProvider === "deepgram" && (
        <>
          <div className="flex items-center gap-3 mt-3">
            <div>STT Model</div>
            <Select
              options={deepgramModelOptions}
              className="grow"
              value={deepgramModelOptions.find((o) => o.value === sttModel)}
              onChange={(e) =>
                setSttModel((e as SelectOptionType).value as string)
              }
            />
          </div>
          <div className="mt-3">
            <a
              href="https://developers.deepgram.com/docs/models-languages-overview"
              target="_blank"
              className="text-sky-400 underline"
            >
              Learn more about {sttProvider}'s models and language support
            </a>
          </div>
        </>
      )}
    </Modal>
  );
};

export default AgentLanguageModal;
