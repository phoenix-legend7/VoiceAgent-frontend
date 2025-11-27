import { useState } from "react";
import { FaDownload, FaCogs, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstance, { handleAxiosError } from "../core/axiosInstance";
import Content from "../Layout/Content";
import { InputBox } from "../library/FormField";
import Card from "../library/Card";

interface Automation {
  id: string;
  name: string;
  description: string;
  filename: string;
}

const AUTOMATIONS: Automation[] = [
  // {
  //   id: "my-automation-id",
  //   name: "My Automation Name",
  //   description: "Description of what this automation does",
  //   filename: "my-automation.json",
  // },
];

const AutomationLibrary = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null);

  const handleDownload = (automation: Automation) => {
    try {
      const link = document.createElement("a");
      link.href = `/automations/${automation.filename}`;
      link.download = automation.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSelectedAutomation(automation);
      toast.success(`Downloaded ${automation.name} successfully!`);
    } catch (error) {
      toast.error("Failed to download automation file");
      console.error("Download error:", error);
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a Make.com webhook URL");
      return;
    }

    try {
      new URL(webhookUrl);
    } catch {
      toast.error("Please enter a valid webhook URL (e.g., https://hook.eu1.make.com/...)");
      return;
    }

    setIsSaving(true);
    try {
      await axiosInstance.post("/automation/webhook", {
        webhook_url: webhookUrl,
        automation_id: selectedAutomation?.id || null,
      });

      toast.success("Webhook URL saved successfully!");
      setWebhookUrl("");
      setSelectedAutomation(null);
    } catch (error: any) {
      // Handle 404 or endpoint not found gracefully
      if (error?.response?.status === 404) {
        handleAxiosError(
          "API endpoint not yet configured. Please update the endpoint in AutomationLibrary.tsx",
          error
        );
      } else {
        handleAxiosError("Failed to save webhook URL", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Content isOverlayShown={isSaving}>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex flex-col gap-1 justify-center">
          <h2 className="text-2xl font-bold">Automation Library</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Download Make.com blueprint files and connect them with your webhooks
          </p>
        </div>

        <Card title="Available Automations" icon={<FaCogs />}>
          <div className="flex flex-col gap-4 px-6 py-4">
            {AUTOMATIONS.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                <p>No automation files available yet.</p>
                <p className="text-sm mt-2">Automation files will appear here once they are added.</p>
              </div>
            ) : (
              AUTOMATIONS.map((automation) => (
                <div
                  key={automation.id}
                  className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {automation.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {automation.description}
                    </p>
                  </div>
                  <button
                    className="flex items-center gap-2 cursor-pointer bg-sky-600 text-white px-4 py-2 rounded-md transition-all duration-300 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed ml-4"
                    onClick={() => handleDownload(automation)}
                  >
                    <FaDownload />
                    <span>Download</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title="Connect Webhook">
          <div className="flex flex-col gap-4 px-6 py-4">
            <div>
              <InputBox
                label="Paste your Make.com webhook here"
                placeholder="https://hook.eu1.make.com/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e)}
                inputClassName="bg-transparent"
                disabled={isSaving}
              />
            </div>

            {selectedAutomation && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Selected:</strong> {selectedAutomation.name}
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                  Paste the webhook URL you received from Make.com after uploading the automation.
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <button
                className="flex items-center gap-2 cursor-pointer bg-sky-600 text-white px-5 py-2 rounded-md transition-all duration-300 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSaveWebhook}
                disabled={isSaving || !webhookUrl.trim()}
              >
                {isSaving ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </div>
        </Card>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            How to use
          </h3>
          <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-2 list-decimal list-inside">
            <li>
              Click <strong>"Download"</strong> to download a Make.com blueprint file (.json)
            </li>
            <li>
              Go to Make.com and create a new scenario or open an existing one
            </li>
            <li>
              Upload the downloaded JSON file to import the automation blueprint
            </li>
            <li>
              After importing, Make.com will provide you with a webhook URL
            </li>
            <li>
              Copy the webhook URL and paste it into the input field above
            </li>
            <li>
              Click <strong>"Save"</strong> to connect the webhook to your automation
            </li>
          </ol>
        </div>
      </div>
    </Content>
  );
};

export default AutomationLibrary;

