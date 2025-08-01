import clsx from "clsx"
import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { FaChevronDown, FaInfoCircle } from "react-icons/fa"
import { toast } from "react-toastify"
import llms, { languageModels, speechModels } from "../../consts/llm"
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance"
import Modal from "../../library/ModalProvider"
import { GroupedSelect } from "../../library/Select"
import { AgentTypeRead } from "../../models/agent"
import LLMType from "../../models/llm"

interface Props {
  agent: AgentTypeRead
  isOverlayShow: boolean
  showEditAgentModal: boolean
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setShowEditAgentModal: Dispatch<SetStateAction<boolean>>
}

const EditAgentModal: FC<Props> = ({
  agent,
  isOverlayShow,
  showEditAgentModal,
  setShowEditAgentModal,
  setAgent,
  setIsOverlayShow,
}) => {
  const [selectedModel, setSelectedModel] = useState<LLMType>()
  const [temperature, setTemperaature] = useState(0)
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false)
  const [historyMessageLimit, setHistoryMessageLimit] = useState<number>(0)
  const [historyToolResultLimit, setHistoryToolResultLimit] = useState<number>(0)

  useEffect(() => {
    if (agent.config.llm && showEditAgentModal) {
      setSelectedModel(agent.config.llm.model)
      setTemperaature(agent.config.llm.temperature || 0)
      setHistoryMessageLimit(agent.config.llm.history_settings?.history_message_limit || 0)
      setHistoryToolResultLimit(agent.config.llm.history_settings?.history_tool_result_limit || 0)
    }
  }, [agent.config.llm, showEditAgentModal])

  const onClose = () => {
    setShowEditAgentModal(false)
    setSelectedModel(undefined)
    setTemperaature(0)
    setHistoryMessageLimit(0)
    setHistoryToolResultLimit(0)
    setShowAdvancedConfig(false)
  }
  const onSubmit = async () => {
    let model: { [key: string]: any } | null = null
    if (selectedModel) {
      const historySettings: { [key: string]: number } = {}
      if (historyMessageLimit) {
        historySettings.history_message_limit = historyMessageLimit
      }
      if (historyToolResultLimit) {
        historySettings.history_tool_result_limit = historyToolResultLimit
      }
      model = {
        model: selectedModel,
        temperature: temperature || undefined,
        history_settings: undefined,
      }
      if (Object.keys(historySettings).length > 0) {
        model.history_settings = historySettings
      }
    }
    const editData = {
      name: agent.name,
      config: { llm: model }
    }
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(`/agent/${agent.id}`, editData)
      toast.success('Agent updated successfully')
      if (!model) {
        delete agent.config.llm
      } else {
        agent.config.llm = {
          model: model.model,
          temperature: model.temperature,
          history_settings: model.history_settings,
        }
      }
      setAgent(agent)
      onClose()
    } catch (error) {
      handleAxiosError('Failed to update agent', error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={showEditAgentModal}
      title="Edit Agent"
      onClose={onClose}
      onOK={onSubmit}
      okBtnLabel="Save Changes"
      modalSize="max-w-xl"
    >
      <div className="my-4">Choose LLM Model</div>
      <GroupedSelect
        className="my-2"
        options={[
          { options: [{ label: 'By Millis - Optimize for Best Latency', value: '' }] },
          {
            group: 'Speech Models',
            options: speechModels.map((model) => ({
              label: model.label,
              value: model.value,
              badge: 'Experimental',
            }))
          },
          {
            group: 'Language Models',
            options: languageModels,
          }
        ]}
        value={llms.find((model) => model.value === selectedModel)}
        onChange={(e) => setSelectedModel(e?.value as (LLMType | undefined))}
      />
      {selectedModel ? (
        <div>
          {!!speechModels.find((model) => model.value === selectedModel) && (
            <div className="my-3 px-4 py-3 rounded-lg flex gap-3 border border-gray-500 dark:border-white">
              <FaInfoCircle className="text-sky-600 text-2xl" />
              <div>
                Experimental. Only use it for testing purposes.<br />
                It only supports multilingual mode and might use random languages at the beginning.
              </div>
            </div>
          )}
          <div className="my-3 flex flex-col gap-2">
            <div className="text-lg">Temperature: {temperature || 0}</div>
            <input
              type="range"
              className="w-full cursor-pointer h-1"
              min={0}
              max={1}
              step={0.01}
              value={temperature}
              onChange={(e) => setTemperaature(Number(e.target.value))}
            />
          </div>
          <div className="mt-5 mb-1 rounded border border-gray-500 dark:border-white">
            <div
              className="flex items-center gap-2 justify-between py-4 px-6 cursor-pointer"
              onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            >
              <div className="font-semibold">Chat Settings</div>
              <div className="px-2 text-gray-600 dark:text-gray-400">
                <FaChevronDown
                  className={clsx(
                    'transition-all duration-300',
                    showAdvancedConfig ? 'rotate-180' : 'rotate-0'
                  )}
                />
              </div>
            </div>
            <div
              className={clsx(
                'transition-all duration-300 overflow-hidden',
                showAdvancedConfig ? 'max-h-96' : 'max-h-0'
              )}
            >
              <div className="flex items-center mx-4 justify-between gap-3 mt-4 mb-2">
                <div className="p-3">
                  Number of latest chat messages to keep in history
                </div>
                <div className="py-2 px-4">
                  <input
                    type="number"
                    className="w-32 rounded border border-gray-400 dark:border-gray-700 p-3 outline-0 focus:border-sky-500 transition-all duration-300"
                    value={historyMessageLimit}
                    onChange={(e) => setHistoryMessageLimit(Number(e.target.value))}
                  />
                </div>
              </div>
              <hr className="text-gray-800 mx-4" />
              <div className="flex items-center justify-between gap-3 mt-2 mb-4 mx-4">
                <div className="p-3">
                  Only include tool call results if they appear within the last N chat messages
                </div>
                <div className="py-2 px-4">
                  <input
                    type="number"
                    className="w-32 rounded border border-gray-400 dark:border-gray-700 p-3 outline-0 focus:border-sky-500 transition-all duration-300"
                    value={historyToolResultLimit}
                    onChange={(e) => setHistoryToolResultLimit(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Millis selects the optimal LLM model with the lowest latency based on your config and functions.
        </p>
      )}
    </Modal>
  )
}

export default EditAgentModal
