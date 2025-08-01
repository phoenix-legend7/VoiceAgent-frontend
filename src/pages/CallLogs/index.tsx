import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaArrowRight, FaExternalLinkAlt } from "react-icons/fa";
import { MdFilterList } from "react-icons/md";
import { Link } from "react-router-dom";

import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import Accordian from "../../library/Accordian";
import Content from "../../Layout/Content";
import { InputBox } from "../../library/FormField";
import Select from "../../library/Select";
import Table, { TableCell, TableRow } from "../../library/Table";
import { AgentTypeRead } from "../../models/agent";
import CallLogType from "../../models/call-log";
import { SelectOptionType } from "../../models/common";
import { formatDateTime } from "../../utils/helpers";
import DetailedLogModalOpen from "./DetailedLogModalOpen";

const callStatusOptions = [
  { label: "All", value: "" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" },
  { label: "In Progress", value: "in-progress" },
  { label: "Busy", value: "busy" },
  { label: "Canceled", value: "canceled" },
];

interface FilterBarProps {
  agents: AgentTypeRead[];
  isOverlayShow: boolean;
  setEnableNext: Dispatch<SetStateAction<boolean>>;
  setFilter: Dispatch<SetStateAction<FilterType>>;
  setNextStartAt: Dispatch<SetStateAction<number>>;
  setTatalLogs: Dispatch<SetStateAction<CallLogType[]>>;
}
const FilterBar: FC<FilterBarProps> = ({
  agents,
  isOverlayShow,
  setEnableNext,
  setFilter,
  setNextStartAt,
  setTatalLogs,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>();
  const [callStatus, setCallStatus] = useState<string>();
  const [phoeNumber, setPhoneNumber] = useState<string>();

  const agentOptions = useMemo(
    () => [
      { label: "All", value: "" },
      ...agents.map((agent) => ({
        label: agent.name,
        value: agent.id,
      })),
    ],
    [agents]
  );
  const handleClickClear = () => {
    setTatalLogs([]);
    setNextStartAt(0);
    setEnableNext(true);
    setSelectedAgent(undefined);
    setCallStatus(undefined);
    setPhoneNumber(undefined);
    setFilter({});
  };
  const handleClickApply = () => {
    setTatalLogs([]);
    setNextStartAt(0);
    setEnableNext(true);
    setFilter({
      agent: selectedAgent,
      callStatus: callStatus,
      phone: phoeNumber,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-3 px-4 py-3">
        <div className="flex flex-col gap-1">
          <div>Agent</div>
          <div>
            <Select
              className="min-w-48 sm:min-w-60"
              options={agentOptions}
              value={agentOptions.find(
                (agent) => agent.value === (selectedAgent || "")
              )}
              onChange={(option) =>
                setSelectedAgent(
                  ((option as SelectOptionType)?.value as string) || undefined
                )
              }
              placeholder="Select agent"
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div>Call Status</div>
          <div>
            <Select
              options={callStatusOptions}
              value={callStatusOptions.find(
                (status) => status.value === (callStatus || "")
              )}
              onChange={(option) => {
                setCallStatus(
                  ((option as SelectOptionType)?.value as string) || undefined
                );
              }}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div>Phone Number</div>
          <div>
            <InputBox
              value={phoeNumber || ""}
              onChange={(e) => setPhoneNumber(e)}
              placeholder="+1234567890"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6 justify-end px-4 py-3">
        <button
          className="cursor-pointer border border-sky-600 text-sky-600 dark:text-white px-5 py-1.5 rounded-md hover:border-sky-700 hover:text-sky-400 transition-colors duration-300"
          onClick={handleClickClear}
        >
          Clear All
        </button>
        <button
          className="cursor-pointer bg-sky-600 text-white px-4 py-2 rounded-md hover:bg-sky-700 transition-colors duration-300"
          onClick={handleClickApply}
          disabled={isOverlayShow}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
};

type FilterType = {
  agent?: string;
  callStatus?: string;
  phone?: string;
  startTime?: string;
  endTime?: string;
};

const CallLogs = () => {
  const [isOverlayShow, setIsOverlayShow] = useState(false);
  const [isDetailedLogModalOpen, setIsDetailedLogModalOpen] = useState(false);
  const [agents, setAgents] = useState<AgentTypeRead[]>([]);
  const [selectedLog, setSelectedLog] = useState<CallLogType>();
  const [totalLogs, setTatalLogs] = useState<CallLogType[]>([]);
  const [enableNext, setEnableNext] = useState(true);
  // Filters
  const [nextStartAt, setNextStartAt] = useState<number>(0);
  const [filter, setFilter] = useState<FilterType>({});

  const fetchLog = async (next: number) => {
    if (isOverlayShow) return;
    try {
      setIsOverlayShow(true);
      const response = await axiosInstance.get("/call-logs", {
        params: {
          limit: 20,
          start_after_ts: next,
          agent_id: filter.agent,
          call_status: filter.callStatus,
          phone_number: filter.phone,
          start_time: filter.startTime,
          end_time: filter.endTime,
        },
      });
      const data = response.data;
      if (data.detail) {
        throw new Error(data.detail);
      }
      if (data.length < 20) {
        setEnableNext(false);
      } else {
        setNextStartAt(Math.min(
          ...data.map((h: { ts: number }) => h.ts)
        ));
      }
      setTatalLogs([...totalLogs, ...data]);
    } catch (error) {
      handleAxiosError('Failed to fetch logs' , error);
    } finally {
      setIsOverlayShow(false);
    }
  };
  const handleScrollDown = async (
    e: React.UIEvent<HTMLDivElement, UIEvent>
  ) => {
    const target = e.target as HTMLDivElement;
    const isVerticalScroll = target.scrollHeight > target.clientHeight;
    if (!isVerticalScroll) return;
    if (
      enableNext &&
      !isOverlayShow &&
      target.scrollTop + target.clientHeight >= target.scrollHeight
    ) {
      fetchLog(nextStartAt);
    }
  };
  const onTrClick = (callLog: CallLogType) => {
    setIsDetailedLogModalOpen(true);
    setSelectedLog(callLog);
  };

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get("/agent");
        const data = response.data;
        setAgents(data);
      } catch (error) {
        handleAxiosError('Failed to fetch agents', error);
      }
    };
    fetchAgents();
  }, []);
  useEffect(() => {
    fetchLog(0);
  }, [filter]);

  return (
    <Content onScroll={handleScrollDown}>
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex flex-col gap-1 justify-center">
          <h2 className="text-2xl font-bold">Call Logs</h2>
        </div>
        <Accordian
          icon={<MdFilterList size={20} />}
          title="Filters"
          className="mt-1.5 border border-sky-600"
        >
          <FilterBar
            agents={agents}
            isOverlayShow={isOverlayShow}
            setEnableNext={setEnableNext}
            setFilter={setFilter}
            setNextStartAt={setNextStartAt}
            setTatalLogs={setTatalLogs}
          />
        </Accordian>
        <div className="flex flex-col justify-between grow gap-4 rounded-lg bg-white dark:bg-gray-900/80 border dark:border-0 border-gray-300 overflow-auto">
          <Table className="text-nowrap text-sm">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
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
                <TableRow key={index} className="hover:bg-gray-300/50 dark:hover:bg-gray-700/50">
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => onTrClick(log)}
                  >
                    {log.session_id}
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const agent = agents.find(
                        (agent) => agent.id === log.agent_id
                      );
                      if (!agent) return log.agent_id;
                      return (
                        <Link
                          to={`/agents/${log.agent_id}`}
                          className="flex items-center gap-3 rounded w-fit bg-gray-300 dark:bg-gray-700 px-2 py-1"
                        >
                          {agent.name}
                          <FaExternalLinkAlt size={12} />
                        </Link>
                      );
                    })()}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => onTrClick(log)}
                  >
                    {!!log.voip && (
                      <div className="flex flex-col gap-1">
                        <div className="border border-gray-400 dark:border-gray-600 rounded px-2 py-0.5 w-fit">
                          {log.voip.from}
                        </div>
                        <FaArrowRight size={14} className="mx-2" />
                        <div className="border border-gray-400 dark:border-gray-600 rounded px-2 py-0.5 w-fit">
                          {log.voip.to}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => onTrClick(log)}
                  >
                    <span className="border border-gray-400 dark:border-gray-600 rounded-xl px-3 py-0.5 w-fit text-gray-600 dark:text-gray-400 font-semibold text-sm">
                      {log.call_status}
                    </span>
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => onTrClick(log)}
                  >
                    $
                    {log.cost_breakdown
                      ?.reduce((a, b) => a + b.credit / 100, 0)
                      .toFixed(4) || "0.0000"}
                  </TableCell>
                  <TableCell
                    className="text-end cursor-pointer"
                    onClick={() => onTrClick(log)}
                  >
                    {log.duration?.toFixed(0) || 0}s
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => onTrClick(log)}
                  >
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
              <div className="text-gray-600 dark:text-gray-400">No call logs found</div>
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
  );
};

export default CallLogs;
