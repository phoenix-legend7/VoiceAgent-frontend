export const Loading = () => {
  return (
    <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 cursor-wait z-50">
      <div className="flex items-center justify-center h-full">
        <div className="w-16 h-16 rounded-full border-4 border-transparent border-l-gray-600 dark:border-l-gray-400 animate-spin"></div>
      </div>
    </div>
  )
}