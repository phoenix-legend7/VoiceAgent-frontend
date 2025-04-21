import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from "react"
import { FaTrash } from "react-icons/fa"
import { toast } from "react-toastify"

import axiosInstance from "../../core/axiosInstance"
import Card from "../../library/Card"
import { InputBox, InputBoxWithUnit, SwtichWithLabel, SwitchWithMessage } from "../../library/FormField"
import { AgentTypeRead } from "../../models/agent"

interface ToolBarProps {
  handleSave: () => Promise<void>
}
interface ConversionFlowProps {
  agent: AgentTypeRead
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}
interface KeyValueType {
  [key: string]: string | number | boolean | null
}

const ChildItem: FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="mt-6">
      <div className="bg-gray-900 text-white shadow-md rounded-md border-l-2 border-gray-800 p-4">
        {children}
      </div>
    </div>
  )
}

const ToolBar: FC<ToolBarProps> = ({ handleSave }) => {
  return (
    <div>
      <button
        className="cursor-pointer bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors duration-300"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  )
}

const ConversionFlow: FC<ConversionFlowProps> = ({ agent, setAgent, setIsOverlayShow }) => {
  const [editData, setEditData] = useState<AgentTypeRead>(agent)
  const [agentMessage, setAgentMessage] = useState<string>('')
  const [agentMessages, setAgentMessages] = useState<string[]>(agent.config.flow?.call_transfer?.messages || [])

  const isEditted = useMemo(() => {
    return JSON.stringify(editData) !== JSON.stringify(agent)
  }, [editData, agent])

  useEffect(() => {
    setEditData({
      ...editData,
      config: {
        ...editData.config,
        flow: {
          ...editData.config.flow || {},
          call_transfer: {
            phone: editData.config.flow?.call_transfer?.phone || '',
            instruction: editData.config.flow?.call_transfer?.instruction || null,
            messages: agentMessages
          }
        }
      }
    })
  }, [agentMessages])

  const handleSave = async () => {
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(
        `/agent/${agent.id}`,
        { config: { flow: editData.config.flow }, name: editData.name }
      )
      toast.success('Agent updated successfully')
      setAgent(editData)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update agent')
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleUpdateData = (
    key: keyof AgentTypeRead['config']['flow'],
    value: boolean,
    defaultValue?: KeyValueType | null
  ) => {
    const flow = editData.config.flow || {}
    if (defaultValue) {
      setEditData({
        ...editData,
        config: {
          ...editData.config,
          flow: { ...flow, [key]: value ? agent.config.flow?.[key] || defaultValue : null }
        }
      })
    } else {
      setEditData({
        ...editData,
        config: {
          ...editData.config,
          flow: { ...flow, [key]: value }
        }
      })
    }
  }
  const handleUpdateSubData = (
    key: keyof AgentTypeRead['config']['flow'],
    subKey: string,
    value: string | number | boolean | null | string[]
  ) => {
    if (key === 'user_start_first') return
    const flow = editData.config.flow || {}
    if (!flow[key]) return
    setEditData({
      ...editData,
      config: {
        ...editData.config,
        flow: { ...flow, [key]: { ...flow[key], [subKey]: value } }
      }
    })
  }
  const handleAddAgentMessage = () => {
    if (agentMessage.trim() === '') return
    setAgentMessages([...agentMessages, agentMessage])
    setAgentMessage('')
  }
  const handleRemoveAgentMessage = (index: number) => {
    setAgentMessages(agentMessages.filter((_, i) => i !== index))
  }

  return (
    <Card title="Conversion Flow" toolbar={isEditted && <ToolBar handleSave={handleSave} />}>
      <div className="p-6 min-w-80">
        <SwtichWithLabel
          label="User starts first:"
          value={!!editData.config.flow?.user_start_first}
          onChange={(value) => handleUpdateData('user_start_first', value)}
        />
        <p className="mt-2 text-sm text-gray-400">
          Agent will wait for user to start first.
        </p>
        <InputBox
          label="Greeting Line"
          className="mt-6"
          value={editData.config.first_message || ''}
          onChange={(value) => {
            setEditData({
              ...editData,
              config: { ...editData.config, first_message: value },
            })
          }}
          disabled={!!editData.config.flow?.user_start_first}
          placeholder="Welcome! How can I help you?"
        />
        <p className="mt-2 text-sm text-gray-400">
          Set the first message the agent says to start the conversation. Leave blank to disable.
        </p>
        <SwtichWithLabel
          label="Response Delay:"
          className="mt-6"
          value={!!editData.config.flow?.response_delay}
          onChange={(value) => handleUpdateData('response_delay', value, { generic_delay: 0, number_input_delay: 0 })}
        />
        {!!editData.config.flow?.response_delay && (
          <ChildItem>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="p-4 leading-6">
                    <div className="font-bold">Generic Delay:</div>
                    Set the default time the agent waits before responding to the user.
                  </td>
                  <td className="p-4 leading-6">
                    <InputBoxWithUnit
                      unit="milliseconds"
                      value={editData.config.flow?.response_delay?.generic_delay || 0}
                      onChange={(value) => handleUpdateSubData('response_delay', 'generic_delay', value)}
                    />
                  </td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="p-4 leading-6">
                    <div className="font-bold">Number input delay:</div>
                    Set the extra wait time when the user is providing numeric input, like an ID or phone number.
                  </td>
                  <td className="p-4 leading-6">
                    <InputBoxWithUnit
                      unit="milliseconds"
                      value={editData.config.flow?.response_delay?.number_input_delay || 0}
                      onChange={(value) => handleUpdateSubData('response_delay', 'number_input_delay', value)}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </ChildItem>
        )}
        <SwtichWithLabel
          label="Inactivity Handling:"
          className="mt-6"
          value={!!editData.config.flow?.inactivity_handling}
          onChange={(value) => handleUpdateData('inactivity_handling', value)}
        />
        <p className="mt-2 text-sm text-gray-400">
          Configure the agent to prompt the user after a period of inactivity, ensuring the user is still engaged.
        </p>
        {!!editData.config.flow?.inactivity_handling && (
          <ChildItem>
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="p-4 leading-6">
                    <div className="font-bold">Idle time:</div>
                    How long to wait for user input before considering them inactive.
                  </td>
                  <td className="p-4 leading-6">
                    <InputBoxWithUnit
                      unit="seconds"
                      value={editData.config.flow?.inactivity_handling?.idle_time || 0}
                      onChange={(value) => handleUpdateSubData('inactivity_handling', 'idle_time', value)}
                    />
                  </td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="p-4 leading-6">
                    <div className="font-bold">Message:</div>
                    Message to send when user is inactive.
                  </td>
                  <td className="p-4 leading-6">
                    <InputBox
                      value={editData.config.flow?.inactivity_handling?.message}
                      onChange={(value) => handleUpdateSubData('inactivity_handling', 'message', value)}
                      inputClassName="bg-transparent"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </ChildItem>
        )}
        <SwtichWithLabel
          label="Agent can terminate call:"
          className="mt-6"
          value={!!editData.config.flow?.agent_terminate_call}
          onChange={(value) => handleUpdateData('agent_terminate_call', value)}
          badgeText="Beta"
        />
        <p className="mt-2 text-sm text-gray-400">
          Agent will be able to decide to terminate the call by itself.<br />
          Use with care: It is recommended to only use this feature with larger language models like gpt-4o.
        </p>
        {!!editData.config.flow?.agent_terminate_call && (
          <ChildItem>
            <InputBox
              label="Custom instruction [Optional]"
              inputClassName="bg-transparent"
              value={editData.config.flow?.agent_terminate_call?.instruction || ''}
              onChange={(value) => handleUpdateSubData('agent_terminate_call', 'instruction', value)}
              placeholder="Only terminate the call when ..."
            />
            <p className="mt-2 text-sm text-gray-400">
              Set the custom instruction for the agent to determine when to terminate the call.
            </p>
            <InputBox
              label="Termination message"
              className="mt-2"
              inputClassName="bg-transparent"
              value={editData.config.flow?.agent_terminate_call?.messages?.[0] || ''}
              onChange={(value) => handleUpdateSubData('agent_terminate_call', 'messages', [value])}
              placeholder="I.e Call ended. Goodbye!"
            />
            <p className="mt-2 text-sm text-gray-400">
              Set the message the agent will say when it decides to terminate the call.
            </p>
          </ChildItem>
        )}
        <SwtichWithLabel
          label="Voicemail Detection:"
          className="mt-6"
          value={!!editData.config.flow?.voicemail}
          onChange={(value) => handleUpdateData('voicemail', value)}
          badgeText="Beta"
        />
        <p className="mt-2 text-sm text-gray-400">
          Agent will be able to detect voicemail and handle it.<br />
          Warning: The feature only works with Twilio and Plivo providers.
        </p>
        {!!editData.config.flow?.voicemail && (
          <ChildItem>
            <SwitchWithMessage
              label="Action:"
              value={editData.config.flow?.voicemail?.action}
              onChange={(value) => handleUpdateSubData('voicemail', 'action', value as 'hangup' | 'message')}
              messages={[
                { label: 'Hangup', value: 'hangup' },
                { label: 'Message', value: 'message' },
              ]}
            />
            <InputBox
              label="Voicemail message"
              className="mt-2"
              inputClassName="bg-transparent"
              value={editData.config.flow?.voicemail?.message || ''}
              onChange={(value) => handleUpdateSubData('voicemail', 'message', value)}
              disabled={editData.config.flow?.voicemail?.action === 'hangup'}
              placeholder="Please call back at 1234567890"
            />
            <p className="mt-2 text-sm text-gray-400">
              Set the message the agent will say when it detects voicemail.
            </p>
            <SwtichWithLabel
              label="Continue on voice activity:"
              className="mt-2"
              value={editData.config.flow?.voicemail?.continue_on_voice_activity || false}
              onChange={(value) => handleUpdateSubData('voicemail', 'continue_on_voice_activity', value)}
              disabled={editData.config.flow?.voicemail?.action === 'hangup'}
            />
            <p className="mt-2 text-sm text-gray-400">
              Allows the agent to pause the voicemail message and engage in conversation if it detects voice activity during playback.
            </p>
          </ChildItem>
        )}
        <SwtichWithLabel
          label="Call Transfer:"
          className="mt-6"
          value={!!editData.config.flow?.call_transfer}
          onChange={(value) => handleUpdateData('call_transfer', value)}
          badgeText="Beta"
        />
        <p className="mt-2 text-sm text-gray-400">
          Agent will be able to transfer calls to human agents.<br />
          Warning: The feature only works with Twilio phone numbers.
        </p>
        {!!editData.config.flow?.call_transfer && (
          <ChildItem>
            <InputBox
              label="Transfer to phone number"
              inputClassName="bg-transparent"
              onChange={(value) => handleUpdateSubData('call_transfer', 'phone', value)}
              value={editData.config.flow?.call_transfer?.phone || ''}
              placeholder="+1234567890"
            />
            <p className="mt-2 text-sm text-gray-400">
              Set the phone number the agent will transfer the call to when it decides to transfer the call.
            </p>
            <InputBox
              label="Custom instruction [Optional]"
              inputClassName="bg-transparent"
              onChange={(value) => handleUpdateSubData('call_transfer', 'instruction', value)}
              value={editData.config.flow?.call_transfer?.instruction || ''}
              placeholder="Only transfer the call when ..."
            />
            <p className="mt-2 text-sm text-gray-400">
              Set the custom instruction for the agent to determine when to transfer the call.
            </p>
            <InputBox
              label="Agent messages"
              inputClassName="bg-transparent"
              onChange={(value) => setAgentMessage(value)}
              onBlur={handleAddAgentMessage}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'NumpadEnter') {
                  handleAddAgentMessage()
                }
              }}
              value={agentMessage}
              placeholder="Enter messages separated by enter key"
            />
            <p className="mt-2 text-sm text-gray-400">
              Set the messages the agent will say while transfering the call.
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {agentMessages.map((message, index) => (
                <div
                  key={index}
                  className="bg-gray-950/20 text-white shadow-md rounded-md border border-neutral-500 px-3 py-1 flex items-center gap-2"
                >
                  <div className="text-sm">{message}</div>
                  <button
                    type="button"
                    className="cursor-pointer text-gray-400 hover:text-gray-300 transition-colors duration-300"
                    onClick={() => handleRemoveAgentMessage(index)}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </ChildItem>
        )}
        <SwtichWithLabel
          label="DTMF Dial:"
          className="mt-6"
          value={!!editData.config.flow?.dtmf_dial}
          onChange={(value) => handleUpdateData('dtmf_dial', value)}
          badgeText="Beta"
        />
        <p className="mt-2 text-sm text-gray-400">
          Agent will be able to dial dtmf tones to navigate through IVR, voicemail systems, etc.
        </p>
        {!!editData.config.flow?.dtmf_dial && (
          <ChildItem>
            <InputBox
              label="Custom instruction [Optional]"
              inputClassName="bg-transparent"
              onChange={(value) => handleUpdateSubData('dtmf_dial', 'instruction', value)}
              value={editData.config.flow?.dtmf_dial?.instruction || ''}
              placeholder="Use the function to dial dtmf tones to navigate to a representative ..."
            />
            <p className="mt-2 text-sm text-gray-400">
              Set the phone number the agent will transfer the call to when it decides to transfer the call.
            </p>
          </ChildItem>
        )}
      </div>
    </Card>
  )
}

export default ConversionFlow
