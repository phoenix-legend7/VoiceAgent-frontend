import { FC, useEffect, useState } from "react"
import { BsMic, BsMicMute } from "react-icons/bs"
import { FaEllipsis } from "react-icons/fa6"

import msClient from "../../../core/millisAIClient"
import { handleAxiosError } from "../../../core/axiosInstance"
import { AgentTypeRead } from "../../../models/agent"

const regions = [
  { label: "US West", value: "us-west" },
  { label: "US East", value: "us-east" },
]

interface CallTabProps {
  agent: AgentTypeRead
}

const CallTab: FC<CallTabProps> = ({ agent }) => {
  const [, setRegion] = useState<string>("us-west")
  const [isCalling, setIsCalling] = useState<boolean>(false)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)

  useEffect(() => {
    msClient.on("onready", () => {
      setIsConnecting(false)
      setIsCalling(true)
    })
    msClient.on("onclose", () => {
      setIsCalling(false)
    })
    msClient.on("onerror", (error: Event) => {
      setIsCalling(false)
      handleAxiosError('Error', error)
    })
  }, [])

  const handleStartCall = async () => {
    setIsConnecting(true)
    await msClient.start({
      agent: {
        agent_id: agent.id,
        agent_config: agent.config,
      }
    })
  }
  const handleStopCall = async () => {
    await msClient.stop()
  }

  return (
    <div className="p-2 relative">
      <div className="h-[50vh] text-center">
        <select
          className="w-full max-w-md px-3 py-2 cursor-pointer rounded-md bg-white dark:bg-gray-900 border border-gray-400 dark:border-gray-700 focus:border-sky-600 focus:outline-none transition-all duration-300"
          onChange={(e) => setRegion(e.target.value)}
          id="region-select"
        >
          {regions.map((region, index) => (
            <option
              key={index}
              value={region.value}
              className="bg-white dark:bg-gray-900"
            >
              {region.label}
            </option>
          ))}
        </select>
        <div className="flex items-center justify-center w-full h-full -mt-10">
          {(!isConnecting && !isCalling) && (
            <button
              className="flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full cursor-pointer text-white shadow-[0_0_50px_rgba(169,129,252,0.5)] bg-gradient-to-br from-neutral-800 to-neutral-700 border border-white/25 transition-all duration-300"
              onClick={handleStartCall}
            >
              <BsMic size={48} />
              <div className="text-xl font-semibold">Start</div>
            </button>
          )}
          {isConnecting && (
            <button className="flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full cursor-pointer text-white shadow-[0_0_50px_rgba(169,129,252,0.5)] bg-gradient-to-br from-neutral-800 to-neutral-700 border border-white/25 transition-all duration-300">
              <FaEllipsis size={48} />
              <div className="sm:text-xl font-semibold">Connecting...</div>
            </button>
          )}
          {(isCalling && !isConnecting) && (
            <div className="relative">
              <div className="absolute inset-0 w-40 h-40 rounded-full bg-sky-500/20 animate-ping"></div>
              <div className="absolute inset-0 w-40 h-40 rounded-full bg-sky-500/10 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
              <button
                className="relative flex flex-col items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-full cursor-pointer text-white shadow-[0_0_50px_rgba(169,129,252,0.5)] bg-gradient-to-br from-neutral-800 to-neutral-700 border border-sky-500/50 transition-all duration-300"
                onClick={handleStopCall}
              >
                <BsMicMute size={48} />
                <div className="text-xl font-semibold">Stop</div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CallTab
