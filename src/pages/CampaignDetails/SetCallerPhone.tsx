import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { toast } from "react-toastify"

import axiosInstance from "../../core/axiosInstance"
import Modal from "../../library/ModalProvider"
import { CampaignTypeRead } from "../../models/campaign"
import { PhoneTypeRead } from "../../models/phone"

interface Props {
  campaign: CampaignTypeRead
  isOpen: boolean
  isOverlayShow: boolean
  setIsChanged: Dispatch<SetStateAction<boolean>>
  setIsOpen: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
}

const SetCallerPhone: FC<Props> = ({
  campaign,
  isOpen,
  isOverlayShow,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
}: Props) => {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [phones, setPhones] = useState<PhoneTypeRead[]>([])

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        const response = await axiosInstance.get(`/phones`)
        const data = response.data
        setPhones(data)
      } catch (error) {
        console.error(error)
        toast.error(`Failed to fetch phones: ${error}`)
      }
    }
    fetchPhones()
  }, [])

  const onClose = () => {
    setIsOpen(false)
  }
  const onOK = async () => {
    if (!selectedPhone) return
    setIsOverlayShow(true)
    try {
      await axiosInstance.post(`/campaigns/${campaign.id}/set_caller`, { caller: selectedPhone })
      setIsChanged(true)
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(`Failed to set caller phone: ${error}`)
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Modal
      title="Select Phone"
      isOpen={isOpen}
      isLoading={isOverlayShow}
      onClose={onClose}
      onOK={onOK}
      okBtnLabel="Select"
    >
      <div>
        <div className="text-gray-400">Please select the phone from the list.</div>
        <select
          className="rounded-md text-gray-400 bg-neutral-800/50 border border-gray-700 w-full py-2 px-3 my-1 focus:border-sky-600 focus:outline-none transition-all duration-300"
          value={selectedPhone || ''}
          onChange={(e) => setSelectedPhone(e.target.value)}
        >
          <option className="bg-neutral-800" value="">Select a phone</option>
          {phones.map((phone) => (
            <option key={phone.id} className="bg-neutral-800" value={phone.id}>
              {phone.id}
            </option>
          ))}
        </select>
      </div>
    </Modal>
  )
}

export default SetCallerPhone
