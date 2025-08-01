import { Dispatch, FC, SetStateAction } from "react";
import { FaExclamationCircle } from "react-icons/fa";
import Modal from "../../library/ModalProvider";

interface Props {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const ConfirmStartCampaign: FC<Props> = ({ isOpen, message, onConfirm, setIsOpen }) => {
  const onClose = () => {
    setIsOpen(false)
  };
  const onOK = () => {
    onConfirm()
    onClose()
  };
  return (
    <Modal
      isOpen={isOpen}
      title="Confirm start"
      headerIcon={<FaExclamationCircle size={24} className="text-red-500" />}
      onOK={onOK}
      onClose={onClose}
      okBtnLabel="Confirm"
    >
      <div>{message}</div>
    </Modal>
  )
}

export default ConfirmStartCampaign;
