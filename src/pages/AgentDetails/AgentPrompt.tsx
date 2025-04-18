import { Dispatch, FC, SetStateAction, useMemo, useState } from "react"
import { MdInfoOutline } from "react-icons/md"
import { toast } from "react-toastify"

import axiosInstance from "../../core/axiosInstance"
import Card from "../../library/Card"
import { AgentTypeRead } from "../../models/agent"

interface AgentPromptProps {
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
const AgentPrompt: FC<AgentPromptProps> = ({ agent, setAgent, setIsOverlayShow }) => {
  const [prompt, setPrompt] = useState(agent.config.prompt)

  const isEditted = useMemo(() => {
    return prompt !== agent.config.prompt
  }, [prompt, agent.config.prompt])

  const handleSave = async () => {
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(
        `/agent/${agent.id}`,
        { config: { prompt }, name: agent.name }
      )
      toast.success('Prompt updated successfully')
      setAgent({ ...agent, config: { ...agent.config, prompt } })
    } catch (error) {
      console.error(error)
      toast.error('Failed to update prompt')
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Card title="Agent Prompt" toolbar={isEditted && <ToolBar handleSave={handleSave} />}>
      <div className="relative p-5 bg-black/60">
        <textarea
          className="rounded-md text-gray-400 bg-neutral-800/50 border border-gray-700 min-h-[300px] sm:min-h-[400px] md:min-h-[500px] w-full py-2 px-3 focus:border-green-600 focus:outline-none transition-all duration-300"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        {!!agent.config.custom_llm_websocket && (
          <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center">
            <div className="bg-gray-950 px-4 py-3.5 rounded-md flex justify-center gap-3">
              <div className="text-cyan-400">
                <MdInfoOutline size={22} />
              </div>
              <div>
                <div className="leading-6 mb-1.5">Custom LLM</div>
                <div className="text-sm">
                  {agent.config.custom_llm_websocket}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default AgentPrompt