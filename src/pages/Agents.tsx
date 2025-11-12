import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react"
import { FaEllipsisV, FaPlus, FaUserAlt } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { createPortal } from "react-dom"
import { toast } from "react-toastify"

import StatusBadge from "../components/StatusBadge"
import axiosInstance, { handleAxiosError } from "../core/axiosInstance"
import { InputBox } from "../library/FormField"
import Modal from "../library/ModalProvider"
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
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const buttonRef = useRef<HTMLButtonElement | null>(null)
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
      await axiosInstance.post(`/agent/${agent.id}/duplicate`)
      setIsChanged(prev => !prev)
    } catch (error) {
      handleAxiosError('Failed to duplicate agent', error)
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleDelete = async () => {
    setIsOverlayShow(true)
    try {
      await axiosInstance.delete(`/agent/${agent.id}`)
      setIsChanged(prev => !prev)
    } catch (error) {
      handleAxiosError('Failed to delete agent', error)
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleEdit = () => {
    navigate(`/agents/${agent.id}`)
    setIsChanged(prev => !prev)
  }

  return (
    <div className="ml-auto mr-0 relative w-fit">
      <button
        ref={buttonRef}
        className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded-md transition-all duration-300 agent-action-button"
        onClick={() => {
          if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setMenuPosition({ top: rect.bottom + 8 + window.scrollY, left: rect.right + window.scrollX })
          }
          setIsOpen(true)
        }}
      >
        <FaEllipsisV />
      </button>
      {isOpen && createPortal(
        <div
          className="fixed z-50 bg-gray-50 dark:bg-gray-950 rounded-md shadow-md py-2"
          style={{ top: menuPosition.top, left: menuPosition.left, transform: 'translateX(-100%)' }}
        >
          <div className="flex flex-col">
            <button
              className="px-4 py-1.5 cursor-pointer text-left text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={handleDuplicate}
            >
              Duplicate
            </button>
            <button
              className="px-4 py-1.5 cursor-pointer text-left text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              className="px-4 py-1.5 cursor-pointer text-left text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

interface CreateAgentModalProps {
  isCreateAgentModalOpen: boolean
  isOverlayShow: boolean
  setIsChanged: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setIsCreateAgentModalOpen: Dispatch<SetStateAction<boolean>>
}

const CreateAgentModal: FC<CreateAgentModalProps> = ({
  isCreateAgentModalOpen,
  isOverlayShow,
  setIsChanged,
  setIsOverlayShow,
  setIsCreateAgentModalOpen
}) => {
  const navigate = useNavigate()
  const [createAgentName, setCreateAgentName] = useState('')

  const onClose = () => {
    setCreateAgentName('')
    setIsCreateAgentModalOpen(false)
  }
  const handleCreate = async () => {
    setIsOverlayShow(true)
    try {
      // Check if payment method exists
      const paymentMethodsResponse = await axiosInstance.get("/billing/payment-methods")
      const paymentMethods = paymentMethodsResponse.data.payment_methods || []

      if (paymentMethods.length === 0) {
        toast.warning("Please add a payment method before creating an agent")
        navigate("/settings/billing")
        setIsOverlayShow(false)
        onClose()
        return
      }

      await axiosInstance.post(
        `/agent`,
        {
          name: createAgentName,
          config: {
            prompt: 'You are a helpful assistant.',
            voice: {
              provider: 'elevenlabs',
              voice_id: '21m00Tcm4TlvDq8ikWAM',
            }
          }
        }
      )
      setIsChanged(prev => !prev)
      onClose()
    } catch (error) {
      handleAxiosError('Failed to create a new agent', error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Modal
      isOpen={isCreateAgentModalOpen}
      title="Create Agent"
      isLoading={isOverlayShow}
      onOK={handleCreate}
      okBtnLabel="Create"
      okBtnIcon={<FaPlus />}
      onClose={onClose}
    >
      <InputBox
        value={createAgentName}
        onChange={(value) => setCreateAgentName(value)}
        label="Agent Name"
        inputClassName="w-full bg-transparent"
      />
    </Modal>
  )
}

const Agents = () => {
  const [agents, setAgents] = useState<AgentTypeRead[]>([])
  const [isOverlayShow, setIsOverlayShow] = useState(true)
  const [isChanged, setIsChanged] = useState(false)
  const [isCreateAgentModalOpen, setIsCreateAgentModalOpen] = useState(false)

  useEffect(() => {
    const fetchAgents = async () => {
      setIsOverlayShow(true)
      try {
        const response = await axiosInstance.get('/agent')
        const data = response.data
        setAgents(data)
      } catch (error) {
        handleAxiosError('Failed to fetch agents', error)
      } finally {
        setIsOverlayShow(false)
      }
    }
    fetchAgents()
  }, [isChanged])

  const handleOpenCreateAgentModal = () => {
    setIsCreateAgentModalOpen(true)
  }

  return (
    <Content isOverlayShown={isOverlayShow}>
      <div className="flex flex-col h-full">
        <div className="flex justify-between flex-wrap gap-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold">Voice Agents</h2>
          <button
            className="flex gap-2 items-center cursor-pointer bg-sky-600 text-white px-5 py-2 rounded-md transition-all duration-300 hover:bg-sky-700"
            onClick={handleOpenCreateAgentModal}
          >
            <FaPlus />
            Add
          </button>
        </div>
        <div className="dark:bg-gray-900/80 bg-white border dark:border-0 border-gray-300 rounded-lg h-full overflow-x-auto mt-6">
          <Table>
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <TableCell>Name</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">Created</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">Status</TableCell>
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
                          <div className="p-3 rounded-md flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            <FaUserAlt size={24} />
                          </div>
                          <div>
                            {agent.name}
                            <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {agent.config.prompt.length > 90 ? agent.config.prompt.slice(0, 90) + ' ...' : agent.config.prompt}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {formatDateTime(agent.created_at)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status="active"
                        colors="border-emerald-500 bg-emerald-200/20 dark:bg-emerald-800/20 text-emerald-500"
                      />
                    </TableCell>
                    <TableCell>
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
          {agents.length === 0 && (
            <div className="text-center m-4 p-6">
              <div className="text-gray-400">Resources are not available</div>
            </div>
          )}
        </div>
      </div>
      <CreateAgentModal
        isCreateAgentModalOpen={isCreateAgentModalOpen}
        isOverlayShow={isOverlayShow}
        setIsChanged={setIsChanged}
        setIsOverlayShow={setIsOverlayShow}
        setIsCreateAgentModalOpen={setIsCreateAgentModalOpen}
      />
    </Content>
  )
}

export default Agents
