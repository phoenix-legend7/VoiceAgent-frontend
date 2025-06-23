import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import Modal from "../../library/ModalProvider";
import Select from "../../library/Select";
import { CampaignInfoType, CampaignTypeRead } from "../../models/campaign";
import { SelectOptionType } from "../../models/common";

interface Props {
  campaign: CampaignTypeRead;
  campaignInfo: CampaignInfoType | undefined;
  isOpen: boolean;
  isOverlayShow: boolean;
  phoneOptions: SelectOptionType[];
  setIsChanged: Dispatch<SetStateAction<boolean>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
}

const SetCallerPhone: FC<Props> = ({
  campaign,
  campaignInfo,
  isOpen,
  isOverlayShow,
  phoneOptions,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
}: Props) => {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  useEffect(() => {
    if (campaignInfo?.caller) {
      setSelectedPhone(campaignInfo.caller);
    }
  }, [campaignInfo, isOpen]);

  const onClose = () => {
    setIsOpen(false);
  };
  const onOK = async () => {
    if (!selectedPhone) return;
    setIsOverlayShow(true);
    try {
      await axiosInstance.post(`/campaigns/${campaign.id}/set_caller`, {
        caller: selectedPhone,
      });
      setIsChanged(true);
      onClose();
    } catch (error) {
      handleAxiosError('Failed to set caller phone', error);
    } finally {
      setIsOverlayShow(false);
    }
  };

  return (
    <Modal
      title="Select Phone"
      isOpen={isOpen}
      isLoading={isOverlayShow}
      onClose={onClose}
      onOK={onOK}
      okBtnLabel="Select"
    >
      <div>
        <div className="text-gray-400">
          Please select the phone from the list.
        </div>
        <Select
          className="text-xs"
          menuClassName="text-xs"
          isSearchable
          options={phoneOptions}
          value={phoneOptions.find((p) => p.value === selectedPhone)}
          onChange={(e) =>
            setSelectedPhone((e as SelectOptionType).value as string)
          }
          placeholder="Select a phone"
        />
      </div>
    </Modal>
  );
};

export default SetCallerPhone;
