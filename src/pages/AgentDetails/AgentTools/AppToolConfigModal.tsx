import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import appTools from "../../../consts/appTools"
import axiosInstance from "../../../core/axiosInstance"
import { InputBox } from "../../../library/FormField"
import Modal from "../../../library/ModalProvider"
import Select from "../../../library/Select"
import { AgentTypeRead } from "../../../models/agent"
import { SelectOptionType } from "../../../models/common"

const contactMethodOptions = [
  { label: 'Phone', value: 'phone' },
  { label: 'Email', value: 'email' }
]

interface AppToolConfigModalProps {
  agent: AgentTypeRead
  isOverlayShow: boolean
  selectedAppTool: string | null
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setSelectedAppTool: Dispatch<SetStateAction<string | null>>
}

const AppToolConfigModal: FC<AppToolConfigModalProps> = ({
  agent,
  isOverlayShow,
  selectedAppTool,
  setAgent,
  setIsOverlayShow,
  setSelectedAppTool,
}) => {
  const [apiKey, setApiKey] = useState<string>('')
  const [eventTypeId, setEventTypeId] = useState<string>('')
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email')

  const originAppTool = useMemo(() =>
    agent.config.app_functions?.find((appTool) => appTool.name === selectedAppTool),
    [agent.config.app_functions, selectedAppTool]
  )
  const onClose = () => {
    setSelectedAppTool(null)
  }
  const handleCreate = async () => {
    if (!selectedAppTool) return;
    if (!apiKey || !eventTypeId) {
      toast.warning('API Key and Event Type ID are required')
      return
    }
    const tools = agent.config.app_functions || []
    if (originAppTool) {
      const tool = tools.find((tool) => tool.name === selectedAppTool)
      if (tool) {
        if (!tool.credentials) tool.credentials = {}
        tool.credentials.api_key = apiKey
        tool.credentials.event_type_id = eventTypeId
      }
    } else {
      tools.push({
        name: selectedAppTool,
        credentials: {
          api_key: apiKey,
          event_type_id: eventTypeId,
          contact_method: contactMethod
        }
      })
    }
    const editData = { 
      name: agent.name,
      config: { app_functions: tools }
    }
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(`/agent/${agent.id}`, editData)
      toast.success('Function created')
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          app_functions: tools,
        }
      })
      setSelectedAppTool(null)
    } catch (error) {
      toast.error('Failed to create function')
    } finally {
      setIsOverlayShow(false)
    }
  }

  useEffect(() => {
    if (originAppTool) {
      setApiKey(originAppTool.credentials?.api_key || '')
      setEventTypeId(originAppTool.credentials?.event_type_id || '')
      setContactMethod((originAppTool.credentials?.contact_method || 'email') as 'email' | 'phone')
    }
  }, [originAppTool])

  return (
    <Modal
      isOpen={!!selectedAppTool}
      isLoading={isOverlayShow}
      onClose={onClose}
      onOK={handleCreate}
      title="Configure App Function"
      okBtnLabel={originAppTool ? 'Update' : 'Create'}
    >
      <div className="flex flex-col gap-2 my-2 text-gray-500 font-semibold">
        <div>Name</div>
        <div className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-800">{selectedAppTool}</div>
      </div>
      <div className="flex flex-col gap-2 my-2 text-gray-500 font-semibold">
        <div>Description</div>
        <div className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-800">
          {appTools.find((appTool) => appTool.name === selectedAppTool)?.description}
        </div>
      </div>
      <div className="flex flex-col gap-2 my-2 text-gray-500 font-semibold">
        <div>App</div>
        <div className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-800">cal.com</div>
      </div>
      <InputBox
        value={apiKey}
        label="API Key"
        onChange={(e) => setApiKey(e)}
        className="my-2"
      />
      <InputBox
        value={eventTypeId}
        label="Event Type ID"
        onChange={(e) => setEventTypeId(e)}
        className="my-2"
      />
      {selectedAppTool === 'book_meeting_slot' && (
        <div>
          <div className="flex flex-col gap-2 my-2">
            <div>User Contact Method</div>
            <Select
              options={contactMethodOptions}
              value={contactMethodOptions.find((option) => option.value === contactMethod)}
              onChange={(e) => setContactMethod((e as SelectOptionType).value as 'email' | 'phone')}
              className="w-full"
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 my-2">
            Choose preferred contact method during scheduling meeting, either a phone number or an email address.
          </p>
        </div>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-400 my-2">
        Some functions may require the agent timezone to be set. Make sure to set it.
      </p>
    </Modal>
  )
}

export default AppToolConfigModal
