import { FC, useState } from "react"
import { toast } from "react-toastify"
import { BsSendFill } from "react-icons/bs"

import axiosInstance from "../../../core/axiosInstance"
import { AgentTypeRead } from "../../../models/agent"
import { InputBox } from "../../../library/FormField"
import Markdown from "../../../library/Markdown"

interface ChatTabProps {
  agent: AgentTypeRead
}
interface Message {
  role: "user" | "assistant"
  content: string
}

const ChatTab: FC<ChatTabProps> = ({ agent }) => {
  const [isWaiting, setIsWaiting] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState<string>("")

  const handleSendMessage = async () => {
    if (message.trim() === "") return
    try {
      setIsWaiting(true)
      const userMessage: Message = { role: "user", content: message }
      setMessages((prev: Message[]) => [...prev, userMessage])

      const response = await axiosInstance.post(
        '/chat/completions',
        {
          messages: [...messages, userMessage],
          agent
        },
        {
          responseType: 'stream',
          headers: {
            'Accept': 'text/event-stream'
          }
        }
      )

      const originalMessages = [...messages, userMessage]

      if (response.data) {
        const reader = response.data instanceof ReadableStream
          ? response.data.getReader()
          : new Response(response.data).body?.getReader()
        if (!reader) {
          throw new Error("Could not get stream reader from response")
        }
        const decoder = new TextDecoder()
        let result = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split("\n").filter((line) => line.trim() !== "")
          for (const line of lines) {
            if (line.trim() === "") continue
            if (line === "data: [DONE]") break
            const message = line.trim().replace(/^data: /, "")
            try {
              const parsed = JSON.parse(message)
              let content = parsed.choices[0].delta.content
              if (content) {
                result += content
                setMessages([
                  ...originalMessages,
                  { role: "assistant", content: result }
                ])
              }
            } catch (error) {
              throw error
            }
          }
        }
        setMessage("")
      } else {
        throw new Error("No data received from server")
      }
    } catch (error) {
      console.error(error)
      toast.error(`Failed to send message: ${error}`)
    } finally {
      setIsWaiting(false)
    }
  }
  const handleClear = () => {
    setMessages([])
    setMessage("")
  }

  return (
    <div className="p-2">
      <div className="flex flex-col items-center h-[50vh]">
        <button
          className="bg-transparent hover:bg-green-600/10 rounded-md px-2 py-1.5 w-full text-sm cursor-pointer transition-all duration-300"
          onClick={handleClear}
        >
          Clear
        </button>
        <div className="flex-1 w-full overflow-auto" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((message, index) => (
            <div key={index} className="px-3 py-2">
              <div className="text-gray-400">{message.role === "user" ? "You" : "Agent"}</div>
              <Markdown className="text-white text-sm">{message.content}</Markdown>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center w-full p-2">
          <InputBox
            className="flex-1"
            inputClassName="bg-transparent"
            value={message}
            onChange={(e) => setMessage(e)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === "NumpadEnter") {
                handleSendMessage()
              }
            }}
            disabled={isWaiting}
            placeholder="Type your message..."
          />
          <button
            className="p-2 cursor-pointer text-green-600 hover:bg-green-600/10 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-transparent rounded-md transition-all duration-300"
            onClick={handleSendMessage}
            disabled={isWaiting || message.trim() === ""}
          >
            <BsSendFill size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatTab
