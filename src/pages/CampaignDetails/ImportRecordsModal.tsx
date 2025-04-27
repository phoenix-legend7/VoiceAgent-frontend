import clsx from "clsx"
import * as Papa from 'papaparse'
import { Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react"
import { FaFileCsv } from "react-icons/fa"
import { toast } from "react-toastify"

import axiosInstance from "../../core/axiosInstance"
import Modal from "../../library/ModalProvider"
import Table, { TableCell, TableRow } from "../../library/Table"
import { CampaignTypeRead } from "../../models/campaign"

interface ImportRecordsModalProps {
  campaign: CampaignTypeRead
  isOpen: boolean
  isOverlayShow: boolean
  setIsChanged: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

const ImportRecordModal: FC<ImportRecordsModalProps> = ({
  campaign,
  isOpen,
  isOverlayShow,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [fileData, setFileData] = useState<{ [key: string]: string }[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [selectedPhoneColumn, setSelectedPhoneColumn] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const onClose = () => {
    setIsOpen(false)
    setFile(null)
  };
  const onImport = async () => {
    if (!file || !selectedPhoneColumn || !validateColumn()) {
      return
    }
    setIsOverlayShow(true)
    try {
      const newRecords = fileData.map((row) => {
        const metadata = structuredClone(row)
        delete metadata[selectedPhoneColumn]
        return {
          phone: row[selectedPhoneColumn],
          metadata,
        }
      })
      const response = await axiosInstance.post(`/campaigns/${campaign.id}/records`, newRecords)
      if (response.data !== 'ok') {
        throw new Error(response.data)
      }
      setIsChanged(prev => !prev)
      onClose()
    } catch (error) {
      console.error(error)
      toast.error(`Failed to import records: ${error}`)
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }
  const validateFile = (file: File): boolean => {
    if (!file) return false

    const fileType = file.type
    const fileSize = file.size / 1024 / 1024

    if (fileType !== 'text/csv') {
      toast.error('Invalid file type. Please select a CSV file.')
      return false
    }

    if (fileSize > 8) {
      toast.error('File size exceeds 8MB limit.')
      return false
    }

    return true
  }
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = Array.from(e.dataTransfer.files)[0]
    const isValidFile = validateFile(file)
    if (isValidFile) {
      setFile(file)
    }
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files) {
      const file = Array.from(e.target.files)[0]
      const isValidFile = validateFile(file)
      if (isValidFile) {
        setFile(file)
      }
    }
  }
  const validateColumn = () => {
    if (!selectedPhoneColumn) {
      return true
    }
    const phoneRegex = /^\+?([0-9]{1,3})?[-. ]?([0-9]{2,4})[-. ]?([0-9]{6,10})$/
    return phoneRegex.test(selectedPhoneColumn)
  }

  useEffect(() => {
    if (!file) {
      setFileData([])
      setHeaders([])
      setSelectedPhoneColumn(null)
      return
    }
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setHeaders(results.meta.fields || [])
        const data = results.data as { [key: string]: string; }[]
        setFileData(data.filter((row) => {
          return Object.values(row).some((value) => {
            return (value || '').trim() !== ''
          })
        }))
      },
      error: (error) => {
        console.error('Error parsing CSV:', error)
        toast.error(`Failed to parse CSV: ${error}`)
      }
    })
  }, [file])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Records"
      okBtnLabel="Import"
      onOK={onImport}
      modalSize="max-w-xl"
      isLoading={isOverlayShow}
    >
      {!file ? (
        <div>
          <div className="mb-4">Please select a CSV file to import records.</div>
          <div
            className={clsx(
              'cursor-pointer border-dashed border border-sky-500 p-8 text-center rounded-xl hover:bg-sky-800 transition duration-300',
              isDragging ? 'text-white' : 'text-sky-500 hover:text-white',
              { 'bg-sky-800': isDragging }
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type='file'
              className='hidden'
              accept='text/csv'
              onChange={handleChange}
            />
            <FaFileCsv className="mx-auto mb-3 text-5xl" />
            <div className='text-sm'>
              Browse files from your computer. Max size: 8mb. Accepted formats: .csv
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-3">
            <div className="text-gray-400 uppercase">Select Phone Column</div>
            <div className="w-full">
              <select
                className="rounded-md text-gray-400 bg-neutral-800/50 border border-gray-700 w-full py-2 px-3 my-1 focus:border-sky-600 focus:outline-none transition-all duration-300"
                value={selectedPhoneColumn || ''}
                onChange={(e) => setSelectedPhoneColumn(e.target.value)}
              >
                <option className="bg-neutral-800" value="">Select a column</option>
                {headers.map((header) => (
                  <option key={header} className="bg-neutral-800" value={header}>
                    {header}
                  </option>
                ))}
              </select>
              {!selectedPhoneColumn && (
                <div className="text-xs text-red-500">Phone column is required</div>
              )}
              {!validateColumn() && (
                <div className="text-xs text-red-500 text-wrap">
                  Phone column must contain only valid phone numbers in format +1234567890
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 text-gray-400 uppercase">
            CSV Preview ({fileData.length} records)
          </div>
          <div className="overflow-x-auto mt-4">
            <Table>
              <thead>
                <tr className="text-gray-400 border-b border-gray-700">
                  {headers.map((header) => (
                    <th key={header} className="text-left font-normal p-4 text-nowrap">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fileData.map((row, index) => (
                  <TableRow key={index}>
                    {headers.map((header) => (
                      <TableCell key={header}>{row[header]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ImportRecordModal
