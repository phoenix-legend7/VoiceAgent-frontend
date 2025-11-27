import { useEffect, useState } from "react"
import SettingsLayout from "./SettingsLayout"
import Card from "../../library/Card"
import { Calendar, Plus, Trash2, Edit2 } from "lucide-react"
import { InputBox } from "../../library/FormField"
import { Button } from "../../components/ui/button"
import { toast } from "react-toastify"
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance"
import Modal from "../../library/ModalProvider"
import Select from "../../library/Select"
import { SelectOptionType } from "../../models/common"
import appTools from "../../consts/appTools"

export interface CalendarConfig {
  id?: string
  name: string
  provider: 'cal.com'
  api_key: string
  event_type_id: string
  contact_method?: 'email' | 'phone'
  title: string
}

const contactMethodOptions = [
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' }
]

const calendarFunctionOptions = appTools.map(tool => ({
  label: tool.description,
  value: tool.name
}))

const Calendars = () => {
  const [calendars, setCalendars] = useState<CalendarConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCalendar, setEditingCalendar] = useState<CalendarConfig | null>(null)

  // Form state
  const [name, setName] = useState<string>('get_available_meeting_slots')
  const [title, setTitle] = useState<string>('Get Available Meeting Slots')
  const [apiKey, setApiKey] = useState<string>('')
  const [eventTypeId, setEventTypeId] = useState<string>('')
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email')

  useEffect(() => {
    fetchCalendars()
  }, [])

  const fetchCalendars = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('/calendars')
      setCalendars(response.data || [])
    } catch (error) {
      handleAxiosError('Failed to fetch calendars', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName('get_available_meeting_slots')
    setTitle('Get Available Meeting Slots')
    setApiKey('')
    setEventTypeId('')
    setContactMethod('email')
    setEditingCalendar(null)
  }

  const handleOpenModal = (calendar?: CalendarConfig) => {
    if (calendar) {
      setEditingCalendar(calendar)
      setName(calendar.name)
      setTitle(calendar.title)
      setApiKey(calendar.api_key)
      setEventTypeId(calendar.event_type_id)
      setContactMethod(calendar.contact_method || 'email')
    } else {
      resetForm()
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    resetForm()
  }

  const handleSave = async () => {
    if (!name || !apiKey.trim() || !eventTypeId.trim()) {
      toast.warning('Calendar Function, API Key, and Event Type ID are required')
      return
    }

    setIsLoading(true)
    try {
      const calendarData: CalendarConfig = {
        name: name.trim(),
        title: title.trim(),
        provider: 'cal.com',
        api_key: apiKey.trim(),
        event_type_id: eventTypeId.trim(),
        contact_method: name === 'book_meeting_slot' ? contactMethod : undefined
      }

      if (editingCalendar?.id) {
        await axiosInstance.put(`/calendars/${editingCalendar.id}`, calendarData)
        toast.success('Calendar updated successfully')
      } else {
        await axiosInstance.post('/calendars', calendarData)
        toast.success('Calendar created successfully')
      }

      await fetchCalendars()
      handleCloseModal()
    } catch (error) {
      handleAxiosError('Failed to save calendar', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this calendar?')) {
      return
    }

    setIsLoading(true)
    try {
      await axiosInstance.delete(`/calendars/${id}`)
      toast.success('Calendar deleted successfully')
      await fetchCalendars()
    } catch (error) {
      handleAxiosError('Failed to delete calendar', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SettingsLayout isOverlayShown={isLoading}>
      <Card title="Calendar Management" icon={<Calendar size={22} />}>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage your calendar integrations. Configure credentials for getting available meetings and booking meetings.
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus size={16} className="mr-2" />
              Add Calendar
            </Button>
          </div>

          {calendars.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No calendars configured yet</p>
              <p className="text-sm mt-2">Click "Add Calendar" to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {calendars.map((calendar) => (
                <div
                  key={calendar.id}
                  className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{calendar.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                      <span className="font-medium">Function Name:</span> {calendar.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Provider: {calendar.provider}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Event Type ID: {calendar.event_type_id}
                    </div>
                    {calendar.contact_method && (
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Contact Method: {calendar.contact_method}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenModal(calendar)}
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => calendar.id && handleDelete(calendar.id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showModal}
        isLoading={isLoading}
        onClose={handleCloseModal}
        onOK={handleSave}
        title={editingCalendar ? 'Edit Calendar' : 'Add Calendar'}
        okBtnLabel={editingCalendar ? 'Update' : 'Create'}
      >
        <div className="flex flex-col gap-4 my-4">
          <InputBox
            value={title}
            label="Title"
            onChange={(e) => setTitle(e)}
            placeholder="Enter the name of the calendar function"
          />
          <div className="flex flex-col gap-2">
            <div className="text-gray-500 font-semibold">Calendar Function</div>
            <Select
              options={calendarFunctionOptions}
              value={calendarFunctionOptions.find((option) => option.value === name)}
              onChange={(e) => setName((e as SelectOptionType).value as string)}
              className="w-full"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-gray-500 font-semibold">Provider</div>
            <div className="px-3 py-1.5 rounded bg-gray-200 dark:bg-gray-800">cal.com</div>
          </div>
          <InputBox
            value={apiKey}
            label="API Key"
            onChange={(e) => setApiKey(e)}
            placeholder="Enter your cal.com API key"
            type="password"
          />
          <InputBox
            value={eventTypeId}
            label="Event Type ID"
            onChange={(e) => setEventTypeId(e)}
            placeholder="Enter your event type ID"
          />
          {name === 'book_meeting_slot' && (
            <div className="flex flex-col gap-2">
              <div className="text-gray-500 font-semibold">Contact Method</div>
              <Select
                options={contactMethodOptions}
                value={contactMethodOptions.find((option) => option.value === contactMethod)}
                onChange={(e) => setContactMethod((e as SelectOptionType).value as 'email' | 'phone')}
                className="w-full"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose preferred contact method during scheduling meeting, either a phone number or an email address.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </SettingsLayout>
  )
}

export default Calendars

