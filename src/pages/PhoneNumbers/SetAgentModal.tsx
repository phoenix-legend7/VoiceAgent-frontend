import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaUserAlt } from "react-icons/fa";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import Modal from "../../library/ModalProvider";
import Select from "../../library/Select";
import { AgentTypeRead } from "../../models/agent";
import { SelectOptionType } from "../../models/common";
import { PhoneTypeRead } from "../../models/phone";

interface Props {
  agents: AgentTypeRead[];
  isOpen: boolean;
  isOverlayShow: boolean;
  selectedPhoneNumber: PhoneTypeRead | null;
  setIsChanged: Dispatch<SetStateAction<boolean>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
  setSelectedPhoneNumber: Dispatch<SetStateAction<PhoneTypeRead | null>>;
}

export const SetAgentModal: FC<Props> = ({
  agents,
  isOpen,
  isOverlayShow,
  selectedPhoneNumber,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
  setSelectedPhoneNumber,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AgentTypeRead>();

  const agentOptions = useMemo(() => {
    return agents.map((agent) => ({
      value: agent.id,
      label: agent.name,
      icon: (
        <div className="bg-gray-500 rounded p-3">
          <FaUserAlt size={20} />
        </div>
      ),
    }));
  }, [agents]);

  useEffect(() => {
    setSelectedAgent(
      agents.find((agent) => agent.id === selectedPhoneNumber?.agent_id)
    );
  }, [agents, selectedPhoneNumber]);

  const handleSet = async (agent?: AgentTypeRead) => {
    if (!selectedPhoneNumber) return;
    setIsOverlayShow(true);
    try {
      const response = await axiosInstance.post("/set_phone_agent", {
        phone: selectedPhoneNumber.id,
        agent_id: agent?.id,
      });
      const data = response.data;
      if (data !== "ok") {
        throw new Error(data.details);
      }
      setIsChanged((prev) => !prev);
      onClose();
    } catch (error) {
      handleAxiosError('Failed to set agent', error);
    } finally {
      setIsOverlayShow(false);
    }
  };
  const onClose = () => {
    setSelectedAgent(undefined);
    setIsOpen(false);
    setSelectedPhoneNumber(null);
  };

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={isOpen}
      title="Select Agent"
      onOK={() => handleSet(selectedAgent)}
      onClose={onClose}
      modalSize="max-w-xl"
      okBtnLabel="Set"
    >
      <div>
        <Select
          options={agentOptions}
          value={agentOptions.find(
            (option) => option.value === selectedAgent?.id
          )}
          onChange={(option) => {
            if (option) {
              setSelectedAgent(
                agents.find(
                  (agent) => agent.id === (option as SelectOptionType).value
                )
              );
            } else {
              setSelectedAgent(undefined);
            }
          }}
          placeholder="Select Agent"
        />
        {!!selectedPhoneNumber?.agent_id && (
          <>
            <div className="my-6 flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
              <div className="px-2.5 text-center text-nowrap">OR</div>
            </div>
            <button
              className="w-full cursor-pointer rounded-md border border-red-600 py-2 text-center text-red-600 hover:border-red-400 hover:bg-red-600/10 hover:text-red-400 transition-all duration-300"
              onClick={() => handleSet()}
            >
              Unlink Agent
            </button>
          </>
        )}
      </div>
    </Modal>
  );
};
