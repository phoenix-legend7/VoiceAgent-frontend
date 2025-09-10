import { SetStateAction, Dispatch, useEffect, useState } from "react";
import {
  FaDownload,
  FaEdit,
  FaEllipsisV,
  FaPhoneAlt,
  FaUserAlt,
} from "react-icons/fa";

import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import Content from "../../Layout/Content";
import Table, { TableCell, TableRow } from "../../library/Table";
import { AgentTypeRead } from "../../models/agent";
import { PhoneTypeRead } from "../../models/phone";
import { formatDateTime } from "../../utils/helpers";
import { ImportNumberModal } from "./ImportNumberModal";
import { PurchaseModal } from "./PurchaseModal";
import { SetAgentModal } from "./SetAgentModal";
import { SetAgentConfigModal } from "./SetAgentConfigModal";
import { TaggingModal } from "./TaggingModal";

interface ActionProps {
  phone: PhoneTypeRead;
  setIsChanged: Dispatch<SetStateAction<boolean>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
  setIsSetConfigModalOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedPhoneNumber: Dispatch<SetStateAction<PhoneTypeRead | null>>;
  setTaggingModalOpen: Dispatch<SetStateAction<boolean>>;
}

const PhoneAction: React.FC<ActionProps> = ({
  phone,
  setIsChanged,
  setIsOverlayShow,
  setIsSetConfigModalOpen,
  setSelectedPhoneNumber,
  setTaggingModalOpen,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        !(event.target as HTMLElement).closest(".agent-action-button")
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  const handleSetAgentConfig = () => {
    setSelectedPhoneNumber(phone);
    setIsSetConfigModalOpen(true);
  };
  const handleTagging = () => {
    setSelectedPhoneNumber(phone);
    setTaggingModalOpen(true);
  };
  const handleDelete = async () => {
    setIsOverlayShow(true);
    try {
      await axiosInstance.delete(`/phones/${phone.id}`);
      setIsChanged((prev) => !prev);
    } catch (error) {
      handleAxiosError('Failed to delete phone', error);
    } finally {
      setIsOverlayShow(false);
    }
  };

  return (
    <>
      <div className="ml-auto mr-0 relative w-fit">
        <button
          className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded-md transition-all duration-300 agent-action-button"
          onClick={() => setIsOpen(true)}
        >
          <FaEllipsisV />
        </button>
        {isOpen && (
          <div className="absolute right-full top-1/2 -translate-y-[66%] bg-white dark:bg-gray-950 border dark:border-0 border-gray-300 rounded-md shadow-md py-2 z-50">
            <div className="flex flex-col text-nowrap">
              <button
                className="px-4 py-1.5 cursor-pointer text-left text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={handleSetAgentConfig}
              >
                Set Agent Config
              </button>
              <button
                className="px-4 py-1.5 cursor-pointer text-left text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={handleTagging}
              >
                Tagging
              </button>
              <button
                className="px-4 py-1.5 cursor-pointer text-left text-red-700 dark:text-red-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const PhoneNumbers = () => {
  const [isOverlayShow, setIsOverlayShow] = useState(false);
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneTypeRead[]>([]);
  const [agents, setAgents] = useState<AgentTypeRead[]>([]);
  const [isChanged, setIsChanged] = useState(false);
  const [isSetAgentModalOpen, setIsSetAgentModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSetConfigModalOpen, setIsSetConfigModalOpen] = useState(false);
  const [isTaggingModalOpen, setTaggingModalOpen] = useState(false);
  const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState<PhoneTypeRead | null>(
    null
  );

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await axiosInstance.get(`/agent`);
        const data = response.data;
        setAgents(data);
      } catch (error) {
        handleAxiosError('Failed to fetch agents', error);
      }
    };
    fetchAgents();
  }, []);
  useEffect(() => {
    const fetchPhones = async () => {
      setIsOverlayShow(true);
      try {
        const response = await axiosInstance.get(`/phones`);
        const data = response.data;
        setPhoneNumbers(data);
      } catch (error) {
        handleAxiosError('Failed to fetch phone numbers', error);
      } finally {
        setIsOverlayShow(false);
      }
    };
    fetchPhones();
  }, [isChanged]);

  return (
    <Content isOverlayShown={isOverlayShow}>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between flex-wrap gap-4">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            Phone Numbers
          </h2>
          <div className="flex gap-2 items-center">
            <button
              className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-5 py-2 rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
              onClick={() => setIsImportModalOpen(true)}
            >
              <FaDownload />
              Import Number
            </button>
            {/* <button
              className="flex gap-2 items-center cursor-pointer bg-sky-600 text-white px-5 py-2 rounded-md transition-all duration-300 hover:bg-sky-700"
              onClick={() => setPurchaseModalOpen(true)}
            >
              <FaPlus />
              Buy Number
            </button> */}
          </div>
        </div>
        <div className="flex flex-col justify-between h-full gap-4 rounded-lg bg-white dark:bg-gray-900/80 border dark:border-0 border-gray-300 overflow-x-auto">
          <Table>
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-700">
                <TableCell>Phone</TableCell>
                <TableCell className="text-center">Agent</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">Region</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-400">Created</TableCell>
                <TableCell />
              </tr>
            </thead>
            <tbody>
              {phoneNumbers.map((phoneNumber, index) => {
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* bg: rgb(29, 41, 57), text-color: rgb(151, 161, 186) */}
                        <div className="p-3 rounded-md flex items-center justify-center bg-gray-300 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          <FaPhoneAlt size={14} />
                        </div>
                        <div>{phoneNumber.id}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {phoneNumber.agent_id ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="flex items-center rounded bg-gray-300 dark:bg-gray-800 py-1">
                            <FaUserAlt
                              size={24}
                              className="ml-2 min-w-6 rounded bg-gray-200 dark:bg-gray-900 p-1.5"
                            />
                            <div className="text-sm px-3">
                              {
                                agents.find(
                                  (agent) => agent.id === phoneNumber.agent_id
                                )?.name
                              }
                            </div>
                          </div>
                          <button
                            className="cursor-pointer rounded hover:bg-gray-300/50 dark:hover:bg-gray-800/50 p-2 transition-all duration-300"
                            onClick={() => {
                              setIsSetAgentModalOpen(true);
                              setSelectedPhone(phoneNumber);
                            }}
                            disabled={isOverlayShow}
                          >
                            <FaEdit className="text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="cursor-pointer bg-transparent text-sky-600 text-sm border border-sky-600 px-4 py-1.5 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
                          onClick={() => {
                            setIsSetAgentModalOpen(true);
                            setSelectedPhone(phoneNumber);
                          }}
                          disabled={isOverlayShow}
                        >
                          Link to Agent
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">us-west</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {formatDateTime(phoneNumber.create_at)}
                    </TableCell>
                    <TableCell>
                      <PhoneAction
                        phone={phoneNumber}
                        setIsChanged={setIsChanged}
                        setIsOverlayShow={setIsOverlayShow}
                        setIsSetConfigModalOpen={setIsSetConfigModalOpen}
                        setSelectedPhoneNumber={setSelectedPhone}
                        setTaggingModalOpen={setTaggingModalOpen}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </tbody>
          </Table>
          {!phoneNumbers.length && (
            <div className="text-center m-4 p-6">
              <div className="text-gray-600 dark:text-gray-400">No Active Phone Numbers Found</div>
              <div className="my-3">
                <button
                  className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-4 py-2 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
                  onClick={() => setIsImportModalOpen(true)}
                >
                  <FaDownload />
                  Import Number
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <SetAgentModal
        agents={agents}
        isOpen={isSetAgentModalOpen}
        isOverlayShow={isOverlayShow}
        selectedPhoneNumber={selectedPhone}
        setIsChanged={setIsChanged}
        setIsOpen={setIsSetAgentModalOpen}
        setIsOverlayShow={setIsOverlayShow}
        setSelectedPhoneNumber={setSelectedPhone}
      />
      <ImportNumberModal
        isOpen={isImportModalOpen}
        isOverlayShow={isOverlayShow}
        setIsChanged={setIsChanged}
        setIsOpen={setIsImportModalOpen}
        setIsOverlayShow={setIsOverlayShow}
      />
      <SetAgentConfigModal
        isOpen={isSetConfigModalOpen}
        isOverlayShow={isOverlayShow}
        selectedPhoneNumber={selectedPhone}
        setIsChanged={setIsChanged}
        setIsOpen={setIsSetConfigModalOpen}
        setIsOverlayShow={setIsOverlayShow}
        setSelectedPhoneNumber={setSelectedPhone}
      />
      <TaggingModal
        isOpen={isTaggingModalOpen}
        isOverlayShow={isOverlayShow}
        phone={selectedPhone}
        setIsChanged={setIsChanged}
        setIsOpen={setTaggingModalOpen}
        setIsOverlayShow={setIsOverlayShow}
        setSelectedPhone={setSelectedPhone}
      />
      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        isOverlayShow={isOverlayShow}
        setIsChanged={setIsChanged}
        setIsOpen={setPurchaseModalOpen}
        setIsOverlayShow={setIsOverlayShow}
      />
    </Content>
  );
};

export default PhoneNumbers;
