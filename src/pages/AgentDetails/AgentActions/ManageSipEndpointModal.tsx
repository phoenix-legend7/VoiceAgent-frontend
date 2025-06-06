import { Dispatch, FC, SetStateAction, useState } from "react"
import { toast } from "react-toastify"
import axiosInstance from "../../../core/axiosInstance"
import Modal from "../../../library/ModalProvider"
import Select from "../../../library/Select"
import { AgentTypeRead } from "../../../models/agent"
import { SelectOptionType } from "../../../models/common"
import { formatDateTime } from "../../../utils/helpers"
import { FaCopy, FaTrashAlt } from "react-icons/fa"

const regionOptions = [
  { label: 'us-west', value: 'us-west' },
  { label: 'eu-west', value: 'eu-west' },
]

interface SIPEndpoint {
  endpoint: string
  created_at: number
  call_id: string
}

const mockSipEndpoints: SIPEndpoint[] = []

interface Props {
  agent: AgentTypeRead
  isModalOpen: boolean
  isOverlayShow: boolean
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}

const ManageSipEndpointModal: FC<Props> = ({
  agent,
  isModalOpen,
  isOverlayShow,
  setIsModalOpen,
  setIsOverlayShow,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(regionOptions[0].value)

  const onClose = () => {
    setIsModalOpen(false)
  }
  const handleGenerate = async () => {
    setIsOverlayShow(true)
    try {
      await axiosInstance.post(
        `/sip`,
        {
          agent,
          region: selectedRegion,
        }
      )
      toast.success('New SIP Endpoint generated successfully.')
    } catch (error) {
      console.error(error)
      toast.error('Failed to generate new SIP endpoint.')
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleDeleteSip = async (call_id: string) => {
    setIsOverlayShow(true)
    try {
      await axiosInstance.delete(`/sip/${call_id}`)
    } catch (error) {
      console.error(error)
      toast.error('Failed to delete SIP endpoint.')
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleCopySip = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint)
    toast.success('SIP endpoint copied to clipboard')
  }

  return (
    <Modal
      isOpen={isModalOpen}
      isLoading={isOverlayShow}
      title="Agent SIP Endpoints"
      onClose={onClose}
      hideOKButton
      modalSize="max-w-xl"
    >
      <div className="text-gray-400">
        Manage SIP endpoints for your agent.
      </div>
      <div className="mt-4 py-2">
        {mockSipEndpoints.map((sip, index) => (
          <div className="flex items-center gap-3 px-4 py-2" key={index}>
            <div className="w-[calc(100%-64px)]">
              <div className="w-full text-nowrap truncate">{sip.endpoint}</div>
              <div className="text-sm text-gray-400">{formatDateTime(sip.created_at)}</div>
            </div>
            <div className="flex items-center">
              <button
                className="cursor-pointer p-2 rounded-md text-gray-600 hover:text-gray-400 hover:bg-gray-700/10 transition-all duration-300"
                onClick={() => handleCopySip(sip.endpoint)}
              >
                <FaCopy />
              </button>
              <button
                className="cursor-pointer p-2 rounded-md text-red-600 hover:text-red-400 hover:bg-red-700/10 transition-all duration-300"
                onClick={() => handleDeleteSip(sip.call_id)}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
        <div className="flex gap-2 items-center">
          <div>Region:</div>
          <Select
            options={regionOptions}
            value={regionOptions.find(option => option.value === selectedRegion)}
            onChange={(e) => setSelectedRegion((e as SelectOptionType).value as string)}
          />
        </div>
        <div className="flex items-center">
          <button
            className="cursor-pointer px-3 py-2 rounded-md border border-sky-600 hover:border-sky-400 text-sky-400 transition-all duration-300"
            onClick={handleGenerate}
          >
            Generate New SIP Endpoint
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ManageSipEndpointModal
