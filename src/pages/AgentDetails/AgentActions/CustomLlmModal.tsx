import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { toast } from "react-toastify"
import axiosInstance from "../../../core/axiosInstance"
import Modal from "../../../library/ModalProvider"
import { AgentTypeRead } from "../../../models/agent"
import { InputBox } from "../../../library/FormField"

interface Props {
  agent: AgentTypeRead
  isModalOpen: boolean
  isOverlayShow: boolean
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsModalOpen: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}

const CustomLlmModal: FC<Props> = ({
  agent,
  isModalOpen,
  isOverlayShow,
  setAgent,
  setIsModalOpen,
  setIsOverlayShow,
}) => {
  const [customLlmUrl, setCustomLlmUrl] = useState('')

  useEffect(() => {
    setCustomLlmUrl(agent.config.custom_llm_websocket || '')
  }, [agent.config.custom_llm_websocket])

  const onClose = () => {
    setIsModalOpen(false)
  }
  const handleSave = async (websocketUrl?: string) => {
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(
        `/agent/${agent.id}`,
        {
          config: { custom_llm_websocket: websocketUrl },
          name: agent.name
        }
      )
      toast.success('Custom websocket url updated successfully')
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          custom_llm_websocket: websocketUrl,
        }
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to update custom websocket url')
    } finally {
      setIsOverlayShow(false)
      setIsModalOpen(false)
    }
  }

  return (
    <Modal
      isOpen={isModalOpen}
      isLoading={isOverlayShow}
      title="Custom LLM Configuration"
      okBtnLabel="Save Changes"
      onClose={onClose}
      onOK={() => handleSave(customLlmUrl)}
    >
      <div className="text-gray-400">
        Integrate your Custom LLM with Millis AI Voice Agent by providing a Websocket URL to your LLM Chatbot.
      </div>
      <hr className="my-5 text-gray-800" />
      <InputBox
        onChange={(e) => setCustomLlmUrl(e)}
        value={customLlmUrl}
        inputClassName="bg-transparent"
        label="Websocket URL"
      />
      <button
        className="mt-6 cursor-pointer bg-red-900/10 text-red-500 font-bold px-5 py-2 rounded-md hover:bg-red-900/20 disabled:cursor-not-allowed disabled:hover:bg-red-900/10 transition-all duration-300 w-full"
        onClick={() => handleSave()}
        disabled={!customLlmUrl || isOverlayShow}
      >
        Delete
      </button>
    </Modal>
  )
}

export default CustomLlmModal
