import { Dispatch, FC, SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import { InputBox } from "../../library/FormField";
import Modal from "../../library/ModalProvider";
import Select from "../../library/Select";
import { SelectOptionType } from "../../models/common";

const countryOptions = [
  { label: "United States", value: "US" },
  { label: "Canada", value: "CA" },
  { label: "Australia", value: "AU" },
  { label: "Puerto Rico", value: "PR" },
];

interface Props {
  isOpen: boolean;
  isOverlayShow: boolean;
  setIsChanged: Dispatch<SetStateAction<boolean>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
}

export const PurchaseModal: FC<Props> = ({
  isOpen,
  isOverlayShow,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
}) => {
  const [country, setCountry] = useState<string>("US");
  const [areaCode, setAreaCode] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [stateRegion, setStateRegion] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");

  const onClose = () => {
    setIsOpen(false);
    setCountry("US");
    setAreaCode("");
    setStreet("");
    setCity("");
    setStateRegion("");
    setPostalCode("");
  };
  const handlePurchase = async () => {
    if (!country) return;
    try {
      const payload: { [key: string]: string } = {
        country,
        area_code: areaCode,
        street,
        city,
        state_region: stateRegion,
        postal_code: postalCode,
      };
      if (country !== "PR") {
        if (!areaCode) {
          toast.warning("Area Code is required.");
          return;
        }
        if (country === "AU") {
          if (!street) {
            toast.warning("Street is required.");
            return;
          }
          if (!city) {
            toast.warning("City is required.");
            return;
          }
          if (!stateRegion) {
            toast.warning("State/Region is required.");
            return;
          }
          if (!postalCode) {
            toast.warning("Postal Code is required.");
            return;
          }
          payload.street = street;
          payload.city = city;
          payload.state_region = stateRegion;
          payload.postal_code = postalCode;
        }
      }
      payload.area_code = areaCode;
      setIsOverlayShow(true);
      await axiosInstance.post("/phones/purchase", payload);
      setIsChanged((prev) => !prev);
      onClose();
    } catch (error) {
      handleAxiosError('Failed to buy new number', error);
    } finally {
      setIsOverlayShow(false);
    }
  };

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={isOpen}
      title="Purchase Phone Number"
      onOK={handlePurchase}
      onClose={onClose}
      modalSize="max-w-xl"
      okBtnLabel="Save"
    >
      <div>
        <div className="flex flex-col gap-1">
          <div>Country</div>
          <Select
            options={countryOptions}
            value={countryOptions.find((option) => option.value === country)}
            onChange={(e) =>
              setCountry((e as SelectOptionType).value as string)
            }
          />
          <div className="text-gray-400 text-sm mx-3">
            Twilio requires additional information to purchase a phone number in
            this country. Please fill out the form below.
            <br />
            Cost: $3 / month
          </div>
        </div>
        {country !== "PR" && (
          <label className="flex flex-col gap-1 my-3">
            <div>Area Code</div>
            <InputBox
              value={areaCode}
              onChange={setAreaCode}
              placeholder="650"
            />
          </label>
        )}
        {country === "AU" && (
          <div>
            <div className="my-6 flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
              <div className="px-2.5 text-center text-nowrap">
                Additional Information
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1">
                <div>Street</div>
                <InputBox
                  value={street}
                  onChange={setStreet}
                  placeholder="123 Main St"
                />
              </label>
              <label className="flex flex-col gap-1">
                <div>City</div>
                <InputBox
                  value={city}
                  onChange={setCity}
                  placeholder="Sydney"
                />
              </label>
              <label className="flex flex-col gap-1">
                <div>State/Region</div>
                <InputBox
                  value={stateRegion}
                  onChange={setStateRegion}
                  placeholder="New South Wales"
                />
              </label>
              <label className="flex flex-col gap-1">
                <div>Postal Code</div>
                <InputBox
                  value={postalCode}
                  onChange={setPostalCode}
                  placeholder="2000"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
