import { Dispatch, FC, SetStateAction, useState } from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { toast } from "react-toastify";

import { countryPhoneOptions } from "../../consts/countryPhones";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import Modal from "../../library/ModalProvider";
import Select from "../../library/Select";
import { TabButton } from "../../library/Tab";
import { SelectOptionType } from "../../models/common";
import { InputBox } from "../../library/FormField";

const regionOptions = [
  { label: "US West", value: "us-west" },
  { label: "US East", value: "us-east" },
];
const domainOptions = [
  { label: "api.exotel.com (Singapore)", value: "api.exotel.com" },
  { label: "api.in.exotel.com (Mumbai)", value: "api.in.exotel.com" },
];

interface Props {
  isOpen: boolean;
  isOverlayShow: boolean;
  setIsChanged: Dispatch<SetStateAction<boolean>>;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setIsOverlayShow: Dispatch<SetStateAction<boolean>>;
}

export const ImportNumberModal: FC<Props> = ({
  isOpen,
  isOverlayShow,
  setIsChanged,
  setIsOpen,
  setIsOverlayShow,
}) => {
  const [activeTab, setActiveTab] = useState<string>("twilio");
  const [selectedRegion, setSelectedRegion] = useState<string>("us-west");
  const [selectedCountry, setSelectedCountry] = useState<string>("US");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [apiSecret, setApiSecret] = useState<string>("");
  const [accoutSid, setAccountSid] = useState<string>("");
  const [appId, setAppId] = useState<string>("");
  const [authId, setAuthId] = useState<string>("");
  const [authToken, setAuthToken] = useState<string>("");
  const [subdomain, setSubdomain] = useState<string>("api.exotel.com");

  const handleSubmit = async () => {
    if (!activeTab) return;
    if (!selectedRegion) {
      toast.warning("Region is required.");
      return;
    }
    if (!selectedCountry) {
      toast.warning("Country is required.");
      return;
    }
    if (!phoneNumber) {
      toast.warning("Phone Number is required.");
      return;
    }
    const label = countryPhoneOptions.find((p) => p.value === selectedCountry);
    if (!label) {
      toast.warning("Invalid country was detected.");
      return;
    }
    const area = label.label.split("(")[1].replace(")", "");
    if (!area) {
      toast.warning("Invalid country was detected.");
      return;
    }
    if (!phoneNumber.startsWith(area)) {
      toast.warning(`Phone Number must start with ${area}`);
      return;
    }
    try {
      const payload: { [key: string]: string } = {
        provider: activeTab,
        region: selectedRegion,
        country: selectedCountry,
        phone: phoneNumber,
      };
      if (activeTab === "plivo") {
        if (!authId) {
          toast.warning("Auth ID is required.");
          return;
        }
        if (!authToken) {
          toast.warning("Auth Token is required.");
          return;
        }
        payload.auth_id = authId;
        payload.auth_token = authToken;
      } else {
        if (!apiKey) {
          toast.warning("API Key is required.");
          return;
        }
        if (!apiSecret) {
          toast.warning(
            `API ${activeTab === "exotel" ? "Token" : "Secret"} is required.`
          );
          return;
        }
        payload.api_key = apiKey;
        payload.api_secret = apiSecret;
        if (activeTab !== "vanage") {
          if (!accoutSid) {
            toast.warning("Account SID is required.");
            return;
          }
          payload.account_sid = accoutSid;
        }
        if (activeTab === "exotel") {
          if (!domainOptions.find((d) => d.value === subdomain)) {
            toast.warning("Subdomain is required.");
            return;
          }
          if (!appId) {
            toast.warning("App ID is required.");
            return;
          }
          payload.subdomain = subdomain;
          payload.app_id = appId;
        }
      }
      setIsOverlayShow(true);
      try {
        const response = await axiosInstance.post("/phones/import", payload);
        const data = response.data;
        if (data !== "ok") {
          throw new Error(data.details);
        }
        setIsChanged((prev) => !prev);
        handleClose();
      } catch (error) {
        handleAxiosError('Failed to set agent', error);
      } finally {
        setIsOverlayShow(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsOverlayShow(false);
    }
  };
  const handleClose = () => {
    setIsOpen(false);
    setActiveTab("twilio");
    setSelectedRegion("us-west");
    setSelectedCountry("US");
    setPhoneNumber("");
    setApiKey("");
    setApiSecret("");
    setAccountSid("");
    setAppId("");
    setAuthId("");
    setAuthToken("");
    setSubdomain("api.exotel.com");
  };

  return (
    <Modal
      extraButtons={
        <a
          className="flex items-center gap-1 text-sky-500 mr-auto"
          href="https://millisai.mintlify.app/phone/import-phone-number"
        >
          <span className="underline">Tutorials</span>
          <FaExternalLinkAlt />
        </a>
      }
      isOpen={isOpen}
      isLoading={isOverlayShow}
      modalSize="max-w-xl"
      okBtnLabel="Import"
      onOK={handleSubmit}
      onClose={handleClose}
      title="Import Phone Number"
    >
      <div>
        <div className="flex items-center">
          {["twilio", "vanage", "plivo", "exotel"].map((tab) => (
            <TabButton
              key={tab}
              label={tab.toUpperCase()}
              onClick={() => setActiveTab(tab)}
              isActive={activeTab === tab}
            />
          ))}
        </div>
        <div className="py-4 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <div>Region</div>
            <Select
              options={regionOptions}
              value={regionOptions.find(
                (option) => option.value === selectedRegion
              )}
              onChange={(e) =>
                setSelectedRegion((e as SelectOptionType).value as string)
              }
            />
            <div className="text-gray-500 text-sm mx-3">
              Select the region matching your provider's account region. If
              unsure, choose based on call destination.
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div>Country</div>
            <Select
              options={countryPhoneOptions}
              value={countryPhoneOptions.find(
                (option) => option.value === selectedCountry
              )}
              onChange={(e) =>
                setSelectedCountry((e as SelectOptionType).value as string)
              }
            />
          </div>
          <label className="flex flex-col gap-1">
            <div>Phone Number</div>
            <InputBox
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="+12345678990"
            />
          </label>
          {activeTab === "plivo" ? (
            <>
              <label className="flex flex-col gap-1">
                <div>Auth ID</div>
                <InputBox
                  value={authId}
                  onChange={setAuthId}
                  placeholder="Plivo Auth ID"
                />
              </label>
              <label className="flex flex-col gap-1">
                <div>Auth Token</div>
                <InputBox
                  value={authToken}
                  onChange={setAuthToken}
                  placeholder="Plivo Auth Token"
                />
              </label>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-1">
                <div>API Key</div>
                <InputBox
                  value={apiKey}
                  onChange={setApiKey}
                  placeholder="Provider API Key"
                />
              </label>
              <label className="flex flex-col gap-1">
                <div>API {activeTab === "exotel" ? "Token" : "Secret"}</div>
                <InputBox value={apiSecret} onChange={setApiSecret} />
              </label>
              {activeTab !== "vanage" && (
                <label className="flex flex-col gap-1">
                  <div>Account SID</div>
                  <InputBox value={accoutSid} onChange={setAccountSid} />
                </label>
              )}
            </>
          )}
          {activeTab === "exotel" && (
            <>
              <div className="flex flex-col gap-1">
                <div>Subdomain</div>
                <Select
                  options={domainOptions}
                  value={domainOptions.find(
                    (option) => option.value === subdomain
                  )}
                  onChange={(e) =>
                    setSubdomain((e as SelectOptionType).value as string)
                  }
                />
              </div>
              <label className="flex flex-col gap-1">
                <div>App ID</div>
                <InputBox value={appId} onChange={setAppId} />
              </label>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
