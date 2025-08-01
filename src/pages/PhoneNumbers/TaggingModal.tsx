import {
  Dispatch,
  FC,
  SetStateAction,
  useState,
} from "react";
import { FaTrash } from "react-icons/fa";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import { InputBox } from "../../library/FormField";
import Modal from "../../library/ModalProvider";
import { PhoneTypeRead } from "../../models/phone";

interface Props {
  phone: PhoneTypeRead | null;
  isOpen: boolean;
  isOverlayShow: boolean;
  setIsChanged: Dispatch<SetStateAction<boolean>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
  setSelectedPhone: Dispatch<SetStateAction<PhoneTypeRead | null>>;
}

export const TaggingModal: FC<Props> = ({
  phone,
  isOpen,
  isOverlayShow,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
  setSelectedPhone,
}) => {
  const [tags, setTags] = useState<string[]>([]);
  const [typingTag, setTypingTag] = useState<string>("");

  const onClose = () => {
    setIsOpen(false);
    setSelectedPhone(null);
  };
  const handleAddTag = () => {
    if (typingTag.trim()) {
      const newTerms = new Set([...tags, typingTag]);
      setTags(Array.from(new Set(newTerms)));
    }
    setTypingTag("");
  };
  const handleTagging = async () => {
    if (!phone) return;
    setIsOverlayShow(true);
    try {
      await axiosInstance.put(`/phones/${phone.id}/tags`, { tags });
      setIsChanged((prev) => !prev);
    } catch (error) {
      handleAxiosError('Failed to save tags', error);
    } finally {
      setIsOverlayShow(false);
    }
  };

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={isOpen}
      title={`Tags for Phone Number ${phone?.id}`}
      onOK={handleTagging}
      onClose={onClose}
      modalSize="max-w-xl"
      okBtnLabel="Save"
    >
      <div>
        <div className="my-5">
          <InputBox
            onChange={setTypingTag}
            value={typingTag}
            placeholder="Enter keywords separated by commas or enter key"
            onBlur={handleAddTag}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" ||
                e.key === "NumpadEnter" ||
                e.key === ","
              ) {
                handleAddTag();
              }
            }}
          />
          <div className="flex items-center flex-wrap mt-4 text-sm gap-x-3 gap-y-2">
            {tags.map((tag, index) => (
              <div
                key={`phrase-${index}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded border border-neutral-500"
              >
                <div className="text-gray-400">{tag}</div>
                <button
                  className="cursor-pointer text-gray-600 hover:text-gray-400 transition-colors duration-300"
                  onClick={() => {
                    setTags(tags.filter((_, i) => i !== index));
                  }}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
