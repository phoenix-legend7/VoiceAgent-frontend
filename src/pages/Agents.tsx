import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { FaEllipsisV, FaPlus, FaUserAlt } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"

import axiosInstance from "../core/axiosInstance"
import Table, { TableCell, TableRow } from "../library/Table"
import { AgentTypeRead } from "../models/agent"
import Content from "../Layout/Content"
import { formatDateTime } from "../utils/helpers"

interface EditAgentActionProps {
  agent: AgentTypeRead
  setIsChanged: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}

const EditAgentAction: React.FC<EditAgentActionProps> = ({ agent, setIsChanged, setIsOverlayShow }) => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as HTMLElement).closest('.agent-action-button')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  const handleDuplicate = async () => {
    setIsOverlayShow(true)
    try {
      const response = await axiosInstance.post(`/agent/${agent.id}/duplicate`)
      const data = response.data
      console.log(data)
      setIsChanged(prev => !prev)
    } catch (error) {
      console.error(error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  const handleDelete = async () => {
    setIsOverlayShow(true)
    try {
      const response = await axiosInstance.delete(`/agent/${agent.id}`)
      const data = response.data
      console.log(data)
      setIsChanged(prev => !prev)
    } catch (error) {
      console.error(error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  const handleEdit = () => {
    navigate(`/agents/${agent.id}`)
    setIsChanged(prev => !prev)
  }

  return (
    <div className="relative">
      <button
        className="cursor-pointer hover:bg-gray-700 p-2 rounded-md transition-all duration-300 agent-action-button"
        onClick={() => setIsOpen(true)}
      >
        <FaEllipsisV />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 bg-gray-950 rounded-md shadow-md py-2 z-50">
          <div className="flex flex-col">
            <button
              className="px-4 py-1.5 cursor-pointer text-left text-white hover:bg-gray-800"
              onClick={handleDuplicate}
            >
              Duplicate
            </button>
            <button
              className="px-4 py-1.5 cursor-pointer text-left text-white hover:bg-gray-800"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              className="px-4 py-1.5 cursor-pointer text-left text-white hover:bg-gray-800"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const Agents = () => {
  const [agents, setAgents] = useState<AgentTypeRead[]>([])
  const [isOverlayShow, setIsOverlayShow] = useState(true)
  const [isChanged, setIsChanged] = useState(false)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get('/agent')
        const data = response.data
        console.log(data)
        setAgents(data)
      } catch (error) {
        console.error(error)
      } finally {
        setIsOverlayShow(false)
      }
    }
    fetchAgents()
  }, [isChanged])

  return (
    <Content isOverlayShown={isOverlayShow}>
      <div>
        <div className="flex justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold">Voice Agents</h2>
          <button className="flex gap-2 items-center cursor-pointer bg-green-600 text-white px-6 py-3 rounded-md transition-all duration-300 hover:bg-green-700">
            <FaPlus />
            Add
          </button>
        </div>
        <div className="bg-gray-900/80 mt-8">
          <Table>
            <thead>
              <tr className="border-b border-gray-700">
                <TableCell>Name</TableCell>
                <TableCell>Created</TableCell>
                <TableCell className="text-gray-400">Status</TableCell>
                <TableCell />
              </tr>
            </thead>
            <tbody>
              {agents.map((agent, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Link to={`/agents/${agent.id}`}>
                        <div className="flex items-center gap-2">
                          {/* bg: rgb(29, 41, 57), text-color: rgb(151, 161, 186) */}
                          <div className="w-16 h-16 rounded-md flex items-center justify-center bg-gray-800 text-gray-400">
                            <FaUserAlt className="w-1/2 h-1/2" />
                          </div>
                          <div>
                            {agent.name}
                            <div className="text-gray-400 text-sm">
                              {agent.config.prompt}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>{formatDateTime(agent.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Active
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <EditAgentAction
                        agent={agent}
                        setIsChanged={setIsChanged}
                        setIsOverlayShow={setIsOverlayShow}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </tbody>
          </Table>
        </div>
      </div>
    </Content>
  )
}

export default Agents
