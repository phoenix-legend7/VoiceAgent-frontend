import { Dispatch, FC, SetStateAction, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"
import axiosInstance from "../../../core/axiosInstance"
import Modal from "../../../library/ModalProvider"
import Select from "../../../library/Select"
import { AgentTypeRead } from "../../../models/agent"
import { SelectOptionType } from "../../../models/common"
import { formatDateTime } from "../../../utils/helpers"
import { FaCopy, FaTrashAlt } from "react-icons/fa"
import { useLocation } from "react-router-dom"

const regionOptions = [
  { label: 'us-west', value: 'us-west' },
  { label: 'eu-west', value: 'eu-west' },
]

interface Props {
  agent: AgentTypeRead
  isModalOpen: boolean
  isOverlayShow: boolean
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}

const ManageSipEndpointModal: FC<Props> = ({
  agent,
  isModalOpen,
  isOverlayShow,
  setAgent,
  setIsModalOpen,
  setIsOverlayShow,
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(regionOptions[0].value)
  const location = useLocation()
  const autoGenerate = useMemo(() => new URLSearchParams(location.search).get('auto') === '1', [location.search])
  const autoRunRef = useRef(false)

  const onClose = () => {
    setIsModalOpen(false)
  }
  const handleGenerate = async () => {
    setIsOverlayShow(true)
    try {
      const response = await axiosInstance.post(
        `/sip`,
        {
          agent,
          region: selectedRegion,
        }
      )
      const data = response.data
      setAgent({
        ...agent,
        sip: {
          ...(agent.sip || {}),
          [data.sip]: new Date().getTime()
        }
      })
      toast.success('New SIP Endpoint generated successfully.')
    } catch (error) {
      toast.error('Failed to generate new SIP endpoint.')
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleDeleteSip = async (sip: string) => {
    const callId = sip.split(":")[1].split("@")[0]
    setIsOverlayShow(true)
    try {
      await axiosInstance.delete(`/sip/${callId}`)
      const dbSip = structuredClone(agent.sip || {})
      delete dbSip[sip]
      setAgent({ ...agent, sip: dbSip })
    } catch (error) {
      toast.error('Failed to delete SIP endpoint.')
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleCopySip = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint)
    toast.success('SIP endpoint copied to clipboard')
  }

  // When opened with auto=1, trigger endpoint generation once
  useEffect(() => {
    if (isModalOpen && agent && autoGenerate && !autoRunRef.current) {
      autoRunRef.current = true
      handleGenerate()
    }
  }, [isModalOpen, agent, autoGenerate])

  return (
    <Modal
      isOpen={isModalOpen}
      isLoading={isOverlayShow}
      title="Agent SIP Endpoints"
      onClose={onClose}
      hideOKButton
      modalSize="max-w-xl"
    >
      <div className="text-gray-600 dark:text-gray-400">
        Manage SIP endpoints for your agent.
      </div>
      <div className="mt-4 py-2">
        {Object.keys(agent.sip).map((sip, index) => (
          <div className="flex items-center gap-3 px-4 py-2" key={index}>
            <div className="w-[calc(100%-64px)]">
              <div className="w-full text-nowrap truncate">{sip}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{formatDateTime(agent.sip[sip])}</div>
            </div>
            <div className="flex items-center">
              <button
                className="cursor-pointer p-2 rounded-md text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-700/10 transition-all duration-300"
                onClick={() => handleCopySip(sip)}
                disabled={isOverlayShow}
              >
                <FaCopy />
              </button>
              <button
                className="cursor-pointer p-2 rounded-md text-red-400 dark:text-red-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-700/10 transition-all duration-300"
                onClick={() => handleDeleteSip(sip)}
                disabled={isOverlayShow}
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
            disabled={isOverlayShow}
          >
            Generate New SIP Endpoint
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ManageSipEndpointModal
