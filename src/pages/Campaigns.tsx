import { Dispatch, FC, SetStateAction, useEffect, useState } from "react"
import { FaBullhorn, FaPlus, FaTrash } from "react-icons/fa"
import { Link } from "react-router-dom"

import { CampaignStatusBadge } from "../components/StatusBadge"
import axiosInstance, { handleAxiosError } from "../core/axiosInstance"
import Content from "../Layout/Content"
import { InputBox } from "../library/FormField"
import Modal from "../library/ModalProvider"
import Table, { TableCell, TableRow } from "../library/Table"
import { CampaignTypeRead } from "../models/campaign"
import { formatDateTime } from "../utils/helpers"

interface CreateCampaignModalProps {
  isCreateCampaignModalOpen: boolean
  isOverlayShow: boolean
  setIsChanged: Dispatch<SetStateAction<boolean>>
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>
  setIsCreateCampaignModalOpen: Dispatch<SetStateAction<boolean>>
}

const CreateCampaignModal: FC<CreateCampaignModalProps> = ({
  isCreateCampaignModalOpen,
  isOverlayShow,
  setIsChanged,
  setIsOverlayShow,
  setIsCreateCampaignModalOpen
}) => {
  const [createCampaignName, setCreateCampaignName] = useState('')

  const onClose = () => {
    setCreateCampaignName('')
    setIsCreateCampaignModalOpen(false)
  }
  const handleCreate = async () => {
    setIsOverlayShow(true)
    try {
      await axiosInstance.post(
        `/campaigns`,
        { name: createCampaignName }
      )
      setIsChanged(prev => !prev)
      onClose()
    } catch (error) {
      handleAxiosError('Failed to create a new campaign', error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Modal
      isOpen={isCreateCampaignModalOpen}
      title="Create Campaign"
      isLoading={isOverlayShow}
      onOK={handleCreate}
      okBtnLabel="Create"
      okBtnIcon={<FaPlus />}
      onClose={onClose}
    >
      <InputBox
        value={createCampaignName}
        onChange={(value) => setCreateCampaignName(value)}
        label="Campaign Name"
        inputClassName="w-full bg-transparent"
      />
    </Modal>
  )
}

const Campaigns = () => {
  const [isOverlayShow, setIsOverlayShow] = useState(false)
  const [isCreateCampaignModalOpen, setIsCreateCampaignModalOpen] = useState(false)
  const [isChanged, setIsChanged] = useState(false)
  const [campaigns, setCampaigns] = useState<CampaignTypeRead[]>([])

  useEffect(() => {
    const fetchCampaigns = async () => {
      setIsOverlayShow(true)
      try {
        const response = await axiosInstance.get(`/campaigns`)
        if (!response.data.length) {
          throw new Error(response.data.detail)
        }
        setCampaigns(response.data)
      } catch (error) {
        handleAxiosError('Failed to get campaigns', error)
      } finally {
        setIsOverlayShow(false)
      }
    }
    fetchCampaigns()
  }, [isChanged])

  const handleCreateCammpaignModalOpen = () => {
    setIsCreateCampaignModalOpen(true)
  }
  const handleDeleteCampaign = async (id: string) => {
    setIsOverlayShow(true)
    try {
      await axiosInstance.delete(`/campaigns/${id}`)
      setIsChanged(prev => !prev)
    } catch (error) {
      handleAxiosError('Failed to delete campaign', error)
    } finally {
      setIsOverlayShow(false)
    }
  }

  return (
    <Content isOverlayShown={isOverlayShow}>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">Campaigns</h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Manage your outbound campaigns
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <button
              className="flex gap-2 items-center cursor-pointer bg-sky-600 text-white px-5 py-2 rounded-md transition-all duration-300 hover:bg-sky-700"
              onClick={handleCreateCammpaignModalOpen}
            >
              <FaPlus />
              Create Campaign
            </button>
          </div>
        </div>
        <div className="flex flex-col justify-between h-full gap-4 rounded-lg dark:bg-gray-900/80 bg-white border dark:border-0 border-gray-300 overflow-x-auto">
          <Table>
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <TableCell>Campaign Name</TableCell>
                <TableCell>Caller</TableCell>
                <TableCell>Num of Records</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Link to={`/campaigns/${campaign.id}`}>
                        <div className="flex items-center gap-2">
                          {/* bg: rgb(29, 41, 57), text-color: rgb(151, 161, 186) */}
                          <div className="p-4 rounded-md flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                            <FaBullhorn size={16} />
                          </div>
                          <div>
                            {campaign.name}
                          </div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>{campaign.caller || "(Not set)"}</TableCell>
                    <TableCell>{campaign.records.length}</TableCell>
                    <TableCell>
                      <CampaignStatusBadge status={campaign.status} />
                    </TableCell>
                    <TableCell>{formatDateTime(campaign.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <button
                          className="p-3 cursor-pointer text-red-500 hover:text-white hover:bg-red-500/80 dark:hover:bg-red-500/20 rounded-full transition-all duration-300"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </tbody>
          </Table>
          {campaigns.length === 0 && (
            <div className="text-center m-4 p-6">
              <div className="text-gray-400">No Active Campaigns Found</div>
              <div className="my-3">
                <button
                  className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-4 py-2 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
                  onClick={handleCreateCammpaignModalOpen}
                >
                  <FaPlus />
                  Create Campaign
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <CreateCampaignModal
        isCreateCampaignModalOpen={isCreateCampaignModalOpen}
        isOverlayShow={isOverlayShow}
        setIsChanged={setIsChanged}
        setIsOverlayShow={setIsOverlayShow}
        setIsCreateCampaignModalOpen={setIsCreateCampaignModalOpen}
      />
    </Content>
  )
}

export default Campaigns

