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
