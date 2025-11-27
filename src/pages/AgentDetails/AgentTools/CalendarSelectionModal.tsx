import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { toast } from "react-toastify"
import axiosInstance, { handleAxiosError } from "../../../core/axiosInstance"
import Modal from "../../../library/ModalProvider"
import Table, { TableCell, TableRow } from "../../../library/Table"
import { AgentTypeRead } from "../../../models/agent"
import { CalendarConfig } from "../../Settings/Calendars"
import { FaRegTrashAlt } from "react-icons/fa"

interface CalendarSelectionModalProps {
  agent: AgentTypeRead
  isOverlayShow: boolean
  showModal: boolean
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setShowModal: Dispatch<SetStateAction<boolean>>
}

const CalendarSelectionModal: FC<CalendarSelectionModalProps> = ({
  agent,
  isOverlayShow,
  showModal,
  setAgent,
  setIsOverlayShow,
  setShowModal,
}) => {
  const [availableCalendars, setAvailableCalendars] = useState<CalendarConfig[]>([])
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('')
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false)

  useEffect(() => {
    if (showModal) {
      fetchAvailableCalendars()
    }
  }, [showModal])

  const fetchAvailableCalendars = async () => {
    setIsLoadingCalendars(true)
    try {
      const response = await axiosInstance.get('/calendars')
      setAvailableCalendars(response.data || [])
    } catch (error) {
      handleAxiosError('Failed to fetch calendars', error)
    } finally {
      setIsLoadingCalendars(false)
    }
  }

  const getSelectedCalendarIds = (): string[] => {
    return agent.config.calendar_ids || []
  }

  const handleAddCalendar = async () => {
    if (!selectedCalendarId) {
      toast.warning('Please select a calendar')
      return
    }

    const currentCalendarIds = getSelectedCalendarIds()
    if (currentCalendarIds.includes(selectedCalendarId)) {
      toast.warning('This calendar is already added')
      return
    }

    setIsOverlayShow(true)
    try {
      const updatedCalendarIds = [...currentCalendarIds, selectedCalendarId]
      const editData = {
        name: agent.name,
        config: {
          ...agent.config,
          calendar_ids: updatedCalendarIds
        }
      }
      await axiosInstance.put(`/agent/${agent.id}`, editData)
      toast.success('Calendar added successfully')
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          calendar_ids: updatedCalendarIds
        }
      })
      setSelectedCalendarId('')
    } catch (error) {
      handleAxiosError('Failed to add calendar', error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  const handleRemoveCalendar = async (calendarId: string) => {
    setIsOverlayShow(true)
    try {
      const currentCalendarIds = getSelectedCalendarIds()
      const updatedCalendarIds = currentCalendarIds.filter(id => id !== calendarId)
      const editData = {
        name: agent.name,
        config: {
          ...agent.config,
          calendar_ids: updatedCalendarIds
        }
      }
      await axiosInstance.put(`/agent/${agent.id}`, editData)
      toast.success('Calendar removed successfully')
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          calendar_ids: updatedCalendarIds
        }
      })
    } catch (error) {
      handleAxiosError('Failed to remove calendar', error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  const onClose = () => {
    setShowModal(false)
    setSelectedCalendarId('')
  }

  const selectedCalendarIds = getSelectedCalendarIds()
  const selectedCalendars = availableCalendars.filter(cal => selectedCalendarIds.includes(cal.id || ''))
  const availableCalendarsToShow = availableCalendars.filter(cal => {
    if (selectedCalendarIds.includes(cal.id || '')) {
      return false
    }
    const hasDuplicate = selectedCalendars.some(
      selected => selected.provider === cal.provider && selected.name === cal.name
    )
    return !hasDuplicate
  })

  return (
    <Modal
      isOpen={showModal}
      onClose={onClose}
      onOK={onClose}
      isLoading={isOverlayShow || isLoadingCalendars}
      title="Manage Calendars"
      modalSize="max-w-4xl"
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Select calendars from your configured calendars to use with this agent.
      </p>

      {/* Add Calendar Section */}
      {availableCalendarsToShow.length > 0 && (
        <div className="mb-6">
          <div className="flex gap-2 mb-3">
            <select
              value={selectedCalendarId}
              onChange={(e) => setSelectedCalendarId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select a calendar to add...</option>
              {availableCalendarsToShow.map((calendar) => (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.title} - {calendar.name} ({calendar.provider})
                </option>
              ))}
            </select>
            <button
              className="cursor-pointer bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleAddCalendar}
              disabled={!selectedCalendarId || isOverlayShow}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Selected Calendars */}
      {selectedCalendars.length > 0 ? (
        <div className="my-3 overflow-x-auto">
          <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Selected Calendars
          </h3>
          <Table>
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <th className="p-4 text-start">Name</th>
                <th className="p-4 text-start">Provider</th>
                <th className="p-4 text-start">Event Type ID</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedCalendars.map((calendar) => (
                <TableRow key={calendar.id}>
                  <TableCell className="break-all">
                    <span className="font-medium">Title:</span> {calendar.title} <br />
                    <span className="font-medium">Function Name:</span> {calendar.name}
                  </TableCell>
                  <TableCell>{calendar.provider}</TableCell>
                  <TableCell className="break-all">{calendar.event_type_id}</TableCell>
                  <TableCell>
                    <button
                      className="cursor-pointer text-red-600 hover:text-red-400 hover:bg-red-700/10 px-4 py-1.5 rounded transition-all duration-300"
                      onClick={() => calendar.id && handleRemoveCalendar(calendar.id)}
                      disabled={isOverlayShow}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No calendars selected. Add a calendar from the list above.</p>
        </div>
      )}

      {availableCalendars.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No calendars configured yet.</p>
          <p className="text-sm mt-2">
            Go to <a href="/settings/calendars" className="text-sky-600 hover:text-sky-400">Settings → Calendars</a> to configure calendars.
          </p>
        </div>
      )}
    </Modal>
  )
}

export default CalendarSelectionModal

