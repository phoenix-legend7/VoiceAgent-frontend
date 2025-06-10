import clsx from "clsx";
import { FC } from "react";

interface CampaignStatusBadgeProps {
  status: 'idle' | 'started' | 'paused' | 'finished' | 'failed';
}
interface CallStatusBadgeProps {
  status: 'not_started' | 'started' | 'finished' | 'failed';
}
interface StatusBadgeProps {
  status: string;
  colors: string;
}

const StatusBadge: FC<StatusBadgeProps> = ({ status, colors }) => {
  return (
    <div
      className={clsx(
        "capitalize w-fit px-3 py-0.5 rounded-xl border font-bold text-xs",
        colors
      )}
    >
      {status}
    </div>
  )
}

export const CampaignStatusBadge: FC<CampaignStatusBadgeProps> = ({ status }) => {
  const handleGetStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'border-gray-500 bg-gray-600/20 text-gray-400'
      case 'started':
        return 'border-emerald-500 bg-emerald-800/20 text-emerald-500'
      case 'paused':
        return 'border-yellow-400 bg-yellow-200/20 text-yellow-400'
      case 'finished':
        return 'border-blue-500 bg-blue-800/20 text-blue-400'
      case 'failed':
        return 'border-red-400 bg-red-800/20 text-red-400'
      default:
        return 'border-gray-500 bg-gray-600/20 text-gray-400'
    }
  }
  return (
    <StatusBadge colors={handleGetStatusColor()} status={status} />
  )
}

export const CallStatusBadge: FC<CallStatusBadgeProps> = ({ status }) => {
  const handleGetStatusColor = () => {
    switch (status) {
      case 'not_started':
        return 'border-gray-500 bg-gray-600/20 text-gray-400'
      case 'started':
        return 'border-emerald-500 bg-emerald-800/20 text-emerald-500'
      case 'finished':
        return 'border-blue-500 bg-blue-800/20 text-blue-400'
      case 'failed':
        return 'border-red-400 bg-red-800/20 text-red-400'
      default:
        return 'border-gray-500 bg-gray-600/20 text-gray-400'
    }
  }

  return (
    <StatusBadge colors={handleGetStatusColor()} status={status} />
  )
}

export default StatusBadge;
