import axios from "axios";
import clsx from "clsx";
import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { FaEllipsisV, FaFileUpload, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import axiosInstance, { handleAxiosError } from "../core/axiosInstance";
import Content from "../Layout/Content";
import Modal from "../library/ModalProvider";
import { KnowledgeRead } from "../models/knowledge";
import { formatFileSize } from "../utils/helpers";

interface CreateKnowledgeModalProps {
  isOpen: boolean;
  isOverlayShow: boolean;
  setIsChanged: Dispatch<SetStateAction<boolean>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

export const CreateKnowledgeModal: FC<CreateKnowledgeModalProps> = ({
  isOpen,
  isOverlayShow,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const onClose = () => {
    setIsOpen(false);
    setFile(null);
  };
  const generatePresignedUrl = async (filename: string) => {
    const payload = { filename };
    const response = await axiosInstance.post(
      "knowledge/generate_presigned_url",
      payload
    );
    const data = response.data;
    if (!data.url) {
      throw new Error(data);
    }
    return data;
  };
  const uploadFileToAWS = async (
    key: string,
    awsAccessKeyId: string,
    awsSecurityToken: string,
    policy: string,
    signature: string,
    file: File
  ) => {
    const form = new FormData();
    form.append("key", key);
    form.append("AWSAccessKeyId", awsAccessKeyId);
    form.append("x-amz-security-token", awsSecurityToken);
    form.append("policy", policy);
    form.append("signature", signature);
    form.append("file", file);
    return axios.post(
      "https://millis-ai-agent-knowledge.s3.amazonaws.com/",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  };
  const onImport = async () => {
    if (!file || !description) {
      return;
    }
    setIsOverlayShow(true);
    try {
      const presignedUrl = await generatePresignedUrl(file.name);
      await uploadFileToAWS(
        presignedUrl.fields["key"],
        presignedUrl.fields["AWSAccessKeyId"],
        presignedUrl.fields["x-amz-security-token"],
        presignedUrl.fields["policy"],
        presignedUrl.fields["signature"],
        file
      );
      const data = {
        object_key: presignedUrl.fields.key,
        description: description,
        name: file.name,
        file_type: file.type,
        size: file.size,
      };
      await axiosInstance.post("/knowledge/create_file", data);
      setIsChanged((prev) => !prev);
      onClose();
    } catch (error) {
      handleAxiosError('Failed to create file', error);
    } finally {
      setIsOverlayShow(false);
    }
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  };
  const validateFile = (file: File): boolean => {
    if (!file) return false;

    const fileType = file.type;
    const fileSize = file.size / 1024 / 1024;
    const acceptedFileTypes = [
      "text/csv",
      "application/pdf",
      "text/plain",
      "application/json",
    ];

    if (!acceptedFileTypes.includes(fileType)) {
      toast.error(
        "Invalid file type. Accepted formats: .csv, .json, .txt, .pdf"
      );
      return false;
    }

    if (fileSize > 8) {
      toast.error("File size exceeds 8MB limit.");
      return false;
    }

    return true;
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = Array.from(e.dataTransfer.files)[0];
    const isValidFile = validateFile(file);
    if (isValidFile) {
      setFile(file);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files) {
      const file = Array.from(e.target.files)[0];
      const isValidFile = validateFile(file);
      if (isValidFile) {
        setFile(file);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      okBtnLabel="Upload"
      onOK={onImport}
      modalSize="max-w-xl"
      isLoading={isOverlayShow}
    >
      {!file ? (
        <div>
          <div
            className={clsx(
              "cursor-pointer border-dashed border border-sky-500 p-8 text-center rounded-xl hover:bg-sky-800 transition duration-300",
              isDragging ? "text-white" : "text-sky-500 hover:text-white",
              { "bg-sky-800": isDragging }
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="text/csv, application/pdf, text/plain, application/json"
              onChange={handleChange}
            />
            <FaFileUpload className="mx-auto mb-3 text-5xl" />
            <div className="text-sm">
              Browse files from your computer. Max size: 8mb. Accepted formats:
              .csv, .json, .txt, .pdf
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-4">
            <FaFileUpload className="text-4xl text-gray-600 dark:text-gray-400" />
            <div>
              <div className="text-lg">{file.name}</div>
              <div className="text-gray-500">{formatFileSize(file.size)}</div>
            </div>
            <div className="ml-auto mr-0">
              <button
                className="p-3 cursor-pointer text-red-500 hover:text-white hover:bg-red-500/20 rounded-full transition-all duration-300"
                onClick={() => setFile(null)}
              >
                <FaTrash className="text-red-500" size={16} />
              </button>
            </div>
          </div>
          {!!file && (
            <>
              <div className="my-6 flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
                <div className="px-2.5 text-center text-nowrap">
                  Description
                </div>
              </div>
              <div>
                <textarea
                  className="w-full h-24 resize-none border border-gray-600 rounded-md p-2 focus:outline-none focus:border-sky-500 transition-all duration-300"
                  placeholder="Explain what the document is about. Provide as many details as possible for agent to understand."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

interface KnowledgeActionProps {
  isOverlayShow: boolean;
  handleDelete: () => Promise<void>;
}
const KnowledgeAction: FC<KnowledgeActionProps> = ({
  isOverlayShow,
  handleDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && !(event.target as HTMLElement).closest('.agent-action-button')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="ml-auto mr-0 relative w-fit">
      <button
        className="cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-700 p-2 rounded-md transition-all duration-300 agent-action-button"
        onClick={() => setIsOpen(true)}
      >
        <FaEllipsisV />
      </button>
      {isOpen && (
        <div className="absolute right-full top-1/2 -translate-y-[66%] bg-gray-100 dark:bg-gray-950 rounded-md shadow-md py-2 z-50">
          <div className="flex flex-col">
            <button
              className="px-4 py-1.5 cursor-pointer text-left text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800"
              disabled={isOverlayShow}
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const AgentKnowledge = () => {
  const [isOverlayShow, setIsOverlayShow] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [knowledges, setKnowledges] = useState<KnowledgeRead[]>([]);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    const fetchKnowledges = async () => {
      setIsOverlayShow(true);
      try {
        const response = await axiosInstance.get("/knowledge/list_files");
        setKnowledges(response.data);
      } catch (error) {
        handleAxiosError('Failed to fetch files', error);
      } finally {
        setIsOverlayShow(false);
      }
    };
    fetchKnowledges();
  }, [isChanged]);

  const handleDelete = async (id: string) => {
    setIsOverlayShow(true);
    try {
      await axiosInstance.post("/knowledge/delete_file", { id });
      setKnowledges(knowledges.filter((file) => file.id !== id));
    } catch (error) {
      handleAxiosError('Failed to delete agent', error);
    } finally {
      setIsOverlayShow(false);
    }
  };

  return (
    <Content isOverlayShown={isOverlayShow}>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex justify-between flex-wrap gap-4">
          <div className="flex flex-col gap-1 justify-center">
            <h2 className="text-2xl font-bold">Documents</h2>
          </div>
          <div className="flex gap-2 items-center">
            <button
              className="flex gap-2 items-center cursor-pointer bg-sky-600 text-white px-5 py-2 rounded-md transition-all duration-300 hover:bg-sky-700"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <FaPlus />
              Add
            </button>
          </div>
        </div>
        {knowledges.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full py-6 gap-6">
            {knowledges.map((file) => (
              <div
                key={file.id}
                className="rounded-lg bg-white dark:bg-gray-800/60 border dark:border-0 border-gray-300 px-6 py-4 flex flex-col gap-2"
              >
                <div className="gap-3 flex justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-center w-fit px-3 py-0.5 text-xs text-center text-nowrap overflow-hidden border border-emerald-500 bg-emerald-200/20 dark:bg-emerald-800/20 text-emerald-500 font-bold rounded-xl">
                      {file.file_type}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-lg font-semibold line-clamp-2">
                        {file.name}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                  <KnowledgeAction
                    isOverlayShow={isOverlayShow}
                    handleDelete={() => handleDelete(file.id)}
                  />
                </div>
                <div className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                  {file.description}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-between h-full gap-4 rounded-lg bg-white dark:bg-gray-950/80 overflow-x-auto">
            <div className="w-full mt-6 text-center m-4 p-6">
              <div className="text-gray-600 dark:text-gray-400">No documents found</div>
              <div className="my-3">
                <button
                  className="flex gap-2 items-center cursor-pointer bg-transparent text-sky-600 border border-sky-600 px-4 py-2 mx-auto rounded-md transition-all duration-300 hover:bg-sky-600 hover:text-white"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <FaPlus />
                  Add Document
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <CreateKnowledgeModal
        isOpen={isCreateModalOpen}
        isOverlayShow={isOverlayShow}
        setIsChanged={setIsChanged}
        setIsOpen={setIsCreateModalOpen}
        setIsOverlayShow={setIsOverlayShow}
      />
    </Content>
  );
};

export default AgentKnowledge;
