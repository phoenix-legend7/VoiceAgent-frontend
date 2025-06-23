import { Dispatch, FC, SetStateAction, useState } from "react"
import { FaPlus, FaTrash } from "react-icons/fa"

import axiosInstance, { handleAxiosError } from "../../core/axiosInstance"
import Modal from "../../library/ModalProvider"
import { CampaignTypeRead } from "../../models/campaign"
import { InputBox } from "../../library/FormField"

interface AddRecordsModalProps {
  campaign: CampaignTypeRead
  isOpen: boolean
  isOverlayShow: boolean
  setIsChanged: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

const AddRecordModal: FC<AddRecordsModalProps> = ({
  campaign,
  isOpen,
  isOverlayShow,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [metadata, setMetadata] = useState<{ [key: string]: string }>({})
  const [newMetadataKey, setNewMetadataKey] = useState('')
  const [newMetadataValue, setNewMetadataValue] = useState('')

  const onClose = () => {
    setPhoneNumber('')
    setMetadata({})
    setNewMetadataKey('')
    setNewMetadataValue('')
    setIsOpen(false)
  };
  const onImport = async () => {
    if (!phoneNumber || !validateColumn()) {
      return
    }
    setIsOverlayShow(true)
    try {
      const newRecords = [{
        phone: phoneNumber,
        metadata: structuredClone(metadata),
      }]
      if (newMetadataKey && newMetadataValue) {
        newRecords[0].metadata[newMetadataKey] = newMetadataValue
      }
      const response = await axiosInstance.post(`/campaigns/${campaign.id}/records`, newRecords)
      if (response.data !== 'ok') {
        throw new Error(response.data)
      }
      setIsChanged(prev => !prev)
      onClose()
    } catch (error) {
      handleAxiosError('Failed to add record', error)
    } finally {
      setIsOverlayShow(false)
    }
  }
  const validateColumn = () => {
    const phoneRegex = /^\+?([0-9]{1,3})?[-. ]?([0-9]{2,4})[-. ]?([0-9]{6,10})$/
    return phoneRegex.test(phoneNumber)
  }
  const getInvalidPhoneMessage = () => {
    if (!phoneNumber) {
      return 'Phone number is required'
    }
    if (!validateColumn()) {
      return 'Phone number must contain only numbers and plus signs. No spaces or special characters.'
    }
  }
  const handleDeleteMetadata = (key: string) => {
    const newMetadata = { ...metadata }
    delete newMetadata[key]
    setMetadata(newMetadata)
  }
  const handleAddMetadata = () => {
    if (!newMetadataKey || !newMetadataValue) {
      return
    }
    setMetadata({ ...metadata, [newMetadataKey]: newMetadataValue })
    setNewMetadataKey('')
    setNewMetadataValue('')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Campaign Record"
      okBtnLabel="Create"
      onOK={onImport}
      modalSize="max-w-xl"
      isLoading={isOverlayShow}
    >
      <div>
        <div className="text-gray-400">
          Please enter the phone number and metadata for the campaign record.
        </div>
        <InputBox
          onChange={(e) => setPhoneNumber(e)}
          value={phoneNumber}
          label="Phone Number"
          placeholder='i.e. "+15555555555"'
          inputClassName="bg-transparent"
          invalidText={getInvalidPhoneMessage()}
        />
        <div className="text-lg mt-4 font-bold">Extra Metadata</div>
        <div className="flex flex-col gap-4 mt-4">
          {Object.keys(metadata).map((key) => (
            <div className="flex gap-2 items-center">
              <InputBox
                onChange={() => { }}
                value={key}
                disabled
              />
              <InputBox
                onChange={() => { }}
                value={metadata[key]}
                disabled
              />
              <button
                className="cursor-pointer p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
                onClick={() => handleDeleteMetadata(key)}
              >
                <FaTrash />
              </button>
            </div>
          ))}
          <div className="flex gap-2 items-center">
            <InputBox
              onChange={(e) => setNewMetadataKey(e)}
              value={newMetadataKey}
              label="New Key"
              placeholder='i.e. "name", "email"'
              inputClassName="bg-transparent"
            />
            <InputBox
              onChange={(e) => setNewMetadataValue(e)}
              value={newMetadataValue}
              label="New Value"
              placeholder='i.e. "John Doe", "h5XpN@example.com"'
              inputClassName="bg-transparent"
            />
            <button
              className="cursor-pointer p-3 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
              onClick={handleAddMetadata}
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default AddRecordModal
