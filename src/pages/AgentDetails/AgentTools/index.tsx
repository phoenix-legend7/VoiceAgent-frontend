import { Dispatch, FC, SetStateAction, useState } from "react"
import { AiOutlineProduct } from "react-icons/ai"
import { FaEdit, FaPlus, FaRegCalendarPlus, FaRegTrashAlt } from "react-icons/fa"
import { toast } from "react-toastify"
import axiosInstance, { handleAxiosError } from "../../../core/axiosInstance"
import Card from "../../../library/Card"
import { AgentTypeRead } from "../../../models/agent"
import AppToolModal from "./AppToolModal"
import AppToolConfigModal from "./AppToolConfigModal"
import ToolModal from "./ToolModal"

interface Props {
  agent: AgentTypeRead
  isOverlayShow: boolean
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}

const ToolCard: FC<Props> = ({ agent, isOverlayShow, setAgent, setIsOverlayShow }) => {
  const [showToolModal, setShowToolModal] = useState(false)
  const [showAppToolModal, setShowAppToolModal] = useState(false)
  const [selectedTool, setSelectedTool] = useState<{ name: string, type: string } | null>(null)
  const [selectedAppTool, setSelectedAppTool] = useState<string | null>(null)

  const handleDeleteTool = async (name: string) => {
    const tools = agent.config.tools?.filter((tool) => tool.name !== name)
    const editData = {
      name: agent.name,
      config: { tools }
    }
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(`/agent/${agent.id}`, editData)
      toast.success('Function deleted')
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          tools
        }
      })
    } catch (error) {
      handleAxiosError('Failed to delte function', error)
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleDeleteMillisFunc = async (name: string) => {
    const millisFunctions = agent.config.millis_functions?.filter((tool) => tool.name !== name)
    const editData = {
      name: agent.name,
      config: { millis_functions: millisFunctions }
    }
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(`/agent/${agent.id}`, editData)
      toast.success('Function deleted')
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          millis_functions: millisFunctions,
        }
      })
    } catch (error) {
      handleAxiosError('Failed to delete function', error)
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleDeleteAppFunc = async (name: string) => {
    const appFunctions = agent.config.app_functions?.filter((tool) => tool.name !== name)
    const editData = {
      name: agent.name,
      config: { app_functions: appFunctions }
    }
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(`/agent/${agent.id}`, editData)
      toast.success('Function deleted')
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          app_functions: appFunctions,
        }
      })
    } catch (error) {
      handleAxiosError('Failed to delete function', error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <>
      <Card title="Tools" className="mt-6" icon={<AiOutlineProduct />}>
        {(!agent.config.tools?.length && !agent.config.millis_functions?.length && !agent.config.app_functions?.length) && (
          <div className="p-6 m-4 mt-8">
            <p className="text-gray-400 text-sm">
              Connect tools to let agent take action with external systems.
            </p>
            <button
              className="cursor-pointer flex justify-self-center items-center gap-2 border border-sky-600 text-sky-600 mt-4 px-4 py-1.5 min-w-20 rounded-md hover:border-sky-400 hover:text-sky-400 transition-colors duration-300"
              onClick={() => setShowToolModal(true)}
            >
              <FaPlus />
              Add Tool
            </button>
          </div>
        )}
        {(!!agent.config.millis_functions?.length || !!agent.config.tools?.length || !!agent.config.app_functions?.length) && (
          <div className="py-2">
            {agent.config.tools?.map((tool, index) => (
              <div
                key={`tool-${index}`}
                className="flex items-center justify-between gap-2 px-4 py-1"
              >
                <div className="truncate text-nowrap" style={{ width: 'calc(100% - 64px)' }}>
                  {tool.name}
                </div>
                <div className="flex items-center">
                  <button
                    className="cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                    onClick={() => {
                      setSelectedTool({ name: tool.name, type: 'webhook' })
                      setShowToolModal(true)
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                    onClick={() => handleDeleteTool(tool.name)}
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </div>
            ))}
            {agent.config.millis_functions?.map((func, index) => (
              <div
                key={`func-${index}`}
                className="flex items-center justify-between gap-2 px-4 py-1"
              >
                <div style={{ width: 'calc(100% - 64px)' }}>
                  <div className="truncate text-nowrap">
                    {func.name}
                  </div>
                  <div className="text-gray-400 text-sm">{func.type}</div>
                </div>
                <div className="flex items-center">
                  <button
                    className="cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                    onClick={() => {
                      setSelectedTool({ name: func.name, type: 'webform' })
                      setShowToolModal(true)
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                    onClick={() => handleDeleteMillisFunc(func.name)}
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </div>
            ))}
            {agent.config.app_functions?.map((func, index) => (
              <div
                key={`func-${index}`}
                className="flex items-center justify-between gap-2 px-4 py-1"
              >
                <div style={{ width: 'calc(100% - 64px)' }}>
                  <div className="truncate text-nowrap">
                    {func.name}
                  </div>
                  <div className="text-gray-400 text-sm">cal.com</div>
                </div>
                <div className="flex items-center">
                  <button
                    className="cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                    onClick={() => {
                      setShowAppToolModal(true)
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                    onClick={() => handleDeleteAppFunc(func.name)}
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <hr className="text-gray-700 my-2" />
        <div className="my-2">
          <div
            className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 transition-all duration-300"
            onClick={() => setShowToolModal(true)}
          >
            <FaPlus />
            Add Tool
          </div>
          <div
            className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-700 transition-all duration-300"
            onClick={() => setShowAppToolModal(true)}
          >
            <FaRegCalendarPlus />
            Add App Tool (cal.com)
          </div>
        </div>
      </Card>
      <AppToolModal
        isOverlayShow={isOverlayShow}
        showModal={showAppToolModal}
        setSelectedAppTool={setSelectedAppTool}
        setShowModal={setShowAppToolModal}
      />
      <ToolModal
        agent={agent}
        isOverlayShow={isOverlayShow}
        selectedTool={selectedTool}
        showModal={showToolModal}
        setAgent={setAgent}
        setIsOverlayShow={setIsOverlayShow}
        setSelectedTool={setSelectedTool}
        setShowModal={setShowToolModal}
      />
      <AppToolConfigModal
        agent={agent}
        isOverlayShow={isOverlayShow}
        selectedAppTool={selectedAppTool}
        setAgent={setAgent}
        setIsOverlayShow={setIsOverlayShow}
        setSelectedAppTool={setSelectedAppTool}
      />
    </>
  )
}

export default ToolCard
