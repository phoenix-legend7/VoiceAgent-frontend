import clsx from "clsx";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaFileAlt, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance from "../../core/axiosInstance";
import Card from "../../library/Card";
import { InputBox } from "../../library/FormField";
import Modal from "../../library/ModalProvider";
import Table, { TableCell, TableRow } from "../../library/Table";
import { AgentTypeRead } from "../../models/agent";
import { KnowledgeRead } from "../../models/knowledge";
import { formatFileSize } from "../../utils/helpers";
import { CreateKnowledgeModal } from "../Knowledge";

interface ToolBarProps {
  handleEdit: () => void;
}

const ToolBar: FC<ToolBarProps> = ({ handleEdit }) => {
  return (
    <div>
      <button
        className="cursor-pointer border border-sky-600 text-white px-5 py-1.5 rounded-md hover:border-sky-700 hover:text-sky-400 transition-colors duration-300"
        onClick={handleEdit}
      >
        Edit
      </button>
    </div>
  );
};

interface EditKnowledgeModalProps {
  agent: AgentTypeRead;
  isOverlayShow: boolean;
  knowledges: KnowledgeRead[];
  showModal: boolean;
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setShowDocumentModal: Dispatch<SetStateAction<boolean>>;
}

const EditKnowledgeModal: FC<EditKnowledgeModalProps> = ({
  agent,
  isOverlayShow,
  knowledges,
  showModal,
  setAgent,
  setIsOverlayShow,
  setShowModal,
  setShowDocumentModal,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [activePhrase, setActivePhrase] = useState("");
  const [phrases, setPhrases] = useState<string[]>([]);
  const [stagedDocuments, setStagedDocuments] = useState<KnowledgeRead[]>([]);

  const filteredDocuments = useMemo(() => {
    return knowledges.filter(
      (document) => !stagedDocuments.some((sd) => sd.id === document.id)
    );
  }, [stagedDocuments]);

  const onClose = () => {
    setShowModal(false);
    setPhrases([]);
    setStagedDocuments([]);
    setActiveTab(0);
    setActivePhrase("");
  };
  const onSubmit = async () => {
    const editData = {
      name: agent.name,
      config: {
        knowledge_base: {
          files: stagedDocuments.map((d) => d.id),
        },
      },
    };
    setIsOverlayShow(true);
    try {
      await axiosInstance.put(`/agent/${agent.id}`, editData);
      toast.success("Agent updated successfully");
      setAgent({
        ...agent,
        config: {
          ...agent.config,
          ...editData.config,
        },
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update agent");
    } finally {
      setIsOverlayShow(false);
    }
  };

  useEffect(() => {
    const files = knowledges.filter(
      (file) => !!agent.config.knowledge_base?.files?.find((f) => f === file.id)
    );
    setStagedDocuments(files);
  }, [agent, knowledges, showModal]);

  return (
    <Modal
      isOpen={showModal}
      isLoading={isOverlayShow}
      title="Update Agent Knowledge"
      okBtnLabel="Save"
      onOK={onSubmit}
      onClose={onClose}
      modalSize="max-w-3xl"
    >
      <div className="flex items-center">
        {["Knowledge Base", "Configurations"].map((tab, index) => (
          <button
            key={index}
            className={clsx(
              "cursor-pointer px-5 py-2 w-full",
              activeTab === index
                ? "text-sky-400 border-b-2 border-sky-400"
                : "text-gray-400"
            )}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>
      <hr className="text-gray-800" />
      {activeTab === 0 && (
        <div>
          <div className="my-10 rounded-xl border border-gray-800 overflow-hidden">
            <div className="px-6 py-4">
              <div className="font-semibold text-lg">Added Documents</div>
              <p className="text-sm text-gray-400">
                Documents that the agent has already added as knowledge
              </p>
            </div>
            {stagedDocuments.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr className="text-gray-400 border-b border-t border-gray-800">
                      <th className="p-4 w-[40%]">Document</th>
                      <th className="p-4">Description</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {stagedDocuments.map((document, index) => (
                      <TableRow key={`staged-document-${index}`}>
                        <TableCell>
                          <div>{document.name}</div>
                          <div className="text-sm text-gray-400">
                            {formatFileSize(document.size)}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          <p
                            className="overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {document.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <button
                            className="cursor-pointer bg-red-500/5 text-red-500 hover:text-red-400 hover:bg-red-500/20 px-4 py-1.5 rounded transition-colors duration-300"
                            onClick={() =>
                              setStagedDocuments(
                                stagedDocuments.splice(index, 1)
                              )
                            }
                          >
                            Remove
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="p-6 mt-4 text-center text-gray-400 border-t border-gray-800">
                No files selected
              </div>
            )}
          </div>
          <hr className="text-gray-800" />
          <div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="font-semibold text-lg">Available Documents</div>
              <a
                href="#"
                className="text-sky-600 border border-sky-600 hover:text-sky-400 hover:border-sky-400 transition-all duration-300 px-4 py-1.5 rounded-md"
                onClick={() => setShowDocumentModal(true)}
              >
                Upload New Document
              </a>
            </div>
            {!!filteredDocuments.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-800">
                      <th className="p-4 w-[40%]">Document</th>
                      <th className="p-4">Description</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((document, index) => (
                      <TableRow key={`document-${index}`}>
                        <TableCell>
                          <div>{document.name}</div>
                          <div className="text-sm text-gray-400">
                            {formatFileSize(document.size)}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-400">
                          <p
                            className="overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {document.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <button
                            className="cursor-pointer bg-sky-500/5 text-sky-500 hover:text-sky-400 hover:bg-sky-500/20 px-4 py-1.5 rounded transition-colors duration-300"
                            onClick={() =>
                              setStagedDocuments([...stagedDocuments, document])
                            }
                          >
                            Add
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="p-6">
                <div className="my-4 text-gray-400 text-center">
                  No documents available
                </div>
                <button
                  className="flex items-center justify-self-center cursor-pointer text-sky-600 border border-sky-600 hover:text-sky-400 hover:border-sky-400 transition-all duration-300 px-4 py-1.5 rounded-md"
                  onClick={() => setShowDocumentModal(true)}
                >
                  <FaPlus />
                  Upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 1 && (
        <div className="my-8 flex flex-col gap-4">
          <div className="font-semibold mb-1.5 text-xl">Pre-Action Phrases</div>
          <p className="text-gray-400">
            Define the phrases your agent will say before searching for
            knowledge base. If left blank, the system will use pre-defined
            English* phrases like: "Let me check", "One sec", "Let me see",
            "Hold on", "Checking now", "One moment please" etc.
          </p>
          <InputBox
            label="Enter phrases separated by commas or enter key"
            inputClassName="bg-transparent"
            value={activePhrase}
            onChange={(e) => setActivePhrase(e)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "NumpadEnter" ||
                e.key === ","
              ) {
                e.preventDefault();
                setPhrases([...phrases, activePhrase]);
                setActivePhrase("");
              }
            }}
            onBlur={() => {
              if (activePhrase.trim() !== "") {
                setPhrases([...phrases, activePhrase]);
                setActivePhrase("");
              }
            }}
          />
          <div className="flex items-center flex-wrap mt-4 text-sm gap-x-3 gap-y-2">
            {phrases.map((phrase, index) => (
              <div
                key={`phrase-${index}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-neutral-500"
              >
                <div className="text-gray-400">{phrase}</div>
                <button
                  className="cursor-pointer text-gray-600 hover:text-gray-400 transition-colors duration-300"
                  onClick={() => {
                    setPhrases(phrases.filter((_, i) => i !== index));
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

interface Props {
  agent: AgentTypeRead;
  isOverlayShow: boolean;
  knowledges: KnowledgeRead[];
  setAgent: Dispatch<SetStateAction<AgentTypeRead | null>>;
  setIsChanged: Dispatch<SetStateAction<boolean>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
}

const KnowledgeCard: FC<Props> = ({
  agent,
  isOverlayShow,
  knowledges,
  setAgent,
  setIsChanged,
  setIsOverlayShow,
}) => {
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showEditKnowledgeModal, setShowEditKnowledgeModal] = useState(false);

  return (
    <>
      <Card
        title="Knowledge"
        icon={<FaFileAlt />}
        toolbar={<ToolBar handleEdit={() => setShowEditKnowledgeModal(true)} />}
      >
        {agent.config.knowledge_base?.files?.length ? (
          <div className="py-2">
            {agent.config.knowledge_base.files.map((id) => {
              const file = knowledges.find((f) => f.id === id);
              if (!file) return;
              return (
                <div
                  className="px-4 py-1 flex items-center gap-2 justify-between text-sm"
                  title={file.description}
                  key={id}
                >
                  <div className="my-1">{file.name}</div>
                  <div className="text-gray-400 text-nowrap">
                    {formatFileSize(file.size)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 m-4 mt-8">
            <p className="text-gray-400 text-sm">
              Upload documents to enrich your voice agent's knowledge base
            </p>
            <button
              className="cursor-pointer flex justify-self-center items-center gap-2 border border-sky-600 text-sky-600 mt-4 px-4 py-1.5 min-w-20 rounded-md hover:border-sky-400 hover:text-sky-400 transition-colors duration-300"
              onClick={() => setShowDocumentModal(true)}
            >
              <FaPlus />
              Add Document
            </button>
          </div>
        )}
      </Card>
      <EditKnowledgeModal
        agent={agent}
        isOverlayShow={isOverlayShow}
        knowledges={knowledges}
        showModal={showEditKnowledgeModal}
        setAgent={setAgent}
        setIsOverlayShow={setIsOverlayShow}
        setShowModal={setShowEditKnowledgeModal}
        setShowDocumentModal={setShowDocumentModal}
      />
      <CreateKnowledgeModal
        isOpen={showDocumentModal}
        setIsOpen={setShowDocumentModal}
        isOverlayShow={isOverlayShow}
        setIsChanged={setIsChanged}
        setIsOverlayShow={setIsOverlayShow}
      />
    </>
  );
};

export default KnowledgeCard;
