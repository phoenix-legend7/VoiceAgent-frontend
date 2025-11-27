import { useEffect, useState } from "react"
import { FaArrowLeft, FaCheck, FaRegCopy, FaSlidersH } from "react-icons/fa"
import { Link, useParams } from "react-router-dom"
import { BiWorld } from "react-icons/bi"
import { BsSoundwave } from "react-icons/bs"
import { FaPencil } from "react-icons/fa6"
import { toast } from "react-toastify"

import StatusBadge from "../../components/StatusBadge"
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance"
import { AgentTypeRead } from "../../models/agent"
import { KnowledgeRead } from "../../models/knowledge"
import VoiceType from "../../models/voice"
import Content from "../../Layout/Content"
import NotFound from "../error/404"
import { getLanguage } from "./_utils"
import WebhookSettings from "./WebhookSettings"
import ConversionFlow from "./ConversionFlow"
import AgentPrompt from "./AgentPrompt"
import CallAgent from "./CallAgent"
import AdvancedSettings from "./AdvancedSettings"
import AgentActions from "./AgentActions"
import KnowledgeCard from "./Knowledge"
import ToolCard from "./AgentTools"
import AgentLanguageModal from "./AgentLanguageModal"
import AgentVoiceModal from "./AgentVoiceModal"

const AgentDetails = () => {
  const { id } = useParams()
  const [agent, setAgent] = useState<AgentTypeRead | null>(null)
  const [voices, setVoices] = useState<VoiceType[]>([])
  const [knowledges, setKnowledges] = useState<KnowledgeRead[]>([])
  const [isOverlayShow, setIsOverlayShow] = useState(true)
  const [isEditAgentName, setIsEditAgentName] = useState(false)
  const [isKnowledgeChanged, setIsKnowledgeChanged] = useState(false)
  const [editAgentName, setEditAgentName] = useState('')
  // const [showEditAgentModal, setShowEditAgentModal] = useState(false)
  const [showAgentVoiceModal, setShowAgentVoiceModal] = useState(false)
  const [showAgentLangModal, setShowAgentLangModal] = useState(false)

  useEffect(() => {
    const fetchKnowledges = async () => {
      const response = await axiosInstance.get('/knowledge/list_files')
      setKnowledges(response.data)
    }
    fetchKnowledges()
  }, [isKnowledgeChanged])
  useEffect(() => {
    const fetchVoices = async (lang: string) => {
      const response = await axiosInstance.get(
        '/voice/custom',
         { params: { lang_code: lang } }
      )
      setVoices(response.data)
    }
    if (agent) {
      fetchVoices(agent.config.language || 'en-US')
    }
  }, [agent])
  useEffect(() => {
    setIsOverlayShow(true)
    const fetchAgent = async () => {
      try {
        const response = await axiosInstance.get(`/agent/${id}`)
        const data = response.data
        setAgent(data)
      } catch (error) {
        handleAxiosError('Failed to fetch agent', error)
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
      handleAxiosError('Failed to edit agent name', error)
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
                  <Link to="/agents" className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all duration-300">
                    <FaArrowLeft />
                  </Link>
                  {isEditAgentName ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        className="text-black dark:text-white py-1 max-w-36 sm:max-w-auto border-b border-black dark:border-white focus:border-sky-600 focus:outline-none transition-all duration-300"
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
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 cursor-pointer transition-all duration-300"
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
                <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-800 hidden lg:block" />
                <div className="flex items-center gap-2 text-xs sm:text-sm rounded bg-gray-300 dark:bg-gray-800 p-1">
                  <div className="bg-gray-400 dark:bg-gray-700 px-2 py-1 text-xs rounded">ID</div>
                  <div>{id}</div>
                  <div
                    className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300 transition-all duration-300 p-1"
                    onClick={handleClickCopyId}
                  >
                    <FaRegCopy />
                  </div>
                </div>
              </div>
              <StatusBadge
                status="active"
                colors="border-emerald-500 bg-emerald-200/20 text-emerald-500"
              />
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
                {/* <div className="w-full md:w-1/2 xl:w-1/3 p-1.5">
                  <div
                    className="flex items-center justify-between cursor-pointer rounded-md bg-white dark:bg-gray-900 border dark:border-0 border-gray-300 px-2 py-1"
                    onClick={() => setShowEditAgentModal(true)}
                  >
                    <PiOpenAiLogo className="mr-4 min-w-5 min-h-5" />
                    <div className="grow shrink-0 basis-0 overflow-hidden">
                      <div className="text-sm text-gray-600 dark:text-gray-400 leading-[1.6]">Model</div>
                      <div className="text-xs text-sky-600 dark:text-sky-400 leading-[2.46] uppercase text-nowrap truncate">
                        {agent.config.llm?.model || 'Millis LLM'}
                      </div>
                    </div>
                    <FaSlidersH className="my-4 mx-2 text-gray-600 dark:text-gray-400 min-w-5 min-h-5" />
                  </div>
                </div> */}
                <div className="w-full md:w-1/2 p-1.5">
                  <div
                    className="flex items-center justify-between cursor-pointer rounded-md bg-white dark:bg-gray-900 border dark:border-0 border-gray-300 px-2 py-1"
                    onClick={() => setShowAgentVoiceModal(true)}
                  >
                    <BsSoundwave className="mr-4 min-w-5 min-h-5" />
                    <div className="grow shrink-0 basis-0 overflow-hidden">
                      <div className="text-sm text-gray-600 dark:text-gray-400 leading-[1.6]">Voice</div>
                      <div className="text-xs text-sky-600 dark:text-sky-400 leading-[2.46] uppercase text-nowrap truncate">
                        ({voices.find(voice => voice.voice_id === agent.config.voice.voice_id)?.name || ''}){' '}
                        {agent.config.voice.provider || 'elevenlabs'}
                      </div>
                    </div>
                    <FaSlidersH className="my-4 mx-2 text-gray-600 dark:text-gray-400 min-w-5 min-h-5" />
                  </div>
                </div>
                <div className="w-full md:w-1/2 p-1.5">
                  <div
                    className="flex items-center justify-between cursor-pointer rounded-md bg-white dark:bg-gray-900 border dark:border-0 border-gray-300 px-2 py-1"
                    onClick={() => setShowAgentLangModal(true)}
                  >
                    <BiWorld className="mr-4 min-w-5 min-h-5" />
                    <div className="grow shrink-0 basis-0 overflow-hidden">
                      <div className="text-sm text-gray-600 dark:text-gray-400 leading-[1.6]">Language</div>
                      <div className="text-xs text-sky-600 dark:text-sky-400 leading-[2.46] uppercase text-nowrap truncate">
                        {getLanguage(agent)}
                      </div>
                    </div>
                    <FaSlidersH className="my-4 mx-2 text-gray-600 dark:text-gray-400 min-w-5 min-h-5" />
                  </div>
                </div>
              </div>
              <AgentPrompt
                agent={agent}
                setAgent={setAgent}
                setIsOverlayShow={setIsOverlayShow}
              />
              <KnowledgeCard
                agent={agent}
                isOverlayShow={isOverlayShow}
                knowledges={knowledges}
                setAgent={setAgent}
                setIsChanged={setIsKnowledgeChanged}
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
              <ToolCard
                agent={agent}
                isOverlayShow={isOverlayShow}
                setAgent={setAgent}
                setIsOverlayShow={setIsOverlayShow}
              />
            </div>
          </div>
          {/* <EditAgentModal
            agent={agent}
            isOverlayShow={isOverlayShow}
            showEditAgentModal={showEditAgentModal}
            setAgent={setAgent}
            setIsOverlayShow={setIsOverlayShow}
            setShowEditAgentModal={setShowEditAgentModal}
          /> */}
          <AgentVoiceModal
            agent={agent}
            isOverlayShow={isOverlayShow}
            setAgent={setAgent}
            setIsOverlayShow={setIsOverlayShow}
            setShowAgentVoiceModal={setShowAgentVoiceModal}
            showAgentVoiceModal={showAgentVoiceModal}
            voices={voices}
          />
          <AgentLanguageModal
            agent={agent}
            isOverlayShow={isOverlayShow}
            showAgentLangModal={showAgentLangModal}
            voices={voices}
            setAgent={setAgent}
            setIsOverlayShow={setIsOverlayShow}
            setShowAgentLangModal={setShowAgentLangModal}
            setVoices={setVoices}
          />
        </div>
      ) : (
        <NotFound />
      )}
    </Content>
  )
}

export default AgentDetails
