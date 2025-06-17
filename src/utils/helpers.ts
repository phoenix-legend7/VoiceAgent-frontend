export const formatDateTime = (time: number) => {
  const date = new Date(time)
  return Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export const formatCallDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600)
  const minutes = Math.floor((duration % 3600) / 60)
  const seconds = parseInt((duration % 60).toFixed(0))
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export const formatFileSize = (size: number) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let unitIndex = 0
  let sizeInBytes = size
  while (sizeInBytes >= 1024 && unitIndex < units.length - 1) {
    sizeInBytes /= 1024
    unitIndex++
  }
  return `${sizeInBytes.toFixed(2)} ${units[unitIndex]}`
}

export const formatNextRunCampaign = (status: string, frequency: string) => {
  if (status === "paused") return "Paused";

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);

  const nextSaturday = new Date(now);
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
  nextSaturday.setDate(nextSaturday.getDate() + daysUntilSaturday);
  nextSaturday.setHours(10, 0, 0, 0);

  const customDate = new Date(2025, 0, 25, 10, 0, 0, 0); // Jan 25, 2025

  switch (frequency) {
    case "daily":
      return `Tomorrow at ${tomorrow.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    case "weekends":
      return `Saturday at ${nextSaturday.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    case "custom":
      return customDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ` at ${customDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    default:
      return "Not scheduled";
  }
}
