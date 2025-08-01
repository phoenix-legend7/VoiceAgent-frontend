import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import Modal from "../../library/ModalProvider";
import { PhoneTypeRead } from "../../models/phone";

const configPlaceholder = `{
  "voice": {"provider": "elevenlabs", "voice_id": "Rachel"}
}`;

interface Props {
  isOpen: boolean;
  isOverlayShow: boolean;
  selectedPhoneNumber: PhoneTypeRead | null;
  setIsChanged: Dispatch<SetStateAction<boolean>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
  setSelectedPhoneNumber: Dispatch<SetStateAction<PhoneTypeRead | null>>;
}

export const SetAgentConfigModal: FC<Props> = ({
  isOpen,
  isOverlayShow,
  selectedPhoneNumber,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
  setSelectedPhoneNumber,
}) => {
  const [config, setConfig] = useState<string>("");

  useEffect(() => {
    if (!selectedPhoneNumber) return;
    setConfig(
      JSON.stringify(selectedPhoneNumber.agent_config_override, undefined, 2)
    );
  }, [selectedPhoneNumber]);

  const isValidJson = (text: string) => {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  };
  const handleSubmit = async () => {
    if (!selectedPhoneNumber) return;
    if (config && !isValidJson(config)) {
      toast.warning("Override Agent Config is not a valid JSON format.");
      return;
    }
    setIsOverlayShow(true);
    try {
      await axiosInstance.post(
        `/phones/${selectedPhoneNumber.id}/agent-config-override`,
        JSON.parse(config || "{}")
      );
      setIsChanged((prev) => !prev);
      onClose();
    } catch (error) {
      handleAxiosError('Failed to set agent', error);
    } finally {
      setIsOverlayShow(false);
    }
  };
  const onClose = () => {
    setConfig("");
    setIsOpen(false);
    setSelectedPhoneNumber(null);
  };
  const handleBeautify = () => {
    if (!config || !isValidJson(config)) {
      setConfig(config);
      return;
    }
    setConfig(JSON.stringify(JSON.parse(config), undefined, 2));
  };

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={isOpen}
      title={`Set Agent Config for Phone Number ${selectedPhoneNumber?.id}`}
      onOK={handleSubmit}
      onClose={onClose}
      modalSize="max-w-xl"
      okBtnLabel="Set"
    >
      <div>
        <div className="text-gray-600 dark:text-gray-400 mb-6">
          Customize the voice agent's behavior for this phone number by
          overriding its agent config. Simply provide the config that you want
          to override in JSON format.
        </div>
        <div className="flex flex-col">
          <div>Override Agent Config (JSON)</div>
          <div className="mt-2">
            <textarea
              className="w-full resize-none border border-gray-500 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:border-sky-500 transition-all duration-300"
              placeholder={configPlaceholder}
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              rows={4}
            />
          </div>
          <div className="text-end">
            <span
              className="cursor-pointer text-sky-600 hover:text-sky-800 dark:hover:text-sky-400 transition-colors duration-300"
              onClick={handleBeautify}
            >
              Beautify
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
