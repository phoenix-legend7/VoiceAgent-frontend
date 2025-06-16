import clsx from "clsx"
import { Dispatch, FC, SetStateAction, useState } from "react"

import { AIAgentIcon } from "../../consts/svgIcons"
import Modal from "../../library/ModalProvider"
import CallLogType from "../../models/call-log"
import { AgentConfigType } from "../../models/agent"
import { formatCallDuration, formatDateTime } from "../../utils/helpers"

interface ChatType {
  role: 'assistant' | 'user' | 'tool'
  content: string
  tool_calls?: Array<{
    id: string
    type: string
    function: {
      name: string
      arguments: string
    }
  }>
  tool_call_id?: string
  name?: string
}
interface AgentConfigProps {
  config: AgentConfigType
}
const AgentConfig: FC<AgentConfigProps> = ({ config }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className="mt-5">
      <div className="flex gap-2 items-center">
        Agent Config
        <button
          className="cursor-pointer rounded-md border border-sky-500 px-2 py-1 text-sm text-sky-500 hover:border-sky-300 hover:text-sky-300 select-none transition-all duration-300"
          onClick={() => setIsOpen(prev => !prev)}
        >
          {isOpen ? 'Hide' : 'View'}
        </button>
      </div>
      <div className={clsx(
        "whitespace-pre text-sm bg-gray-800 rounded-lg mt-2 transition-all duration-300",
        isOpen ? 'max-h-96 px-3 py-1.5 overflow-auto' : 'max-h-0 overflow-hidden'
      )}>
        {JSON.stringify(config, undefined, 4)}
      </div>
    </div>
  )
}

interface DetailedLogModalOpenProps {
  isOpen: boolean
  selectedLog?: CallLogType
  setIsOpen: Dispatch<SetStateAction<boolean>>
  setSelectedLog: Dispatch<SetStateAction<CallLogType | undefined>>
}

const DetailedLogModalOpen: FC<DetailedLogModalOpenProps> = ({
  isOpen,
  selectedLog,
  setIsOpen,
  setSelectedLog,
}) => {
  const onClose = () => {
    setIsOpen(false)
    setSelectedLog(undefined)
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onOK={onClose}
      title='Call Log'
      okBtnLabel="Close"
      hideCloseButton
      modalSize="max-w-3xl"
    >
      {!!selectedLog && (
        <div>
          <div className="flex flex-wrap items-center -mx-6">
            <div className="w-full sm:w-1/2 py-3 px-6">
              <div>Session ID</div>
              <div className="text-gray-400">
                {selectedLog.session_id}
              </div>
            </div>
            <div className="w-full sm:w-1/2 py-3 px-6">
              <div>Agent Id</div>
              <div className="text-gray-400">
                {selectedLog.agent_id}
              </div>
            </div>
            <div className="w-full sm:w-1/2 py-3 px-6">
              <div>Duration</div>
              <div className="text-gray-400">
                {!!selectedLog.duration && formatCallDuration(selectedLog.duration)}
              </div>
            </div>
            <div className="w-full sm:w-1/2 py-3 px-6">
              <div>Date</div>
              <div className="text-gray-400">
                {!!selectedLog.ts && formatDateTime(selectedLog.ts)}
              </div>
            </div>
            <div className="w-full sm:w-1/2 py-3 px-6">
              <div>Characters used</div>
              <div className="text-gray-400">
                {selectedLog.chars_used}
              </div>
            </div>
            <div className="w-full sm:w-1/2 py-3 px-6">
              <div>Status</div>
              <div className="my-1">
                <span className="border border-gray-600 rounded-xl px-3 py-0.5 w-fit text-gray-400 font-semibold text-sm">
                  {selectedLog.call_status}
                </span>
              </div>
            </div>
            {!!selectedLog.voip && (
              <div className="w-full sm:w-1/2 py-3 px-6">
                <div>VoIP</div>
                <div className="text-gray-400">
                  From: {selectedLog.voip.from}<br />
                  To: {selectedLog.voip.to}
                </div>
              </div>
            )}
          </div>
          {!!selectedLog.cost_breakdown && (
            <div className="text-nowrap">
              <div>Cost Breakdown</div>
              <div className="flex flex-wrap items-center gap-8 mt-1">
                <div className="flex flex-wrap items-center gap-4">
                  {selectedLog.cost_breakdown.map((cost, index) => (
                    <div className="flex items-center gap-2" key={index}>
                      <div className="text-sm rounded bg-gray-800 px-2 py-0.5">
                        {cost.type}
                      </div>
                      <div className="text-gray-400">
                        ${(cost.credit / 100).toFixed(4)}{' '}
                        ({cost.provider})
                      </div>
                    </div>
                  ))}
                </div>
                <div className="font-bold text-gray-400">
                  Total: $
                  {selectedLog.cost_breakdown.reduce((acc, cost) =>
                    acc + cost.credit / 100, 0).toFixed(4)
                  }
                </div>
              </div>
            </div>
          )}
          {!!selectedLog.agent_config && (
            <AgentConfig config={selectedLog.agent_config} />
          )}
          <div className="mt-4 py-4 text-lg font-semibold">Call History</div>
          <hr className="text-gray-700 mb-2" />
          {!!selectedLog.chat && (JSON.parse(selectedLog.chat) as ChatType[]).map((chat, index) => (
            <div key={`chat${index}`} className="flex items-start gap-3 my-1.5">
              <div className="p-2 mt-1 bg-gray-800 rounded-md">
                <AIAgentIcon className="w-6 h-6 p-1" />
              </div>
              <div className="flex flex-col w-[calc(100%-0.75rem-40px)]">
                <div className="capitalize">{chat.role}</div>
                <div className="text-gray-400 text-sm">
                  {chat.content}
                </div>
                {!!chat.tool_calls && (
                  <div className="text-gray-400 text-xs rounded bg-gray-800 px-2 py-1 mt-2 overflow-hidden">
                    <div>Tool Calls:</div>
                    <div className="overflow-auto whitespace-pre py-2">
                      {JSON.stringify(chat.tool_calls, undefined, 4)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {(() => {
            if (!selectedLog.function_calls) return
            const lastCall = selectedLog.function_calls.find((call => call.run_after_call))
            if (!lastCall) return
            return (
              <>
                <div className="my-6 flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
                  <div className="px-2.5 text-center text-nowrap">End of Call Webhooks</div>
                </div>
                <div className="flex items-start gap-3 my-1.5">
                  <div className="p-2 mt-1 bg-gray-800 rounded-md">
                    <AIAgentIcon className="w-6 h-6 p-1" />
                  </div>
                  <div className="flex flex-col w-[calc(100%-0.75rem-40px)]">
                    <div className="capitalize">
                      {lastCall.name}
                    </div>
                    <div className="text-gray-400 text-xs rounded bg-gray-800 px-2 py-1 mt-2 overflow-hidden">
                      <div>Tool Calls:</div>
                      <div className="overflow-auto whitespace-pre py-2">
                        {JSON.stringify(lastCall.params, undefined, 4)}
                      </div>
                    </div>
                    <div className="text-gray-400 text-sm">
                      Result: {lastCall.result}
                    </div>
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </Modal>
  )
}

export default DetailedLogModalOpen
