import { useEffect, useState } from "react"
import { FaArrowLeft, FaCheck, FaRegCopy, FaSlidersH } from "react-icons/fa"
import { Link, useParams } from "react-router-dom"
import { BiWorld } from "react-icons/bi"
import { BsSoundwave } from "react-icons/bs"
import { FaPencil } from "react-icons/fa6"
import { PiOpenAiLogo } from "react-icons/pi"
import { toast } from "react-toastify"

import axiosInstance from "../../core/axiosInstance"
import { AgentTypeRead } from "../../models/agent"
import VoiceType from "../../models/voice"
import Content from "../../Layout/Content"
import NotFound from "../error/404"
import WebhookSettings from "./WebhookSettings"
import ConversionFlow from "./ConversionFlow"
import AgentPrompt from "./AgentPrompt"
import CallAgent from "./CallAgent"
import AdvancedSettings from "./AdvancedSettings"
import AgentActions from "./AgentActions"
import KnowledgeCard from "./Knowledge"

const AgentDetails = () => {
  const { id } = useParams()
  const [agent, setAgent] = useState<AgentTypeRead | null>(null)
  const [voices, setVoices] = useState<VoiceType[]>([])
  const [isOverlayShow, setIsOverlayShow] = useState(true)
  const [isEditAgentName, setIsEditAgentName] = useState(false)
  const [editAgentName, setEditAgentName] = useState('')

  useEffect(() => {
    const fetchVoices = async () => {
      const response = await axiosInstance.get('/voice/custom', { params: { lang_code: 'en-US' } })
      setVoices(response.data)
    }
    fetchVoices()
  }, [])
  useEffect(() => {
    console.log(voices)
  }, [voices])
  useEffect(() => {
    setIsOverlayShow(true)
    const fetchAgent = async () => {
      try {
        const response = await axiosInstance.get(`/agent/${id}`)
        const data = response.data
        setAgent(data)
      } catch (error) {
        console.error(error)
        toast.error(`Failed to fetch agent: ${error}`)
      } finally {
        setIsOverlayShow(false)
      }
    }
    fetchAgent()
  }, [id])

  const handleEditAgentName = async () => {
    if (!agent) return
    try {
      setIsOverlayShow(true)
      await axiosInstance.put(`/agent/${id}`, { name: editAgentName, config: {} })
      setAgent({
        ...agent,
        name: editAgentName
      })
    } catch (error) {
      console.error(error)
      toast.error(`Failed to edit agent name: ${error}`)
    } finally {
      setIsOverlayShow(false)
      setIsEditAgentName(false)
      setEditAgentName('')
    }
  }
  const handleClickCopyId = () => {
    if (!id) return
    navigator.clipboard.writeText(id)
    toast.success('Copied to clipboard')
  }

  return (
    <Content isOverlayShown={isOverlayShow}>
      {agent ? (
        <div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col lg:flex-row items-center gap-4">
                <div className="flex gap-4 items-center">
                  <Link to="/agents" className="text-gray-400 hover:text-gray-300 transition-all duration-300">
                    <FaArrowLeft />
                  </Link>
                  {isEditAgentName ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        className="text-white py-1 max-w-36 sm:max-w-auto border-b border-white focus:border-sky-600 focus:outline-none transition-all duration-300"
                        value={editAgentName}
                        onChange={(e) => setEditAgentName(e.target.value)}
                      />
                      <button
                        className="p-3 rounded-md cursor-pointer bg-transparent text-sky-600 hover:bg-sky-500/10 transition-all duration-300"
                        onClick={handleEditAgentName}
                      >
                        <FaCheck />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-2xl font-semibold">{agent.name}</h2>
                      <button
                        className="text-gray-400 hover:text-gray-300 cursor-pointer transition-all duration-300"
                        onClick={() => {
                          setIsEditAgentName(true)
                          setEditAgentName(agent.name)
                        }}
                      >
                        <FaPencil />
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-0.5 h-full bg-gray-800 hidden lg:block" />
                <div className="flex items-center gap-2 text-xs sm:text-sm rounded bg-gray-800 p-1">
                  <div className="bg-gray-700 px-2 py-1 text-xs rounded">ID</div>
                  <div>{id}</div>
                  <div
                    className="cursor-pointer text-gray-400 hover:text-gray-300 transition-all duration-300 p-1"
                    onClick={handleClickCopyId}
                  >
                    <FaRegCopy />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Active
              </div>
            </div>
            <div>
              <AgentActions
                agent={agent}
                isOverlayShow={isOverlayShow}
                setAgent={setAgent}
                setIsOverlayShow={setIsOverlayShow}
              />
            </div>
          </div>
          <div className="flex flex-wrap mt-8">
            <div className="p-3 w-full xl:w-2/3">
              <div className="flex flex-wrap items-center justify-between">
                <div className="w-full md:w-1/2 xl:w-1/3 p-1.5">
                  <div className="flex items-center justify-between cursor-pointer rounded-md bg-gray-900 px-2 py-1">
                    <PiOpenAiLogo size={20} className="mr-4" />
                    <div className="grow">
                      <div className="text-sm text-gray-400 leading-[1.6]">Model</div>
                      <div className="text-xs text-sky-400 leading-[2.46] uppercase text-nowrap">
                        {agent.config.llm?.model || 'Millis LLM'}
                      </div>
                    </div>
                    <FaSlidersH size={20} className="my-4 mx-2 text-gray-400" />
                  </div>
                </div>
                <div className="w-full md:w-1/2 xl:w-1/3 p-1.5">
                  <div className="flex items-center justify-between cursor-pointer rounded-md bg-gray-900 px-2 py-1">
                    <BsSoundwave size={20} className="mr-4" />
                    <div className="grow">
                      <div className="text-sm text-gray-400 leading-[1.6]">Voice</div>
                      <div className="text-xs text-sky-400 leading-[2.46] uppercase text-nowrap">
                        (Rachel) {agent.config.voice.provider || 'elevenlabs'}
                      </div>
                    </div>
                    <FaSlidersH size={20} className="my-4 mx-2 text-gray-400" />
                  </div>
                </div>
                <div className="w-full md:w-1/2 xl:w-1/3 p-1.5">
                  <div className="flex items-center justify-between cursor-pointer rounded-md bg-gray-900 px-2 py-1">
                    <BiWorld size={20} className="mr-4" />
                    <div className="grow">
                      <div className="text-sm text-gray-400 leading-[1.6]">Language</div>
                      <div className="text-xs text-sky-400 leading-[2.46] uppercase text-nowrap">
                        {agent.config.language || 'English'}
                      </div>
                    </div>
                    <FaSlidersH size={20} className="my-4 mx-2 text-gray-400" />
                  </div>
                </div>
              </div>
              <AgentPrompt
                agent={agent}
                setAgent={setAgent}
                setIsOverlayShow={setIsOverlayShow}
              />
              <WebhookSettings
                agent={agent}
                setAgent={setAgent}
                setIsOverlayShow={setIsOverlayShow}
              />
              <ConversionFlow
                agent={agent}
                setAgent={setAgent}
                setIsOverlayShow={setIsOverlayShow}
              />
              <AdvancedSettings
                agent={agent}
                setAgent={setAgent}
                setIsOverlayShow={setIsOverlayShow}
              />
            </div>
            <div className="p-3 w-full xl:w-1/3">
              <CallAgent agent={agent} />
              <KnowledgeCard
                agent={agent}
                setAgent={setAgent}
                setIsOverlayShow={setIsOverlayShow}
              />
            </div>
          </div>
        </div>
      ) : (
        <NotFound />
      )}
    </Content>
  )
}

export default AgentDetails
