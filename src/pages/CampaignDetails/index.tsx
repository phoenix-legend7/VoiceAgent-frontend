import { useEffect, useState } from "react"
import { FaArrowLeft, FaPlus, FaStop } from "react-icons/fa"
import { Link, useParams } from "react-router-dom"
import { toast } from "react-toastify"

import axiosInstance from "../../core/axiosInstance"
import { CallStatusBadge, CampaignStatusBadge } from "../../components/StatusBadge"
import PaginationComponent from "../../components/PaginationComponent"
import Content from "../../Layout/Content"
import { SwtichWithLabel } from "../../library/FormField"
import Table, { TableCell, TableRow } from "../../library/Table"
import { CampaignTypeRead } from "../../models/campaign"
import NotFound from "../error/404"
import ImportRecordModal from "./ImportRecordsModal"
import AddRecordModal from "./AddRecordModal"
import ConfirmStartCampaign from "./ConfirmStart"
import SetCallerPhone from "./SetCallerPhone"

const CampaignDetails = () => {
  const { id } = useParams()
  const [campaign, setCampaign] = useState<CampaignTypeRead | null>(null)
  const [isChanged, setIsChanged] = useState(false)
  const [isOverlayShow, setIsOverlayShow] = useState(true)
  const [isImportRecordModalOpen, setIsImportRecordModalOpen] = useState(false)
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false)
  const [isConfirmStartModalOpen, setIsConfirmStartModalOpen] = useState(false)
  const [isSetCallerPhoneModalOpen, setIsCallerPhoneModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const limit = 10

  useEffect(() => {
    const fetchCampaign = async () => {
      setIsOverlayShow(true)
      try {
        const response = await axiosInstance.get(`/campaigns/${id}`)
        const data = response.data
        setCampaign(data)
      } catch (error) {
        console.error(error)
        toast.error(`Failed to fetch campaign: ${error}`)
      } finally {
        setIsOverlayShow(false)
      }
    }
    fetchCampaign()
  }, [id, isChanged])

  const handleIncludeMetaData = async () => {
    // try {
    //   const response = await axiosInstance.put(`/campaigns/${id}/include-metadata`)
    //   const data = response.data
    //   setCampaign(data)
    // } catch (error) {
    //   console.error(error)
    //   toast.error(`Failed to include metadata: ${error}`)
    // }
  }
  const handleStartCampaign = async () => {
    setIsOverlayShow(true)
    try {
      const response = await axiosInstance.post(`/campaigns/${id}/start`)
      const data = response.data
      if (data !== 'ok') {
        throw new Error(data.detail)
      }
      setIsChanged(prev => !prev)
    } catch (error) {
      console.error(error)
      toast.error(`Failed to start campaign: ${error}`)
    } finally {
      setIsOverlayShow(false)
    }
  }
  const handleStopCampaign = async () => {
    setIsOverlayShow(true)
    try {
      const response = await axiosInstance.post(`/campaigns/${id}/stop`)
      const data = response.data
      if (data !== 'ok') {
        throw new Error(data.detail)
      }
      setIsChanged(prev => !prev)
    } catch (error) {
      console.error(error)
      toast.error(`Failed to stop campaign: ${error}`)
    } finally {
      setIsOverlayShow(false)
    }
  }
  // const handleDeleteRecord = async (index: number) => {
  //   if (!campaign) return
  //   const newRecords = campaign.records.splice(index, 1)
  //   setIsOverlayShow(true)
  //   try {
  //     await axiosInstance.post(`/campaigns/${campaign.id}/records`, newRecords)
  //     setIsChanged(prev => !prev)
  //   } catch (error) {
  //     console.error(error)
  //     toast.error(`Failed to delete record: ${error}`)
  //   } finally {
  //     setIsOverlayShow(false)
  //   }
  // }

  return (
    <Content isOverlayShown={isOverlayShow}>
      {campaign ? (
        <div>
          <div className="flex">
            <Link to="/campaigns" className="flex gap-2 items-center text-sm p-2 rounded hover:bg-gray-800 transition-all duration-300">
              <FaArrowLeft />
              <div>Campaigns - List</div>
            </Link>
          </div>
          <div className="mt-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="text-2xl font-semibold">Campaign: {campaign.name}</div>
              <div className="flex gap-x-4 gap-y-2 flex-wrap">
                <button
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 font-bold text-sky-600 hover:text-sky-500 border border-sky-600 rounded hover:border-sky-500 transition-all duration-300"
                  onClick={() => setIsImportRecordModalOpen(true)}
                >
                  <FaPlus />
                  Import
                </button>
                <button
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 font-bold text-sky-600 hover:text-sky-500 border border-sky-600 rounded hover:border-sky-500 transition-all duration-300"
                  onClick={() => setIsAddRecordModalOpen(true)}
                >
                  <FaPlus />
                  Add Record
                </button>
                {campaign.status === 'started' ? (
                  <button
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 font-bold bg-sky-800 rounded hover:bg-sky-700 transition-all duration-300"
                    onClick={handleStopCampaign}
                  >
                    <FaStop />
                    Stop
                  </button>
                ) : (
                  <button
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 font-bold bg-sky-800 rounded hover:bg-sky-700 transition-all duration-300"
                    onClick={() => setIsConfirmStartModalOpen(true)}
                  >
                    <FaPlus />
                    Start
                  </button>
                )}
              </div>
            </div>
            <div className="mt-8 rounded-xl text-sm bg-gray-900">
              <div className="flex flex-wrap">
                <div className="p-4 w-full sm:1/2 lg:w-1/3 xl:w-1/4">
                  <div className="font-bold text-gray-400 uppercase mb-2">
                    Caller
                  </div>
                  <button
                    className="cursor-pointer px-4 py-2 font-bold text-sky-600 hover:text-sky-500 border border-sky-600 rounded hover:border-sky-500 transition-all duration-300"
                    onClick={() => setIsCallerPhoneModalOpen(true)}
                  >
                    Set Caller Phone
                  </button>
                </div>
                <div className="p-4 w-full sm:1/2 lg:w-1/3 xl:w-1/4">
                  <div className="font-bold text-gray-400 uppercase mb-2">
                    Status
                  </div>
                  <CampaignStatusBadge status={campaign.status} />
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <SwtichWithLabel
                onChange={handleIncludeMetaData}
                value={false}
              />
              <div>Include extra metadata in agent prompt</div>
            </div>
            <div className="mt-8">
              <PaginationComponent
                currentPage={currentPage}
                limit={limit}
                setPage={setCurrentPage}
                totalCounts={campaign.records.length}
              />
            </div>
            <div className="mt-3 rounded-xl text-sm bg-gray-900 overflow-x-auto">
              <Table>
                <thead>
                  <tr className="border-b border-gray-700">
                    <TableCell>Phone</TableCell>
                    <TableCell>Call Status</TableCell>
                    <TableCell>Metadata</TableCell>
                    {/* <TableCell /> */}
                  </tr>
                </thead>
                <tbody>
                  {campaign.records.slice(currentPage * limit - limit, currentPage * limit).map((record, index) => (
                    <TableRow key={`record-${index}`}>
                      <TableCell>{record.phone}</TableCell>
                      <TableCell>
                        <CallStatusBadge status={record.call_status} />
                      </TableCell>
                      <TableCell>
                        {Object.keys(record.metadata).map((key, index) => (
                          <div key={`metadata-${index}`}>
                            <span className="font-bold">{key}: </span>
                            <span>{record.metadata[key]}</span>
                          </div>
                        ))}
                      </TableCell>
                      {/* <TableCell>
                        <button
                          className="p-3 cursor-pointer text-red-500 hover:text-white hover:bg-red-500/20 rounded-full transition-all duration-300"
                          onClick={() => handleDeleteRecord(index)}
                        >
                          <FaTrash />
                        </button>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </tbody>
              </Table>
              {campaign.records.length === 0 && (
                <div className="text-center m-4 p-6">
                  <div className="text-gray-400">No campaign record found</div>
                  <div className="my-3">
                    <button
                      className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-4 py-2 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
                      onClick={() => setIsAddRecordModalOpen(true)}
                    >
                      <FaPlus />
                      Add Record
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="my-3">
              <PaginationComponent
                currentPage={currentPage}
                limit={limit}
                setPage={setCurrentPage}
                totalCounts={campaign.records.length}
              />
            </div>
          </div>
          <ImportRecordModal
            campaign={campaign}
            isOpen={isImportRecordModalOpen}
            isOverlayShow={isOverlayShow}
            setIsChanged={setIsChanged}
            setIsOpen={setIsImportRecordModalOpen}
            setIsOverlayShow={setIsOverlayShow}
          />
          <AddRecordModal
            campaign={campaign}
            isOpen={isAddRecordModalOpen}
            isOverlayShow={isOverlayShow}
            setIsChanged={setIsChanged}
            setIsOpen={setIsAddRecordModalOpen}
            setIsOverlayShow={setIsOverlayShow}
          />
          <ConfirmStartCampaign
            isOpen={isConfirmStartModalOpen}
            onConfirm={handleStartCampaign}
            setIsOpen={setIsConfirmStartModalOpen}
            message="Are you sure you want to start this campaign?"
          />
          <SetCallerPhone
            campaign={campaign}
            isOpen={isSetCallerPhoneModalOpen}
            isOverlayShow={isOverlayShow}
            setIsChanged={setIsChanged}
            setIsOpen={setIsCallerPhoneModalOpen}
            setIsOverlayShow={setIsOverlayShow}
          />
        </div>
      ) : (
        <NotFound />
      )}
    </Content>
  )
}

export default CampaignDetails
