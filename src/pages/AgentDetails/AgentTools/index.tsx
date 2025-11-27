import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { AiOutlineProduct } from "react-icons/ai"
import { FaEdit, FaPlus, FaRegCalendarPlus, FaRegTrashAlt } from "react-icons/fa"
import { toast } from "react-toastify"
import { Cog } from "lucide-react"
import axiosInstance, { handleAxiosError } from "../../../core/axiosInstance"
import Card from "../../../library/Card"
import { AgentTypeRead, ToolType } from "../../../models/agent"
import { ConnectedTool, tools as totalTools } from "../../Settings/Tools"
import ToolModal from "./ToolModal"
import CalendarSelectionModal from "./CalendarSelectionModal"
import { CalendarConfig } from "../../Settings/Calendars"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip"

const renderToolIcon = (iconProp: any) => {
  if (!iconProp) return <Cog className="size-5" />;
  if (typeof iconProp === 'string') {
    return (
      <img
        src={iconProp}
        alt="tool icon"
        className="size-5"
        style={{ display: 'block' }}
        onError={e => { (e.target as HTMLImageElement).src = ""; }}
      />
    )
  }
  const Icon = iconProp;
  return <Icon className="size-5" />;
};

interface Props {
  agent: AgentTypeRead
  isOverlayShow: boolean
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}

const ToolCard: FC<Props> = ({ agent, isOverlayShow, setAgent, setIsOverlayShow }) => {
  const [showToolModal, setShowToolModal] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  // const [selectedTool, setSelectedTool] = useState<{ name: string, type: string } | null>(null)
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null)
  const [connectedTools, setConnectedTools] = useState<ConnectedTool[]>([])
  const [calendars, setCalendars] = useState<CalendarConfig[]>([])

  useEffect(() => {
    const fetchConnectedTools = async () => {
      try {
        const response = await axiosInstance.get("/tools");
        setConnectedTools(response.data || []);
      } catch (error) {
        console.error('Failed to fetch tools:', error);
        toast.error(`Failed to fetch tools: ${(error as Error).message}`);
      }
    };
    const fetchCalendars = async () => {
      try {
        const response = await axiosInstance.get("/calendars");
        setCalendars(response.data || []);
      } catch (error) {
        console.error('Failed to fetch calendars:', error);
      }
    };
    fetchConnectedTools();
    fetchCalendars();
  }, []);

  const handleDeleteTool = async (id: string) => {
    const tools = agent.tools?.filter((tool) => tool.id !== id)
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(`/agent/${agent.id}/tools`, tools)
      toast.success('Function deleted')
      setAgent({ ...agent, tools })
    } catch (error) {
      handleAxiosError('Failed to delete function', error)
    } finally {
      setIsOverlayShow(false)
    }
  }
  // const handleDeleteTool = async (name: string) => {
  //   const tools = agent.config.tools?.filter((tool) => tool.name !== name)
  //   const editData = {
  //     name: agent.name,
  //     config: { tools }
  //   }
  //   setIsOverlayShow(true)
  //   try {
  //     await axiosInstance.put(`/agent/${agent.id}`, editData)
  //     toast.success('Function deleted')
  //     setAgent({
  //       ...agent,
  //       config: {
  //         ...agent.config,
  //         tools
  //       }
  //     })
  //   } catch (error) {
  //     handleAxiosError('Failed to delte function', error)
  //   } finally {
  //     setIsOverlayShow(false)
  //   }
  // }
  // const handleDeleteMillisFunc = async (name: string) => {
  //   const millisFunctions = agent.config.millis_functions?.filter((tool) => tool.name !== name)
  //   const editData = {
  //     name: agent.name,
  //     config: { millis_functions: millisFunctions }
  //   }
  //   setIsOverlayShow(true)
  //   try {
  //     await axiosInstance.put(`/agent/${agent.id}`, editData)
  //     toast.success('Function deleted')
  //     setAgent({
  //       ...agent,
  //       config: {
  //         ...agent.config,
  //         millis_functions: millisFunctions,
  //       }
  //     })
  //   } catch (error) {
  //     handleAxiosError('Failed to delete function', error)
  //   } finally {
  //     setIsOverlayShow(false)
  //   }
  // }

  return (
    <>
      <Card title="Tools" className="mt-6" icon={<AiOutlineProduct />}>
        {(!agent.tools?.length && !agent.config.millis_functions?.length && !(agent.config.calendar_ids?.length)) && (
          <div className="p-6 m-4 mt-8">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
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
        {(!!agent.tools?.length || !!(agent.config.calendar_ids?.length)) && (
          <div className="py-2">
            {agent.tools?.map((tool, index) => {
              const connectedTool = connectedTools.find(ct => ct.id === tool.id);
              if (!connectedTool) return;
              const iconProp = totalTools.find(t => t.id === connectedTool.tool_id)?.icon ?? Cog
              return (
                <div
                  key={`tool-${index}`}
                  className="flex items-center gap-2 px-4 py-1"
                >
                  <div className="size-8 p-1.5 text-white bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md">
                    {renderToolIcon(iconProp)}
                  </div>
                  <div className="font-semibold truncate text-nowrap" style={{ width: 'calc(100% - 96px)' }}>
                    {connectedTool.name}
                  </div>
                  <div className="flex items-center ml-auto mr-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                            onClick={() => {
                              setSelectedTool(tool)
                              setShowToolModal(true)
                            }}
                            aria-label="Edit tool"
                          >
                            <FaEdit />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit tool settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                            onClick={() => handleDeleteTool(tool.id)}
                            aria-label="Delete tool"
                          >
                            <FaRegTrashAlt />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete tool</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )
            })}
            {/* {agent.config.tools?.map((tool, index) => (
              <div
                key={`tool-${index}`}
                className="flex items-center justify-between gap-2 px-4 py-1"
              >
                <div className="truncate text-nowrap" style={{ width: 'calc(100% - 64px)' }}>
                  {tool.name}
                </div>
                <div className="flex items-center">
                  <button
                    className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                    onClick={() => {
                      setSelectedTool({ name: tool.name, type: 'webhook' })
                      setShowToolModal(true)
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
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
                  <div className="text-gray-600 dark:text-gray-400 text-sm">{func.type}</div>
                </div>
                <div className="flex items-center">
                  <button
                    className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                    onClick={() => {
                      setSelectedTool({ name: func.name, type: 'webform' })
                      setShowToolModal(true)
                    }}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                    onClick={() => handleDeleteMillisFunc(func.name)}
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </div>
            ))} */}
            {agent.config.calendar_ids?.map((calendarId, index) => {
              const calendar = calendars.find(cal => cal.id === calendarId)
              if (!calendar) return null
              return (
                <div
                  key={`calendar-${index}`}
                  className="flex items-center justify-between gap-2 px-4 py-1"
                >
                  <div style={{ width: 'calc(100% - 64px)' }}>
                    <div className="truncate text-nowrap">
                      {calendar.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">{calendar.provider}</div>
                  </div>
                  <div className="flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-700/20 p-2 rounded transition-colors duration-300"
                            onClick={() => setShowCalendarModal(true)}
                            aria-label="Manage calendar"
                          >
                            <FaEdit />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Manage calendar settings</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <hr className="text-gray-300 dark:text-gray-700 my-2" />
        <div className="my-2">
          <div
            className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
            onClick={() => setShowToolModal(true)}
          >
            <FaPlus />
            Add Tool
          </div>
          <div
            className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300"
            onClick={() => setShowCalendarModal(true)}
          >
            <FaRegCalendarPlus />
            Manage Calendars
          </div>
        </div>
      </Card>
      <ToolModal
        agent={agent}
        isOverlayShow={isOverlayShow}
        connectedTools={connectedTools}
        selectedTool={selectedTool}
        showModal={showToolModal}
        setAgent={setAgent}
        setIsOverlayShow={setIsOverlayShow}
        setSelectedTool={setSelectedTool}
        setShowModal={setShowToolModal}
      />
      <CalendarSelectionModal
        agent={agent}
        isOverlayShow={isOverlayShow}
        showModal={showCalendarModal}
        setAgent={setAgent}
        setIsOverlayShow={setIsOverlayShow}
        setShowModal={setShowCalendarModal}
      />
    </>
  )
}

export default ToolCard
