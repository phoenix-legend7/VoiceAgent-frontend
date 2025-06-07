import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { FaChevronDown } from "react-icons/fa"
// import { MdDialerSip } from "react-icons/md"
import { AIAgentIcon } from "../../../consts/svgIcons"
import { AgentTypeRead } from "../../../models/agent"
import CustomLlmModal from "./CustomLlmModal"
import ManageSipEndpointModal from "./ManageSipEndpointModal"

interface AgentActionsProps {
  agent: AgentTypeRead
  isOverlayShow: boolean
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}

const AgentActions: FC<AgentActionsProps> = ({
  agent,
  isOverlayShow,
  setAgent,
  setIsOverlayShow,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomLlmModal, setShowCustomLlmModal] = useState(false)
  const [showManageSipEndpointModal, setShowManageSipEndpointModal] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as HTMLElement).closest('.agent-actions')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative">
      <button
        className="cursor-pointer bg-sky-600 text-white px-6 py-3 rounded-md hover:bg-sky-500 transition-all duration-300 flex items-center gap-2 agent-actions"
        onClick={() => setIsOpen(!isOpen)}
      >
        Actions
        <FaChevronDown />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 bg-gray-800 text-white rounded-md py-2">
          <div className="flex flex-col rounded-md text-nowrap">
            {/* <a
                href="#"
                className="flex items-center gap-8 px-4 py-2 hover:bg-gray-700 transition-all duration-300"
                onClick={handleEmbedToPublicSite}
              >
                <FaCode />
                Embed to public site
              </a> */}
            <a
              href="#"
              className="flex items-center gap-8 px-4 py-2 hover:bg-gray-700 transition-all duration-300"
              onClick={() => setShowCustomLlmModal(true)}
            >
              <AIAgentIcon />
              Use Custom LLM
            </a>
            {/* <a
              href="#"
              className="flex items-center gap-8 px-4 py-2 hover:bg-gray-700 transition-all duration-300"
              onClick={() => setShowManageSipEndpointModal(true)}
            >
              <MdDialerSip />
              Manage SIP Endpoints
            </a> */}
          </div>
        </div>
      )}
      <CustomLlmModal
        agent={agent}
        isModalOpen={showCustomLlmModal}
        isOverlayShow={isOverlayShow}
        setAgent={setAgent}
        setIsModalOpen={setShowCustomLlmModal}
        setIsOverlayShow={setIsOverlayShow}
      />
      <ManageSipEndpointModal
        agent={agent}
        isModalOpen={showManageSipEndpointModal}
        isOverlayShow={isOverlayShow}
        setIsModalOpen={setShowManageSipEndpointModal}
        setIsOverlayShow={setIsOverlayShow}
      />
    </div>
  )
}

export default AgentActions
