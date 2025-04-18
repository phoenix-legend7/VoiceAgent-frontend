import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

import axiosInstance from "../../core/axiosInstance"
import Card from "../../library/Card"
import { InputBox } from "../../library/FormField"
import { AgentTypeRead } from "../../models/agent"

interface WebhookSettingsProps {
  agent: AgentTypeRead
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}
interface ToolBarProps {
  handleSave: () => Promise<void>
}

const ToolBar: FC<ToolBarProps> = ({ handleSave }) => {
  return (
    <div>
      <button
        className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  )
}

const WebhookSettings: FC<WebhookSettingsProps> = ({ agent, setAgent, setIsOverlayShow }) => {
  const [prefetchDataWebhook, setPrefetchDataWebhook] = useState<string>('')
  const [endOfCallWebhook, setEndOfCallWebhook] = useState<string>('')

  useEffect(() => {
    const extraPromptWebhook = agent.config.extra_prompt_webhook
    const sessionDataWebhook = agent.config.session_data_webhook
    if (extraPromptWebhook) {
      setPrefetchDataWebhook(typeof extraPromptWebhook === 'string' ? extraPromptWebhook : extraPromptWebhook.url)
    }
    if (sessionDataWebhook) {
      setEndOfCallWebhook(typeof sessionDataWebhook === 'string' ? sessionDataWebhook : sessionDataWebhook.url)
    }
  }, [agent])

  const isEditted = useMemo(() => {
    return prefetchDataWebhook !== agent.config.extra_prompt_webhook || endOfCallWebhook !== agent.config.session_data_webhook
  }, [prefetchDataWebhook, endOfCallWebhook, agent.config.extra_prompt_webhook, agent.config.session_data_webhook])

  const handleSave = async () => {
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(
        `/agent/${agent.id}`,
        {
          config: {
            extra_prompt_webhook: prefetchDataWebhook,
            session_data_webhook: endOfCallWebhook
          },
          name: agent.name
        }
      )
      toast.success('Agent updated successfully')
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          extra_prompt_webhook: prefetchDataWebhook,
          session_data_webhook: endOfCallWebhook
        }
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to update agent')
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Card title="Webhook Settings" toolbar={isEditted && <ToolBar handleSave={handleSave} />}>
      <div className="p-6">
        <InputBox
          label="Prefetch Data Webhook"
          value={prefetchDataWebhook}
          onChange={setPrefetchDataWebhook}
          placeholder="https://example.com/prefetch_data_webhook"
        />
        <p className="mt-2 text-xs text-gray-400">
          Set a webhook URL for prefetching data before the conversation starts. The webhook will be called with a GET request. &nbsp;&nbsp;
          <a href="https://docs.millis.ai/core-concepts/webhooks#1-prefetch-data-webhook" className="text-blue-700 underline decoration-1">
            Learn more
          </a>
        </p>
        <hr className="my-4 text-gray-700" />
        <InputBox
          label="End-of-Call Webhook"
          value={endOfCallWebhook}
          onChange={setEndOfCallWebhook}
          placeholder="https://example.com/session_data_webhook"
        />
        <p className="mt-2 text-xs text-gray-400">
          Set a webhook URL to receive conversation data after each session. The webhook will be called with a POST request. &nbsp;&nbsp;
          <a href="https://docs.millis.ai/core-concepts/webhooks#2-end-of-call-webhook" className="text-blue-700 underline decoration-1">
            Learn more
          </a>
        </p>
      </div>
    </Card>
  )
}

export default WebhookSettings
