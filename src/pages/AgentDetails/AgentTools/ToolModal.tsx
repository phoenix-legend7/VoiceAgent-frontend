import clsx from "clsx"
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from "react"
import { FaChevronDown, FaInfoCircle, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import axiosInstance, { handleAxiosError } from "../../../core/axiosInstance"
import { InputBox, SwtichWithLabel } from "../../../library/FormField"
import Modal from "../../../library/ModalProvider"
import Select from "../../../library/Select"
import { AgentTypeRead, ToolType } from "../../../models/agent"
import { ConnectedTool, tools as totalTools } from "../../Settings/Tools"
import { SelectOptionType } from "../../../models/common"
import { Cog } from "lucide-react"

interface ToolModalProps {
  agent: AgentTypeRead
  isOverlayShow: boolean
  connectedTools: ConnectedTool[]
  selectedTool: ToolType | null
  showModal: boolean
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setSelectedTool: Dispatch<SetStateAction<ToolType | null>>
  setShowModal: Dispatch<SetStateAction<boolean>>
}

const ToolModal: FC<ToolModalProps> = ({
  agent,
  isOverlayShow,
  connectedTools,
  selectedTool,
  showModal,
  setAgent,
  setIsOverlayShow,
  setSelectedTool,
  setShowModal,
}) => {
  const [toolId, setToolId] = useState<string>()
  const [runFunctionAfterCall, setRunFunctionAfterCall] = useState(false)
  const [webhookTimeout, setWebhookTimeout] = useState<number>(5)
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false)
  const [preActionPhrase, setPreActionPhrase] = useState<'strict' | 'flexible'>()
  const [preActionPhraseValues, setPreActionPhraseValues] = useState<string[]>([])
  const [inputPhrase, setInputPhrase] = useState<string>('')

  useEffect(() => {
    if (selectedTool) {
      setRunFunctionAfterCall(selectedTool.run_after_call || false)
      setWebhookTimeout(selectedTool.timeout || 5)
      setPreActionPhrase(selectedTool.response_mode)
      setPreActionPhraseValues(selectedTool.messages || [])
    }
    setToolId(selectedTool?.id)
  }, [selectedTool])
  useEffect(() => {
    if (showModal && !selectedTool) {
      const unConnectedTools = connectedTools.filter(ct => !!agent.tools.find(t => t.id === ct.id))
      setToolId(unConnectedTools.length > 0 ? unConnectedTools[0].id : "whatsapp-business")
    }
  }, [showModal, selectedTool, connectedTools, agent.tools])

  const connectedToolOptions = useMemo(() =>
    connectedTools.map((ct) => {
      const Icon = totalTools.find(t => t.id === ct.tool_id)?.icon ?? Cog
      return {
        label: ct.name,
        value: ct.id,
        icon: (
          <div className="size-8 p-1.5 text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md">
            <Icon className="size-5" />
          </div>
        ),
      }
    }),
    [connectedTools]
  )

  const onClose = () => {
    setShowModal(false)
    setRunFunctionAfterCall(false)
    setWebhookTimeout(5)
    setShowAdvancedConfig(false)
    setPreActionPhrase(undefined)
    setPreActionPhraseValues([])
    setInputPhrase('')
    setSelectedTool(null)
  }
  const handleCreate = async () => {
    if (!toolId) return;
    const tools: ToolType[] = [];
    if (selectedTool) {
      const tool = tools.find((tool) => tool.id === selectedTool.id)
      if (tool) {
        tool.response_mode = preActionPhrase
        tool.messages = preActionPhrase ? preActionPhraseValues : undefined
        tool.run_after_call = runFunctionAfterCall
        tool.timeout = webhookTimeout
      }
    } else {
      tools.push({
        response_mode: preActionPhrase,
        messages: preActionPhrase ? preActionPhraseValues : undefined,
        run_after_call: runFunctionAfterCall,
        timeout: webhookTimeout,
        id: toolId,
      })
    }
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(`/agent/${agent.id}/tools`, tools)
      toast.success('Function created')
      setAgent({ ...agent, tools })
      onClose()
    } catch (error) {
      handleAxiosError('Failed to create function', error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Modal
      isOpen={showModal}
      onClose={onClose}
      okBtnLabel={selectedTool ? 'Update' : 'Create'}
      onOK={handleCreate}
      isLoading={isOverlayShow}
      title={selectedTool ? 'Update Function' : 'Create Function'}
      modalSize="max-w-xl"
    >
      <div>
        <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg mt-4">
          <Select
            isSearchable
            options={connectedToolOptions}
            value={connectedToolOptions.find(ct => ct.value === toolId)}
            onChange={(e) => setToolId((e as SelectOptionType).value as string)}
          />
          <div className="border border-gray-800 dark:border-white px-5 py-2 flex justify-between items-center rounded-xl mt-4">
            <div>
              <div className="text-semibold">
                Run Function After Call
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Set the function to execute after the call ended.
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div>
                <button
                  className="cursor-pointer rounded hover:bg-gray-700/20 p-2 transition-all duration-300"
                  title="The function will always trigger at the end, even with incomplete data. Ensure your webhook handles these cases. Example use cases: capturing leads to CRM, saving records after the call."
                >
                  <FaInfoCircle className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <SwtichWithLabel
                onChange={(e) => setRunFunctionAfterCall(e)}
                value={runFunctionAfterCall}
              />
            </div>
          </div>
          <div className={clsx(
            "mt-4 dark:shadow-black shadow-gray-300 shadow-sm rounded-md p-4",
            { 'border-t border-gray-200 dark:border-gray-700': !showAdvancedConfig }
          )}>
            <div
              className="flex items-center justify-between gap-2 cursor-pointer"
              onClick={() => setShowAdvancedConfig(prev => !prev)}
            >
              Advanced Config
              <FaChevronDown
                className={clsx(
                  "cursor-pointer transition-all duration-300",
                  { 'rotate-180': showAdvancedConfig }
                )}
              />
            </div>
            <div className={clsx(
              "transition-all duration-300 overflow-hidden",
              showAdvancedConfig ? 'max-h-96' : 'max-h-0'
            )}>
              <InputBox
                onChange={(e) => setWebhookTimeout(Number(e) || 5)}
                value={webhookTimeout.toString()}
                label="Webhook Timeout (seconds, default 5s)"
                className="mt-8"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="border border-gray-300 dark:border-gray-800 px-6 py-4 mt-4 rounded-lg">
        <div className="font-semibold">Pre-Action Phrases</div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Define the phrases your agent will say before calling the function.
          If left blank, the agent will autonomously come up with phrases.
        </p>
        <div className="flex flex-col py-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              className="size-5 cursor-pointer"
              checked={preActionPhrase === undefined}
              onChange={() => setPreActionPhrase(undefined)}
            />
            <div className="flex flex-col w-full border-b border-gray-400 dark:border-gray-600 py-2">
              <div>Disable</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                The agent will execute the action silently without saying anything.
              </div>
            </div>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              className="size-5 cursor-pointer"
              checked={preActionPhrase === 'flexible'}
              onChange={() => setPreActionPhrase('flexible')}
            />
            <div className="flex flex-col w-full border-b border-gray-400 dark:border-gray-600 py-2">
              <div>Flexiable</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                The agent will generate a phrase based on the examples provided, adjusting for context and language.
              </div>
            </div>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              className="size-5 cursor-pointer"
              checked={preActionPhrase === 'strict'}
              onChange={() => setPreActionPhrase('strict')}
            />
            <div className="flex flex-col w-full py-2">
              <div>Strict</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                The agent will say exactly one of the phrases provided, regardless of language.
              </div>
            </div>
          </label>
        </div>
        {!!preActionPhrase && (
          <div>
            <InputBox
              value={inputPhrase}
              onChange={(e) => setInputPhrase(e)}
              placeholder="Enter phrases separated by commas or enter key"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter' || e.key === ',') {
                  setPreActionPhraseValues([...preActionPhraseValues, inputPhrase])
                  setInputPhrase('')
                }
              }}
              onBlur={() => {
                if (inputPhrase.trim() !== '') {
                  setPreActionPhraseValues([...preActionPhraseValues, inputPhrase])
                  setInputPhrase('')
                }
              }}
            />
            <div className="flex items-center gap-x-3 gap-y-2 mt-2">
              {preActionPhraseValues.map((value, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm border border-gray-400 dark:border-gray-700 rounded px-2 py-1"
                >
                  <div className="flex-1">{value}</div>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-400 cursor-pointer transition-all duration-300"
                    onClick={() => setPreActionPhraseValues(preActionPhraseValues.filter((_, i) => i !== index))}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ToolModal
