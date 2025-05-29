import clsx from "clsx"
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from "react"
import { FaChevronDown, FaInfoCircle, FaRegTrashAlt, FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"
import axiosInstance from "../../../core/axiosInstance"
import { InputBox, SwtichWithLabel } from "../../../library/FormField"
import Modal from "../../../library/ModalProvider"
import Select from "../../../library/Select"
import { AgentTypeRead } from "../../../models/agent"
import { SelectOptionType } from "../../../models/common"

const paramTypeOptions = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' }
]
const extraParamsOptions = [
  { label: 'session_id', value: 'session_id' }
]
const webFormParamTypeOptions = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'email', value: 'email' },
]

interface ToolModalProps {
  agent: AgentTypeRead
  isOverlayShow: boolean
  selectedTool: { name: string, type: string } | null
  showModal: boolean
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setSelectedTool: Dispatch<SetStateAction<{ name: string, type: string } | null>>
  setShowModal: Dispatch<SetStateAction<boolean>>
}

const ToolModal: FC<ToolModalProps> = ({
  agent,
  isOverlayShow,
  selectedTool,
  showModal,
  setAgent,
  setIsOverlayShow,
  setSelectedTool,
  setShowModal,
}) => {
  const [functionName, setFunctionName] = useState<string>('')
  const [functionDescription, setFunctionDescription] = useState<string>('')
  const [functionType, setFunctionType] = useState<'webhook' | 'web form'>('webhook')
  const [webhookUrl, setWebhookUrl] = useState<string>('')
  const [webhookMethod, setWebhookMethod] = useState<'GET' | 'POST'>('GET')
  const [runFunctionAfterCall, setRunFunctionAfterCall] = useState(false)
  const [webhookHeaders, setWebhookHeaders] = useState<{ key: string, value: string }[]>([])
  const [webhookParams, setWebhookParams] = useState<{ name: string, required: boolean, type: string, description: string }[]>([])
  const [webhookTimeout, setWebhookTimeout] = useState<number>(5)
  const [webhookExtraParams, setWebhookExtraParams] = useState<string[]>([])
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false)
  const [webFormParam, setWebFormParam] = useState<{ name: string, type: string }>({ name: '', type: '' })
  const [preActionPhrase, setPreActionPhrase] = useState<'strict' | 'flexible'>()
  const [preActionPhraseValues, setPreActionPhraseValues] = useState<string[]>([])
  const [inputPhrase, setInputPhrase] = useState<string>('')

  const originTool = useMemo(() => {
    if (selectedTool?.type === 'webhook') {
      return agent.config.tools?.find((tool) => tool.name === selectedTool?.name)
    } else if (selectedTool?.type === 'web form') {
      return agent.config.millis_functions?.find((tool) => tool.name === selectedTool?.name)
    }
  }, [agent.config, selectedTool?.name])

  useEffect(() => {
    return () => {
      setFunctionName('')
      setFunctionDescription('')
      setFunctionType('webhook')
      setWebhookUrl('')
      setWebhookMethod('GET')
      setRunFunctionAfterCall(false)
      setWebhookHeaders([])
      setWebhookParams([])
      setWebhookTimeout(5)
      setWebhookExtraParams([])
      setShowAdvancedConfig(false)
      setWebFormParam({ name: '', type: '' })
      setPreActionPhrase(undefined)
      setPreActionPhraseValues([])
      setInputPhrase('')
    }
  }, [])
  useEffect(() => {
    if (selectedTool) {
      if (selectedTool.type === 'webhook') {
        const tool = agent.config.tools?.find((tool) => tool.name === selectedTool.name)
        if (tool) {
          setFunctionName(tool.name)
          setFunctionDescription(tool.description)
          setFunctionType('webhook')
          setWebhookUrl(tool.webhook || '')
          setWebhookMethod((tool.method as 'GET' | 'POST') || 'GET')
          setRunFunctionAfterCall(tool.run_after_call || false)
          setWebhookHeaders(Object.keys(tool.header || {}).map((key) =>
            ({ key, value: tool.header?.[key] || '' })
          ) || [])
          setWebhookParams(tool.params || [])
          setWebhookTimeout(tool.timeout || 5)
          setPreActionPhrase(tool.response_mode)
          setPreActionPhraseValues(tool.messages || [])
        }
      } else if (selectedTool.type === 'web form') {
        const func = agent.config.millis_functions?.find((func) => func.name === selectedTool.name)
        if (func) {
          setFunctionName(func.name)
          setFunctionDescription(func.description)
          setFunctionType('web form')
          setWebFormParam({ name: func.data.param.name, type: func.data.param.type })
          setPreActionPhrase(func.response_mode)
          setPreActionPhraseValues(func.messages || [])
        }
      }
    }
  }, [agent, selectedTool])

  const onClose = () => {
    setShowModal(false)
  }
  const handleCreate = async () => {
    if (!functionName || !functionDescription) {
      toast.warning('Function Name and Description are required')
      return
    }
    let editData: AgentTypeRead;
    const headers: { [key: string]: string } = {}
    if (functionType === 'webhook') {
      if (!webhookUrl) {
        toast.warning('Webhook URL is required')
        return
      }
      webhookHeaders.forEach((header) => {
        headers[header.key] = header.value
      })
      const tools = agent.config.tools || []
      if (selectedTool && selectedTool.type === 'webhook') {
        const tool = tools.find((tool) => tool.name === selectedTool.name)
        if (tool) {
          tool.description = functionDescription
          tool.name = functionName
          tool.response_mode = preActionPhrase
          tool.messages = preActionPhrase ? preActionPhraseValues : undefined
          tool.webhook = webhookUrl
          tool.method = webhookMethod
          tool.run_after_call = runFunctionAfterCall
          tool.header = headers
          tool.params = webhookParams
          tool.timeout = webhookTimeout
        }
      } else {
        const tool = tools.find((tool) => tool.name === functionName)
        if (tool) {
          toast.error('Function name must be unique')
          return
        }
        tools.push({
          description: functionDescription,
          name: functionName,
          response_mode: preActionPhrase,
          messages: preActionPhrase ? preActionPhraseValues : undefined,
          webhook: webhookUrl,
          method: webhookMethod,
          run_after_call: runFunctionAfterCall,
          header: headers,
          params: webhookParams,
          timeout: webhookTimeout,
        })
      }
      editData = { ...agent, config: { ...agent.config, tools } }
    } else {
      if (!webFormParam.name) {
        toast.warning('Web Form Param Name is required')
        return
      }
      if (!webFormParam.name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        toast.warning('Parameter must start with a letter or underscore and contain no spaces. Ex: email, user_email')
        return
      }
      const functions = agent.config.millis_functions || [];
      if (selectedTool && selectedTool.type === 'web form') {
        const func = functions.find((func) => func.name === selectedTool.name)
        if (func) {
          func.description = functionDescription
          func.name = functionName
          func.response_mode = preActionPhrase
          func.messages = preActionPhrase ? preActionPhraseValues : undefined
          func.data.param.name = webFormParam.name
          func.data.param.type = webFormParam.type
        }
      } else {
        const func = functions.find((func) => func.name === functionName)
        if (func) {
          toast.error('Function name must be unique')
          return
        }
        functions.push({
          name: functionName,
          description: functionDescription,
          response_mode: preActionPhrase,
          messages: preActionPhraseValues,
          type: 'web_form',
          data: {
            param: {
              description: '',
              required: false,
              ...webFormParam,
            }
          }
        })
      }
      editData = { ...agent, config: { ...agent.config, millis_functions: functions } }
    }
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(`/agent/${agent.id}`, editData)
      toast.success('Function created')
      setAgent(editData)
      setShowModal(false)
      setSelectedTool(null)
    } catch (error) {
      console.error(error)
      toast.error('Failed to create function')
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Modal
      isOpen={showModal}
      onClose={onClose}
      okBtnLabel={originTool ? 'Update' : 'Create'}
      onOK={handleCreate}
      isLoading={isOverlayShow}
      title={originTool ? 'Update Function' : 'Create Function'}
      modalSize="max-w-xl"
    >
      <InputBox
        onChange={(e) => setFunctionName(e)}
        value={functionName}
        label="Function Name"
        placeholder='Enter meaningful function name. Ex: "get_user_email"'
      />
      <div className="mt-4 mb-2">Description</div>
      <div>
        <textarea
          className="w-full h-24 resize-none border border-gray-600 rounded-md p-2 focus:outline-none focus:border-sky-500 transition-all duration-300"
          placeholder="Enter description of the function. Provide as many details as possible for agent to understand."
          value={functionDescription}
          onChange={(e) => setFunctionDescription(e.target.value)}
        />
      </div>
      <div className="mt-4 mb-2">Select Function Type</div>
      <div className="flex items-center justify-self-center rounded-md overflow-hidden border border-gray-700 mb-4">
        {['webhook', 'web form'].map((type) => (
          <button
            key={type}
            className={clsx(
              'px-4 py-2 cursor-pointer transition-all duration-300 capitalize border-gray-700 not-last:border-r',
              functionType === type ? 'bg-sky-800/20 hover:bg-sky-800/30 text-sky-400' : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-400'
            )}
            onClick={() => setFunctionType(type as 'webhook' | 'web form')}
          >
            {type}
          </button>
        ))}
      </div>
      {functionType === 'webhook' && (
        <div>
          <p className="text-center text-xs mb-4">
            Retrieve or send information to external services via webhooks
          </p>
          <div className="p-4 border border-gray-700">
            <InputBox
              className="my-2"
              label="Webhook URL"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e)}
              placeholder="Enter webhook URL for the agent to call"
            />
            <div className="flex items-center gap-5">
              <div>Method:</div>
              <div className="flex items-center rounded-md overflow-hidden border border-gray-700 my-2">
                {['GET', 'POST'].map((type) => (
                  <button
                    key={type}
                    className={clsx(
                      'px-4 py-2 cursor-pointer transition-all duration-300 capitalize border-gray-700 not-last:border-r',
                      webhookMethod === type ? 'bg-sky-800/20 hover:bg-sky-800/30 text-sky-400' : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-400'
                    )}
                    onClick={() => setWebhookMethod(type as 'GET' | 'POST')}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-white px-5 py-2 flex justify-between items-center rounded-xl my-2">
              <div>
                <div className="text-semibold">
                  Run Function After Call
                </div>
                <div className="text-sm text-gray-400">
                  Set the function to execute after the call ended.
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div>
                  <button
                    className="cursor-pointer rounded hover:bg-gray-700/20 p-2"
                    title="The function will always trigger at the end, even with incomplete data. Ensure your webhook handles these cases. Example use cases: capturing leads to CRM, saving records after the call."
                  >
                    <FaInfoCircle className="text-gray-400" />
                  </button>
                </div>
                <SwtichWithLabel
                  onChange={(e) => setRunFunctionAfterCall(e)}
                  value={runFunctionAfterCall}
                />
              </div>
            </div>
            <div className="my-2">
              <div className="flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
                <button
                  className="cursor-pointer px-3 py-1.5 rounded text-sky-400 hover:bg-sky-400/20 transition-all duration-300 text-nowrap"
                  onClick={() => setWebhookHeaders([...webhookHeaders, { key: '', value: '' }])}
                >
                  Add Header
                </button>
              </div>
            </div>
            <div className="mt-4">
              {webhookHeaders.map((hook, index) => (
                <div key={`hook-${index}`} className="flex items-center justify-between gap-2 my-2">
                  <InputBox
                    onChange={(e) => setWebhookHeaders(webhookHeaders.map((hook, i) => i === index ? { ...hook, key: e } : hook))}
                    value={hook.key}
                    label="Key"
                    placeholder="Ex: Authorization, Content-Ty"
                  />
                  <InputBox
                    onChange={(e) => setWebhookHeaders(webhookHeaders.map((hook, i) => i === index ? { ...hook, value: e } : hook))}
                    value={hook.value}
                    label="Value"
                  />
                  <div>
                    <button
                      className="cursor-pointer rounded text-red-500 hover:bg-red-700/20 p-2 transition-all duration-300"
                      onClick={() => setWebhookHeaders(webhookHeaders.filter((_, i) => i !== index))}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="my-2">
              <div className="flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
                <button
                  className="cursor-pointer px-3 py-1.5 rounded text-sky-400 hover:bg-sky-400/20 transition-all duration-300 text-nowrap"
                  onClick={() => setWebhookParams([...webhookParams, { description: '', name: '', type: 'string', required: false }])}
                >
                  Add Parameter
                </button>
              </div>
            </div>
            <div className="mt-4">
              {webhookParams.map((param, index) => (
                <div key={`hook-${index}`} className="flex flex-col my-2">
                  <div className="flex items-center justify-between gap-3 my-2">
                    <InputBox
                      onChange={(e) => setWebhookHeaders(webhookHeaders.map((hook, i) => i === index ? { ...hook, key: e } : hook))}
                      value={param.name}
                      className="w-full"
                      label="Name"
                      placeholder="Ex: email, phone_number"
                    />
                    <div className="flex flex-col gap-2 w-full">
                      <div>Type</div>
                      <Select
                        options={paramTypeOptions}
                        value={paramTypeOptions.find((option) => option.value === param.type)}
                        onChange={(e) => setWebhookParams(webhookParams.map((param, i) =>
                          i === index ? { ...param, type: (e as SelectOptionType).value as string } : param
                        ))}
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="size-4 cursor-pointer"
                        checked={param.required}
                        onChange={(e) => setWebhookParams(webhookParams.map((param, i) =>
                          i === index ? { ...param, required: e.target.checked } : param
                        ))}
                      />
                      Required
                    </label>
                    <div>
                      <button
                        className="cursor-pointer rounded text-red-500 hover:bg-red-700/20 p-2 transition-all duration-300"
                        onClick={() => setWebhookParams(webhookParams.filter((_, i) => i !== index))}
                      >
                        <FaRegTrashAlt />
                      </button>
                    </div>
                  </div>
                  <div className="mb-2">Description</div>
                  <div>
                    <textarea
                      className="w-full resize-none border border-gray-600 rounded-md p-2 focus:outline-none focus:border-sky-500 transition-all duration-300"
                      placeholder="Enter description of the parameter. Provide as many details as possible for agent to understand."
                      value={param.description}
                      onChange={(e) => setWebhookParams(webhookParams.map((param, i) =>
                        i === index ? { ...param, description: e.target.value } : param
                      ))}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className={clsx(
              "mt-4 shadow-black shadow-sm rounded-md p-4",
              { 'border-t border-gray-700': !showAdvancedConfig }
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
                <div className="mt-4 mb-2">Extra Parameters</div>
                <Select
                  isMulti
                  isSearchable
                  options={extraParamsOptions}
                  value={extraParamsOptions.filter((option) => webhookExtraParams.some((param) => param === option.value))}
                  onChange={(e) => setWebhookExtraParams((e as SelectOptionType[]).map(o => o.value as string))}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {functionType === 'web form' && (
        <div>
          <p className="text-center text-xs mb-4">
            Prompt users to enter information, such as email or phone numbers, through a web form.
          </p>
          <div className="flex gap-3 items-center justify-between">
            <InputBox
              onChange={(e) => setWebFormParam({ ...webFormParam, name: e })}
              value={webFormParam.name}
              className="w-full"
              label="Name"
              placeholder="Ex: email, phone_number"
            />
            <div className="flex flex-col gap-2 w-full">
              <div>Type</div>
              <Select
                options={webFormParamTypeOptions}
                value={webFormParamTypeOptions.find((option) => option.value === webFormParam.type)}
                onChange={(e) =>
                  setWebFormParam({ ...webFormParam, type: (e as SelectOptionType).value as string })
                }
              />
            </div>
          </div>
        </div>
      )}
      <div className="border border-gray-800 px-6 py-4 mt-4 rounded-lg">
        <div className="font-semibold">Pre-Action Phrases</div>
        <p className="text-sm text-gray-400">
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
            <div className="flex flex-col w-full border-b border-gray-600 py-2">
              <div>Disable</div>
              <div className="text-xs text-gray-400">
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
            <div className="flex flex-col w-full border-b border-gray-600 py-2">
              <div>Flexiable</div>
              <div className="text-xs text-gray-400">
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
              <div className="text-xs text-gray-400">
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
                  className="flex items-center gap-2 text-sm border border-gray-700 rounded px-2 py-1"
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
