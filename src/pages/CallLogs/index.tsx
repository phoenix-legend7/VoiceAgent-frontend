import { useEffect, useMemo, useState } from "react"
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import axiosInstance from "../../core/axiosInstance"
import { AIAgentIcon } from "../../consts/svgIcons"
import Content from "../../Layout/Content"
import Select from "../../library/Select"
import Table, { TableCell, TableRow } from "../../library/Table"
import { AgentTypeRead } from "../../models/agent"
import CallLogType from "../../models/call-log"
import { SelectOptionType } from "../../models/common"
import { formatDateTime } from "../../utils/helpers"
import DetailedLogModalOpen from "./DetailedLogModalOpen"

const CallLogs = () => {
  const [isOverlayShow, setIsOverlayShow] = useState(false)
  const [isDetailedLogModalOpen, setIsDetailedLogModalOpen] = useState(false)
  const [agents, setAgents] = useState<AgentTypeRead[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [selectedLog, setSelectedLog] = useState<CallLogType>()
  const [totalLogs, setTatalLogs] = useState<CallLogType[]>([])
  const [nextStartAt, setNextStartAt] = useState<number>(0)
  const [enableNext, setEnableNext] = useState(true)

  const agentOptions = useMemo(() => {
    return agents.map((agent) => ({
      label: agent.name,
      value: agent.id,
    }))
  }, [agents])

  const fetchLog = async (agentID: string, nextStartAt: number = 0) => {
    try {
      setIsOverlayShow(true)
      const response = await axiosInstance.get(
        `/agent/${agentID}/call-histories`,
        {
          params: {
            start_at: nextStartAt,
            limit: 20,
          }
        }
      )
      const data = response.data
      if (data.detail) {
        throw new Error(data.detail)
      }
      if (data.items.length < 20) {
        setEnableNext(false)
      }
      setNextStartAt(parseInt(data.pagination.next_start_at.toFixed(0)))
      setTatalLogs([
        ...totalLogs,
        ...data.items
      ])
    } catch (error) {
      console.error(error)
      toast.error(`Failed to fetch logs: ${error}`)
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleScrollDown = async (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
    if (!selectedAgent) return
    const target = e.target as HTMLDivElement
    const isVerticalScroll = target.scrollHeight > target.clientHeight
    if (!isVerticalScroll) return
    if (enableNext && !isOverlayShow && target.scrollTop + target.clientHeight >= target.scrollHeight) {
      fetchLog(selectedAgent, nextStartAt)
    }
  }
  const onTrClick = (callLog: CallLogType) => {
    setIsDetailedLogModalOpen(true)
    setSelectedLog(callLog)
  }

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get('/agent')
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
    if (!selectedAgent) return
    fetchLog(selectedAgent)
  }, [selectedAgent])

  return (
    <Content onScroll={handleScrollDown}>
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex flex-col gap-1 justify-center">
          <h2 className="text-2xl font-bold">Call Logs</h2>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-5 items-center">
          <div className="flex gap-1 items-center">
            <AIAgentIcon />
            <div>Agent</div>
          </div>
          <div>
            <Select
              className="min-w-48 sm:min-w-60"
              options={agentOptions}
              value={agentOptions.find((agent) => agent.value === selectedAgent)}
              onChange={(option) => {
                setSelectedAgent((option as SelectOptionType)?.value as string)
                setNextStartAt(0)
                setTatalLogs([])
                setEnableNext(true)
              }}
              menuPortalTarget
              placeholder="Select agent"
            />
          </div>
        </div>
        <div className="flex flex-col justify-between grow gap-4 rounded-lg bg-gray-900/80 overflow-auto">
          <Table className="text-nowrap text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <TableCell>ID</TableCell>
                <TableCell>Agent</TableCell>
                <TableCell>Phone #</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Timestamp</TableCell>
              </tr>
            </thead>
            <tbody>
              {totalLogs.map((log, index) => (
                <TableRow key={index} className="hover:bg-gray-700/50">
                  <TableCell className="cursor-pointer" onClick={() => onTrClick(log)}>
                    {log.session_id}
                  </TableCell>
                  <TableCell>
                    {!!log.agent_id && (
                      <Link
                        to={`/agents/${log.agent_id}`}
                        className="flex items-center gap-3 rounded w-fit bg-gray-700 px-2 py-1"
                      >
                        {(() => {
                          const agent = agents.find((agent) => agent.id === log.agent_id)
                          return agent?.name
                        })()}
                        <FaExternalLinkAlt size={12} />
                      </Link>
                    )}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => onTrClick(log)}>
                    {!!log.voip && (
                      <div className="flex flex-col gap-1">
                        <span className="border border-gray-600 rounded px-2 py-0.5">
                          {log.voip.from}
                        </span>
                        <FaArrowRight size={14} className="mx-2" />
                        <span className="border border-gray-600 rounded px-2 py-0.5">
                          {log.voip.to}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => onTrClick(log)}>
                    <span className="border border-gray-600 rounded px-2 py-0.5">
                      {log.call_status}
                    </span>
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => onTrClick(log)}>
                    ${log.cost_breakdown?.reduce((a, b) => a + b.credit, 0).toFixed(4) || '0.0000'}
                  </TableCell>
                  <TableCell className="text-end cursor-pointer" onClick={() => onTrClick(log)}>
                    {log.duration?.toFixed(0) || 0}s
                  </TableCell>
                  <TableCell className="cursor-pointer" onClick={() => onTrClick(log)}>
                    {!!log.ts && formatDateTime(log.ts)}
                  </TableCell>
                </TableRow>
              ))}
              {isOverlayShow && (
                <TableRow>
                  <td colSpan={7} className="pb-2">
                    <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-sky-950 to-sky-500 animate-background" />
                  </td>
                </TableRow>
              )}
            </tbody>
          </Table>
          {!totalLogs.length && !isOverlayShow && (
            <div className="w-full mt-6 text-center my-4 p-6">
              <div className="text-gray-400">No call logs found</div>
            </div>
          )}
        </div>
      </div>
      <DetailedLogModalOpen
        isOpen={isDetailedLogModalOpen}
        selectedLog={selectedLog}
        setIsOpen={setIsDetailedLogModalOpen}
        setSelectedLog={setSelectedLog}
      />
    </Content>
  )
}

export default CallLogs

