import { FC } from "react";

interface CampaignStatusBadgeProps {
  status: 'idle' | 'started' | 'paused' | 'finished' | 'failed';
}
interface CallStatusBadgeProps {
  status: 'not_started' | 'started' | 'finished' | 'failed';
}
interface StatusBadgeProps {
  status: string;
  color: string;
}

const StatusBadge: FC<StatusBadgeProps> = ({ status, color }) => {
  return (
    <div className="flex items-center gap-2 capitalize">
      <div className={`w-2 h-2 rounded-full ${color}`}></div>
      {status}
    </div>
  )
}

export const CampaignStatusBadge: FC<CampaignStatusBadgeProps> = ({ status }) => {
  const handleGetStatusColor = () => {
    switch (status) {
      case 'idle':
        return 'bg-gray-500'
      case 'started':
        return 'bg-green-500'
      case 'paused':
        return 'bg-yellow-500'
      case 'finished':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }
  return (
    <StatusBadge color={handleGetStatusColor()} status={status} />
  )
}

export const CallStatusBadge: FC<CallStatusBadgeProps> = ({ status }) => {
  const handleGetStatusColor = () => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-500'
      case 'started':
        return 'bg-green-500'
      case 'finished':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }
  return (
    <StatusBadge color={handleGetStatusColor()} status={status} />
  )
}

export default StatusBadge;
