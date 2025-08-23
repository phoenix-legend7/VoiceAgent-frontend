import {
  Dispatch,
  FC,
  SetStateAction,
  useState,
  ChangeEvent,
  FormEvent,
} from "react";
import { toast } from "react-toastify";
import axiosInstance, { handleAxiosError } from "../../core/axiosInstance";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import Modal from "../../library/ModalProvider";
import { ConnectedTool, ToolType } from "./Tools";

interface Props {
  isOpen: boolean;
  connectedTools: ConnectedTool[];
  selectedTool: ToolType | null;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  setConnectedTools: Dispatch<SetStateAction<ConnectedTool[]>>;
  setSelectedTool: Dispatch<SetStateAction<ToolType | null>>;
}

export const ConfigToolModal: FC<Props> = ({
  isOpen,
  connectedTools,
  selectedTool,
  setIsOpen,
  setConnectedTools,
  setSelectedTool,
}) => {
  const [isOverlayShow, setIsOverlayShow] = useState(false);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSet = async () => {
    if (!selectedTool) return;
    for (const param of selectedTool.params) {
      if (formValues[param.id] === undefined) {
        toast.error(`${param.label} is required`);
        return;
      }
    }
    setIsOverlayShow(true);
    try {
      const payload = {
        tool_id: selectedTool.id,
        header: formValues,
      };
      const response = await axiosInstance.post("/tools", payload);
      const isAlreadyConnected = !!connectedTools.find(tool => tool.tool_id === selectedTool.id);
      if (!isAlreadyConnected) {
        setConnectedTools([
          ...connectedTools,
          {
            id: response.data.id,
            description: selectedTool.description,
            name: selectedTool.name,
            tool_id: selectedTool.id,
          }
        ])
      }
      onClose();
    } catch (error) {
      handleAxiosError(`Failed to connect ${selectedTool.name}`, error);
    } finally {
      setIsOverlayShow(false);
    }
  };

  const onClose = () => {
    setIsOpen(false);
    setSelectedTool(null);
    setFormValues({});
  };

  return (
    <Modal
      isLoading={isOverlayShow}
      isOpen={isOpen}
      disableOutsideClick
      title={`Connect ${selectedTool?.name || "Custom Tool"}`}
      onOK={handleSet}
      onClose={onClose}
      modalSize="max-w-xl"
      okBtnLabel="Connect"
    >
      {selectedTool ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="size-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-3">
              <selectedTool.icon className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{selectedTool.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedTool.description}
              </p>
            </div>
          </div>

          {/* Params Form */}
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              handleSet();
            }}
            className="grid grid-cols-1 gap-4"
          >
            {selectedTool.params.map((param) => (
              <div key={param.id} className="space-y-1">
                <Label htmlFor={param.id} className="font-medium">
                  {param.label}
                </Label>
                <Input
                  id={param.id}
                  name={param.id}
                  type={param.isSecret ? "password" : "text"}
                  value={formValues[param.id] || ""}
                  onChange={handleChange}
                  placeholder={param.isSecret ? "Enter secret value" : param.label}
                  className="w-full"
                />
              </div>
            ))}
          </form>
        </div>
      ) : (
        // Skeleton Loader
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 bg-gray-200 rounded" />
          <div className="h-4 w-2/3 bg-gray-200 rounded" />
          <div className="h-10 w-full bg-gray-200 rounded" />
        </div>
      )}
    </Modal>
  );
};
