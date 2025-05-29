import clsx from "clsx"
import { Dispatch, FC, SetStateAction, useEffect, useMemo, useRef, useState } from "react"
import { FaCheck, FaPlay, FaRegCopy, FaStop } from "react-icons/fa"
import { toast } from "react-toastify"
import { languageOptions } from "../../consts/languages"
import axiosInstance from "../../core/axiosInstance"
import Modal from "../../library/ModalProvider"
import { AgentTypeRead, AgentVoiceConfigType } from "../../models/agent"
import VoiceType from "../../models/voice"
import { VoiceProvider } from "../../models/provider"

interface ListItemProps {
  selectedVoice?: AgentVoiceConfigType
  voice: VoiceType
  setSelectedVoice: Dispatch<SetStateAction<AgentVoiceConfigType | undefined>>
}

const ListItem: FC<ListItemProps> = ({
  selectedVoice,
  voice,
  setSelectedVoice,
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleCopyId = () => {
    navigator.clipboard.writeText(voice.voice_id)
    toast.success("Voice id copied to clipboard")
  }
  const handlePlay = () => {
    const url = voice.preview_url;
    if (!url) return;
    const audio = new Audio(url)
    audioRef.current = audio
    setIsPlaying(true)
    audio.onended = () => {
      setIsPlaying(false)
    }
    audio.play()
  }
  const handleStop = () => {
    if (!isPlaying) return
    audioRef.current?.pause()
    setIsPlaying(false)
  }
  const getAvatarText = () => {
    const words = voice.name.split(' ')
    return words.map((word) => word[0]).join('').replace('-', '').slice(0, 2)
  }
  return (
    <div
      className={clsx(
        "flex items-center justify-between pr-4 transition-all duration-300",
        selectedVoice?.voice_id === voice.voice_id ? "text-sky-600 bg-sky-600/20 hover:bg-sky-600 hover:text-white font-bold" : "text-gray-400 hover:bg-gray-700/50"
      )}
    >
      <div
        className="flex items-center cursor-pointer px-4 py-1.5 gap-4 grow"
        onClick={() => setSelectedVoice({
          provider: voice.provider as VoiceProvider,
          voice_id: voice.voice_id,
        })}
      >
        <div className="flex items-center w-10 h-10 justify-center font-bold uppercase rounded bg-neutral-700/20">
          {getAvatarText()}
        </div>
        <div>
          <div className="font-semibold text-white">
            {voice.name}
          </div>
          {!!voice.category && (
            <div className="text-sm text-gray-400 font-semibold">
              {voice.category}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-self-end">
        <button
          className="flex items-center justify-center w-10 h-10 rounded cursor-pointer hover:bg-gray-700 transition-all duration-300"
          onClick={handleCopyId}
          title="Copy Voice Id"
        >
          <FaRegCopy />
        </button>
        {!!voice.preview_url && (
          <button
            className="flex items-center justify-center w-10 h-10 rounded cursor-pointer text-xs hover:bg-gray-700 transition-all duration-300"
            onClick={isPlaying ? handleStop : handlePlay}
            title="Play Voice Preview"
          >
            {isPlaying ? <FaStop /> : <FaPlay />}
          </button>
        )}
      </div>
    </div>
  )
}

interface Props {
  agent: AgentTypeRead
  isOverlayShow: boolean
  showAgentVoiceModal: boolean
  voices: VoiceType[]
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setShowAgentVoiceModal: Dispatch<SetStateAction<boolean>>
}

const AgentVoiceModal: FC<Props> = ({
  agent,
  isOverlayShow,
  showAgentVoiceModal,
  voices,
  setShowAgentVoiceModal,
  setAgent,
  setIsOverlayShow,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<AgentVoiceConfigType>()
  const [selectedCategory, setSelectedCattegory] = useState<string>()

  const filteredVoices = useMemo(() => {
    if (!selectedCategory) return [];
    return voices.filter((voice) => voice.provider === selectedCategory)
  }, [voices, selectedCategory])
  const trandingVoices = useMemo(() => {
    return filteredVoices.filter(voice => voice.category === 'trending')
  }, [filteredVoices])

  useEffect(() => {
    if (showAgentVoiceModal) {
      setSelectedVoice(agent.config.voice)
      setSelectedCattegory(agent.config.voice.provider)
    } else {
      setSelectedVoice(undefined)
    }
  }, [showAgentVoiceModal, agent.config.voice])

  const onClose = () => {
    setShowAgentVoiceModal(false)
    setSelectedVoice(undefined)
  }
  const onSubmit = async () => {
    if (!selectedVoice) return
    let editData: AgentTypeRead
    editData = {
      ...agent,
      config: { ...agent.config, voice: selectedVoice },
    }
    setIsOverlayShow(true)
    try {
      await axiosInstance.put(`/agent/${agent.id}`, editData)
      toast.success('Agent updated successfully')
      setAgent(editData)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update agent')
    } finally {
      setIsOverlayShow(false)
    }
  }
  const getCategories = () => {
    const categories = voices.map((voice) => voice.provider)
    return Array.from(new Set(categories))
  }

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={showAgentVoiceModal}
      title="Agent Voice"
      onClose={onClose}
      onOK={onSubmit}
      okBtnLabel="Save Changes"
      modalSize="max-w-3xl"
    >
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm font-semibold">
            Showing voices filtered by language:{' '}
            {languageOptions.find(language => (language.value || 'en') === agent.config.language)?.label || 'English'}
          </p>
          <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-sky-950 text-sky-200 mr-2">
            <FaCheck className="text-sky-400" />
            {voices.find(voice => voice.voice_id === selectedVoice?.voice_id)?.name || 'Rachel'}{' '}
            ({selectedVoice?.provider || 'elevenlabs'})
          </div>
        </div>
        <hr className="text-gray-800" />
        <div className="overflow-auto">
          <div className="flex justify-center h-96 max-h-full min-w-[500px] overflow-y-auto gap-3">
            <div className="h-full overflow-y-auto pl-4 pr-2 capitalize">
              {getCategories().map((cat, index) => (
                <div
                  key={`cat-${index}`}
                  className={clsx(
                    "w-full px-4 py-3 cursor-pointer transition-all duration-300",
                    selectedCategory === cat ? "text-sky-600 bg-sky-600/20 hover:bg-sky-600 hover:text-white font-bold" : "text-gray-400 hover:bg-gray-700/20"
                  )}
                  onClick={() => setSelectedCattegory(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
            <div className="grow overflow-y-auto">
              <div className="px-4 py-3 sticky top-0 bg-gray-800 font-semibold">
                Standard Voices
              </div>
              {filteredVoices.filter(voice => voice.category !== 'trending').map((voice, index) => (
                <ListItem
                  key={`voice-${index}`}
                  selectedVoice={selectedVoice}
                  voice={voice}
                  setSelectedVoice={setSelectedVoice}
                />
              ))}
              {!!trandingVoices.length && (
                <div className="px-4 py-3 sticky top-0 bg-gray-800 font-semibold">
                  Community Trending Voices
                </div>
              )}
              {trandingVoices.map((voice, index) => (
                <ListItem
                  key={`voice-${index}`}
                  selectedVoice={selectedVoice}
                  voice={voice}
                  setSelectedVoice={setSelectedVoice}
                />
              ))}
            </div>
          </div>
        </div>
        <hr className="text-gray-800" />
      </div>
    </Modal>
  )
}

export default AgentVoiceModal
