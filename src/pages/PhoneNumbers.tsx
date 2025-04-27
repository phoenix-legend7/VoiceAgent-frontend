import { Dispatch, FC, SetStateAction, useEffect, useMemo, useState } from "react"
import { FaEdit, FaUserAlt } from "react-icons/fa"
import { toast } from "react-toastify"

import axiosInstance from "../core/axiosInstance"
import Content from "../Layout/Content"
import Modal from "../library/ModalProvider"
import Select from "../library/Select"
import Table, { TableCell } from "../library/Table"
import { AgentTypeRead } from "../models/agent"
import { SelectOptionType } from "../models/common"
import { PhoneTypeRead } from "../models/phone"
import { formatDateTime } from "../utils/helpers"

interface SetAgentModalProps {
  agents: AgentTypeRead[]
  isOpen: boolean
  isOverlayShow: boolean
  selectedPhoneNumber: PhoneTypeRead | null
  setIsChanged: Dispatch<SetStateAction<boolean>>
  setIsOpen: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setSelectedPhoneNumber: Dispatch<SetStateAction<PhoneTypeRead | null>>
}
const SetAgentModal: FC<SetAgentModalProps> = ({
  agents,
  isOpen,
  isOverlayShow,
  selectedPhoneNumber,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
  setSelectedPhoneNumber,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentTypeRead>()

  const agentOptions = useMemo(() => {
    return agents.map((agent) => ({
      value: agent.id,
      label: agent.name,
      icon: <div className="bg-gray-500 rounded p-3"><FaUserAlt size={20} /></div>
    }))
  }, [agents])

  useEffect(() => {
    setSelectedAgent(agents.find((agent) => agent.id === selectedPhoneNumber?.agent_id))
  }, [agents, selectedPhoneNumber])

  const handleSet = async (agent?: AgentTypeRead) => {
    if (!selectedPhoneNumber) return
    setIsOverlayShow(true)
    try {
      const response = await axiosInstance.post(
        '/set_phone_agent',
        {
          phone: selectedPhoneNumber.id,
          agent_id: agent?.id,
        }
      )
      const data = response.data
      if (data !== 'ok') {
        throw new Error(data.details)
      }
      setIsChanged(prev => !prev)
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(`Failed to set agent: ${error}`)
    } finally {
      setIsOverlayShow(false)
    }
  }
  const onClose = () => {
    setSelectedAgent(undefined)
    setIsOpen(false)
    setSelectedPhoneNumber(null)
  }

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={isOpen}
      title="Select Agent"
      onOK={() => handleSet(selectedAgent)}
      onClose={onClose}
      modalSize="max-w-xl"
      okBtnLabel="Set"
    >
      <div>
        <Select
          options={agentOptions}
          value={agentOptions.find((option) => option.value === selectedAgent?.id)}
          onChange={(option) => {
            if (option) {
              setSelectedAgent(agents.find(
                (agent) => agent.id === (option as SelectOptionType).value
              ))
            } else {
              setSelectedAgent(undefined)
            }
          }}
          placeholder="Select Agent"
          menuPortalTarget
        />
        {!!selectedPhoneNumber?.agent_id && (
          <>
            <div className="my-6 flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
              <div className="px-2.5 text-center text-nowrap">OR</div>
            </div>
            <button
              className="w-full cursor-pointer rounded-md border border-red-600 py-2 text-center text-red-600 hover:border-red-400 hover:bg-red-600/10 hover:text-red-400 transition-all duration-300"
              onClick={() => handleSet()}
            >
              Unlink Agent
            </button>
          </>
        )}
      </div>
    </Modal>
  )
}

const PhoneNumbers = () => {
  const [isOverlayShow, setIsOverlayShow] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneTypeRead[]>([])
  const [agents, setAgents] = useState<AgentTypeRead[]>([])
  const [isChanged, setIsChanged] = useState(false)
  const [isSetAgentModalOpen, setIsSetAgentModalOpen] = useState(false)
  const [selectedPhone, setSelectedPhone] = useState<PhoneTypeRead | null>(null)

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get(`/agent`)
        const data = response.data
        setAgents(data)
      } catch (error) {
        console.error(error)
        toast.error(`Failed to fetch agents: ${error}`)
      }
    }
    fetchAgents()
  }, [])
  useEffect(() => {
    const fetchPhones = async () => {
      setIsOverlayShow(true)
      try {
        const response = await axiosInstance.get(`/phones`)
        const data = response.data
        setPhoneNumbers(data)
      } catch (error) {
        console.error(error)
        toast.error(`Failed to fetch phone numbers: ${error}`)
      } finally {
        setIsOverlayShow(false)
      }
    }
    fetchPhones()
  }, [isChanged])

  return (
    <Content isOverlayShown={isOverlayShow}>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between flex-wrap gap-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold">Phone Numbers</h2>
          {/* <div className="flex gap-2 items-center">
            <button
              className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-6 py-3 rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
            >
              <FaDownload />
              Import Number
            </button>
            <button
              className="flex gap-2 items-center cursor-pointer bg-sky-600 text-white px-6 py-3 rounded-md transition-all duration-300 hover:bg-sky-700"
            >
              <FaPlus />
              Buy Number
            </button>
          </div> */}
        </div>
        <div className="flex flex-col justify-between h-full gap-4 rounded-lg bg-gray-900/80 overflow-x-auto">
          <Table>
            <thead>
              <tr className="border-b border-gray-700">
                <TableCell>Phone</TableCell>
                <TableCell className="text-center">Agent</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Created</TableCell>
                {/* <TableCell /> */}
              </tr>
            </thead>
            <tbody>
              {phoneNumbers.map((phoneNumber, index) => {
                return (
                  <tr key={index}>
                    <TableCell>{phoneNumber.id}</TableCell>
                    <TableCell className="text-center">
                      {phoneNumber.agent_id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center rounded bg-gray-800 py-1">
                            <FaUserAlt size={24} className="ml-2 rounded bg-gray-900 p-1.5" />
                            <div className="text-sm px-3">
                              {agents.find((agent) => agent.id === phoneNumber.agent_id)?.name}
                            </div>
                          </div>
                          <button
                            className="cursor-pointer rounded hover:bg-gray-800/50 p-2 transition-all duration-300"
                            onClick={() => {
                              setIsSetAgentModalOpen(true)
                              setSelectedPhone(phoneNumber)
                            }}
                            disabled={isOverlayShow}
                          >
                            <FaEdit className="text-gray-400" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="cursor-pointer bg-transparent text-sky-600 text-sm border border-sky-600 px-4 py-1.5 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
                          onClick={() => {
                            setIsSetAgentModalOpen(true)
                            setSelectedPhone(phoneNumber)
                          }}
                          disabled={isOverlayShow}
                        >
                          Link to Agent
                        </button>
                      )}
                    </TableCell>
                    <TableCell>us-west</TableCell>
                    <TableCell>{formatDateTime(phoneNumber.create_at)}</TableCell>
                    {/* <TableCell></TableCell> */}
                  </tr>
                )
              })}
            </tbody>
          </Table>
          {!phoneNumbers.length && (
            <div className="text-center m-4 p-6">
              <div className="text-gray-400">No Active Phone Numbers Found</div>
              {/* <div className="my-3">
                <button
                  className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-4 py-2 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
                >
                  <FaPlus />
                  Buy Number
                </button>
              </div> */}
            </div>
          )}
        </div>
      </div>
      <SetAgentModal
        agents={agents}
        isOpen={isSetAgentModalOpen}
        isOverlayShow={isOverlayShow}
        selectedPhoneNumber={selectedPhone}
        setIsChanged={setIsChanged}
        setIsOpen={setIsSetAgentModalOpen}
        setIsOverlayShow={setIsOverlayShow}
        setSelectedPhoneNumber={setSelectedPhone}
      />
    </Content>
  )
}

export default PhoneNumbers

