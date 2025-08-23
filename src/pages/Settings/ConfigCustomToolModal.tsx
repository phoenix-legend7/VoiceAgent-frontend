import {
  Dispatch,
  FC,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { FaRegTrashAlt } from "react-icons/fa";
import clsx from "clsx";
import { CustomTool } from "./Tools";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import Modal from "../../library/ModalProvider";
import { InputBox } from "../../library/FormField";
import Select from "../../library/Select";
import { SelectOptionType } from "../../models/common";

const paramTypeOptions = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' }
];

interface Props {
  isOpen: boolean;
  customTools: CustomTool[];
  selectedTool: CustomTool | null;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setCustomTools: Dispatch<SetStateAction<CustomTool[]>>;
  setSelectedTool: Dispatch<SetStateAction<CustomTool | null>>;
}

export const ConfigCustomToolModal: FC<Props> = ({
  isOpen,
  customTools,
  selectedTool,
  setIsOpen,
  setCustomTools,
  setSelectedTool,
}) => {
  const [isOverlayShow, setIsOverlayShow] = useState(false);
  const [functionName, setFunctionName] = useState<string>('')
  const [functionDescription, setFunctionDescription] = useState<string>('')
  const [webhookUrl, setWebhookUrl] = useState<string>('')
  const [webhookMethod, setWebhookMethod] = useState<'GET' | 'POST'>('GET')
  const [webhookHeaders, setWebhookHeaders] = useState<{ key: string, value: string }[]>([])
  const [webhookParams, setWebhookParams] = useState<{ name: string, required: boolean, type: string, description: string }[]>([])

  useEffect(() => {
    if (selectedTool) {
      setFunctionName(selectedTool.name);
      setFunctionDescription(selectedTool.description);
      setWebhookUrl(selectedTool.webhook);
      setWebhookMethod(selectedTool.method as "GET" | "POST");
      setWebhookHeaders(Object.keys(selectedTool.header).map((key) => ({ key, value: selectedTool.header[key] })));
      setWebhookParams(selectedTool.params);
    }
  }, [selectedTool]);

  const handleSet = async () => {
    setIsOverlayShow(true);
    try {
      const headers: Record<string, string> = {}
      webhookHeaders.forEach((header) => {
        headers[header.key] = header.value
      });
      const payload: CustomTool = {
        tool_id: "custom",
        description: functionDescription,
        header: headers,
        method: webhookMethod,
        name: functionName,
        params: webhookParams,
        webhook: webhookUrl,
      };
      if (selectedTool) {
        const response = await axiosInstance.patch("/tools", payload);
        setCustomTools([
          ...customTools.map((tool) => {
            if (tool.id === selectedTool.id) {
              return { ...payload, id: response.data.id };
            } else {
              return tool;
            }
          })
        ]);
      } else {
        await axiosInstance.post("/tools", payload);
        setCustomTools([...customTools, payload]);
      }
      onClose();
    } catch (error) {
      if (selectedTool) {
        handleAxiosError(`Failed to update ${selectedTool.name}`, error);
      } else {
        handleAxiosError(`Failed to connect custom tool`, error);
      }
    } finally {
      setIsOverlayShow(false);
    }
  };

  const onClose = () => {
    setIsOpen(false);
    setSelectedTool(null);
    setFunctionName('');
    setFunctionDescription('');
    setWebhookUrl('');
    setWebhookMethod('GET');
    setWebhookHeaders([]);
    setWebhookParams([]);
  };

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={isOpen}
      disableOutsideClick
      title={selectedTool ? `Update ${selectedTool.name}` : "Connect custom tool"}
      onOK={handleSet}
      onClose={onClose}
      modalSize="max-w-xl"
      okBtnLabel={selectedTool ? "Update" : "Connect"}
    >

      <InputBox
        onChange={(e) => setFunctionName(e)}
        value={functionName}
        label="Name"
        placeholder='Enter meaningful function name. Ex: "get_user_email"'
      />
      <div className="mt-4 mb-2">Description</div>
      <div>
        <textarea
          className="w-full h-24 resize-none border border-gray-500 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:border-sky-500 transition-all duration-300"
          placeholder="Enter description of the function. Provide as many details as possible for agent to understand."
          value={functionDescription}
          onChange={(e) => setFunctionDescription(e.target.value)}
        />
      </div>
      <div>
        <p className="text-center text-xs mb-4">
          Retrieve or send information to external services via webhooks
        </p>
        <div className="p-4 border border-gray-400 dark:border-gray-700">
          <InputBox
            className="my-2"
            label="Webhook URL"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e)}
            placeholder="Enter webhook URL for the agent to call"
          />
          <div className="flex items-center gap-5">
            <div>Method:</div>
            <div className="flex items-center rounded-md overflow-hidden border border-gray-400 dark:border-gray-700 my-2">
              {['GET', 'POST'].map((type) => (
                <button
                  key={type}
                  className={clsx(
                    'px-4 py-2 cursor-pointer transition-all duration-300 capitalize border-gray-400 dark:border-gray-700 not-last:border-r',
                    webhookMethod === type ? 'bg-sky-800/20 hover:bg-sky-800/30 text-sky-600 dark:text-sky-400' : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-600 dark:text-gray-400'
                  )}
                  onClick={() => setWebhookMethod(type as 'GET' | 'POST')}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="my-2">
            <div className="flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
              <button
                className="cursor-pointer px-3 py-1.5 rounded text-sky-600 dark:text-sky-400 hover:bg-sky-600/20 dark:hover:bg-sky-400/20 transition-all duration-300 text-nowrap"
                onClick={() => setWebhookHeaders([...webhookHeaders, { key: '', value: '' }])}
              >
                Add Header
              </button>
            </div>
          </div>
          <div className="mt-4">
            {webhookHeaders.map((hook, index) => (
              <div key={`hook-${index}`} className="flex items-center justify-between gap-2 my-2">
                <InputBox
                  onChange={(e) => setWebhookHeaders(webhookHeaders.map((hook, i) => i === index ? { ...hook, key: e } : hook))}
                  value={hook.key}
                  label="Key"
                  placeholder="Ex: Authorization, Content-Ty"
                />
                <InputBox
                  onChange={(e) => setWebhookHeaders(webhookHeaders.map((hook, i) => i === index ? { ...hook, value: e } : hook))}
                  value={hook.value}
                  label="Value"
                />
                <div>
                  <button
                    className="cursor-pointer rounded text-red-500 hover:bg-red-700/20 p-2 transition-all duration-300"
                    onClick={() => setWebhookHeaders(webhookHeaders.filter((_, i) => i !== index))}
                  >
                    <FaRegTrashAlt />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="my-2">
            <div className="flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
              <button
                className="cursor-pointer px-3 py-1.5 rounded text-sky-600 dark:text-sky-400 hover:bg-sky-600/20 dark:hover:bg-sky-400/20 transition-all duration-300 text-nowrap"
                onClick={() => setWebhookParams([...webhookParams, { description: '', name: '', type: 'string', required: false }])}
              >
                Add Parameter
              </button>
            </div>
          </div>
          <div className="mt-4">
            {webhookParams.map((param, index) => (
              <div key={`hook-${index}`} className="flex flex-col my-2">
                <div className="flex items-center justify-between gap-3 my-2">
                  <InputBox
                    onChange={(e) => setWebhookParams(webhookParams.map((param, i) => i === index ? { ...param, name: e } : param))}
                    value={param.name}
                    className="w-full"
                    label="Name"
                    placeholder="Ex: email, phone_number"
                  />
                  <div className="flex flex-col gap-2 w-full">
                    <div>Type</div>
                    <Select
                      options={paramTypeOptions}
                      value={paramTypeOptions.find((option) => option.value === param.type)}
                      onChange={(e) => setWebhookParams(webhookParams.map((param, i) =>
                        i === index ? { ...param, type: (e as SelectOptionType).value as string } : param
                      ))}
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="size-4 cursor-pointer"
                      checked={param.required}
                      onChange={(e) => setWebhookParams(webhookParams.map((param, i) =>
                        i === index ? { ...param, required: e.target.checked } : param
                      ))}
                    />
                    Required
                  </label>
                  <div>
                    <button
                      className="cursor-pointer rounded text-red-500 hover:bg-red-700/20 p-2 transition-all duration-300"
                      onClick={() => setWebhookParams(webhookParams.filter((_, i) => i !== index))}
                    >
                      <FaRegTrashAlt />
                    </button>
                  </div>
                </div>
                <div className="mb-2">Description</div>
                <div>
                  <textarea
                    className="w-full resize-none border border-gray-500 dark:border-gray-600 rounded-md p-2 focus:outline-none focus:border-sky-500 transition-all duration-300"
                    placeholder="Enter description of the parameter. Provide as many details as possible for agent to understand."
                    value={param.description}
                    onChange={(e) => setWebhookParams(webhookParams.map((param, i) =>
                      i === index ? { ...param, description: e.target.value } : param
                    ))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
