import { useEffect, useState } from "react";
import SettingsLayout from "./SettingsLayout";
import { ConfigToolModal } from "./ConfigToolModal";
import { ConfigCustomToolModal } from "./ConfigCustomToolModal";
import {
  Calendar,
  Cog,
  Database,
  LucideProps,
  Mail,
  MessageSquare,
  ShoppingCart,
  Target,
  Workflow,
  X,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import axiosInstance from "../../core/axiosInstance";

export interface ConnectedTool {
  id: string;
  tool_id: string;
  name: string;
  description: string;
}

export interface CustomTool {
  id?: string;
  tool_id: "custom";
  name: string;
  description: string;
  params: Array<{
    name: string;
    required: boolean;
    type: string;
    description: string;
  }>;
  webhook: string;
  header: { [key: string]: string };
  method: string;
}

export interface ToolType {
  id: string;
  name: string;
  description: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  category: string;
  params: Array<{
    label: string;
    id: string;
    isSecret?: boolean;
  }>;
  popular?: boolean;
}

export const tools: ToolType[] = [
  // Communication
  {
    id: "whatsapp-business",
    name: "WhatsApp Business",
    description: "Send messages via WhatsApp Business API",
    icon: MessageSquare,
    category: "SMS",
    params: [
      { label: "Phone Number ID", id: "phone_number_id" },
      { label: "Access Token", id: "access_token", isSecret: true },
    ],
  },

  // CRM & Sales
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Sync leads and deals with your sales pipeline",
    icon: Target,
    category: "CRM & Sales",
    popular: true,
    params: [
      { label: "Domain", id: "domain" },
      { label: "API Token", id: "api_token", isSecret: true },
    ],
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Connect with your HubSpot contacts and deals",
    icon: Database,
    category: "CRM & Sales",
    popular: true,
    params: [
      { label: "API Key", id: "api_key", isSecret: true },
    ],
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Integrate with Salesforce CRM data",
    icon: Database,
    category: "CRM & Sales",
    params: [
      { label: "Instance URL", id: "instance_url" },
      { label: "Access Token", id: "access_token", isSecret: true },
    ],
  },

  // Email & Communication
  {
    id: "email",
    name: "Email Integration",
    description: "Send follow-up emails automatically",
    icon: Mail,
    category: "Email & Communication",
    popular: true,
    params: [
      { label: "SMTP Server", id: "smtp_server" },
      { label: "SMTP Port", id: "smtp_port" },
      { label: "Email Username", id: "email_username" },
      { label: "Email Password", id: "email_password", isSecret: true },
    ],
  },

  // Calendar & Scheduling
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Schedule appointments automatically",
    icon: Calendar,
    category: "Scheduling",
    popular: true,
    params: [
      { label: "Calendar ID", id: "calendar_id" },
      { label: "Access Token", id: "access_token", isSecret: true },
    ],
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Book meetings through Calendly integration",
    icon: Calendar,
    category: "Scheduling",
    popular: true,
    params: [
      { label: "API Key", id: "api_key", isSecret: true },
    ],
  },
  {
    id: "acuity-scheduling",
    name: "Acuity Scheduling",
    description: "Schedule appointments with Acuity",
    icon: Calendar,
    category: "Scheduling",
    params: [
      { label: "User ID", id: "user_id" },
      { label: "API Key", id: "api_key", isSecret: true },
    ],
  },

  // Automation & Workflows
  {
    id: "make",
    name: "Make.com",
    description: "Create powerful automation workflows",
    icon: Workflow,
    category: "Automation",
    popular: true,
    params: [
      { label: "Webhook URL", id: "webhook" },
    ],
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect 6000+ apps with automation",
    icon: Workflow,
    category: "Automation",
    popular: true,
    params: [
      { label: "Webhook URL", id: "webhook" },
    ],
  },

  // E-commerce
  {
    id: "shopify",
    name: "Shopify",
    description: "Access your Shopify store data",
    icon: ShoppingCart,
    category: "E-commerce",
    popular: true,
    params: [
      { label: "Shop Domain", id: "shop_domain" },
      { label: "Access Token", id: "access_token", isSecret: true },
    ],
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Connect with your WooCommerce store",
    icon: ShoppingCart,
    category: "E-commerce",
    params: [
      { label: "Store URL", id: "store_url" },
      { label: "Consumer Key", id: "consumer_key", isSecret: true },
      { label: "Consumer Secret", id: "consumer_secret", isSecret: true },
    ],
  },

  // Analytics
  // {
  //   id: "google-analytics",
  //   name: "Google Analytics",
  //   description: "Track website visitor data",
  //   icon: BarChart3,
  //   category: "Analytics",
  //   params: [
  //     { label: "Access Token", id: "access_token", isSecret: true },
  //     { label: "Phone Number ID", id: "phone_number_id" },
  //   ],
  // },
]

const Tools = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const [selectedCustomTool, setSelectedCustomTool] = useState<CustomTool | null>(null);
  const [connectedTools, setConnectedTools] = useState<ConnectedTool[]>([]);
  const [customTools, setCustomTools] = useState<CustomTool[]>([]);

  useEffect(() => {
    setIsDarkMode(document.body.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.body.classList.contains("dark"));
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const fetchConnectedTools = async () => {
      try {
        const response = await axiosInstance.get("/tools");
        setConnectedTools(response.data || []);
      } catch (error) {
        console.error('Failed to fetch tools:', error);
        toast.error(`Failed to fetch tools: ${(error as Error).message}`);
      }
    };
    const fetchCustomTools = async () => {
      try {
        const response = await axiosInstance.get("/tools/custom");
        setCustomTools(response.data || []);
      } catch (error) {
        console.error('Failed to fetch custom tools:', error);
        toast.error(`Failed to fetch custom tools: ${(error as Error).message}`);
      }
    };
    fetchConnectedTools();
    fetchCustomTools();
  }, []);

  const disconnectTool = async (id: string) => {
    try {
      await axiosInstance.delete(`/tools/${id}`);
      setConnectedTools(connectedTools.filter((tool) => tool.id !== id));
    } catch (error) {
      console.error('Failed to fetch tools:', error);
      toast.error(`Failed to fetch tools: ${(error as Error).message}`);
    }
  };
  const onSelectTool = (tool: ToolType) => {
    setSelectedTool(tool);
    setIsOpen(true);
  };
  const onSelectCustomTool = (tool: CustomTool | null) => {
    setSelectedCustomTool(tool);
    setIsCustomModalOpen(true);
  };

  return (
    <SettingsLayout isOverlayShown={false}>
      <div className="bg-white dark:bg-gray-900 rounded-md px-8 py-4">
        <div className="space-y-8">
          {Object.entries(
            tools
              .reduce(
                (acc, tool) => {
                  if (!acc[tool.category]) acc[tool.category] = []
                  acc[tool.category].push(tool)
                  return acc
                },
                {} as Record<string, typeof tools>,
              ),
          ).map(([category, categoryTools]) => (
            <div key={category} className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={clsx(
                    "w-6 h-6 rounded-full flex items-center justify-center",
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-gradient-to-r from-violet-500 to-purple-500'
                  )}
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <h3
                  className={clsx(
                    "text-xl font-bold",
                    isDarkMode ? "text-white" : "text-cyan-600"
                  )}
                  style={{ textShadow: isDarkMode ? "0 0 10px #FF00FF" : '0 0 10px #00FFFF' }}
                >
                  {category}
                </h3>
                <div
                  className={clsx(
                    "flex-1 h-px",
                    isDarkMode
                      ? 'bg-gradient-to-r from-purple-500/50 to-transparent'
                      : 'bg-gradient-to-r from-violet-300/50 to-transparent'
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryTools.map((tool) => {
                  const connectedTool = connectedTools.find((ct) => ct.tool_id === tool.id);
                  const isSelected = !!connectedTool;
                  return (
                    <Card
                      key={tool.id}
                      className={clsx(
                        "relative select-none",
                        isSelected
                          ? isDarkMode
                            ? "bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border-cyan-400"
                            : "bg-gradient-to-br from-cyan-100 to-violet-100 border-cyan-400"
                          : isDarkMode
                            ? "bg-gradient-to-br from-gray-900/30 to-black/30 border-gray-600 hover:border-cyan-400"
                            : "bg-gradient-to-br from-white/70 to-gray-50/70 border-gray-300 hover:border-cyan-400"
                      )}
                      style={{
                        boxShadow: isSelected
                          ? isDarkMode ? "0 0 25px rgba(0, 255, 255, 0.3)" : "0 0 25px rgba(14,165,233, 0.2)"
                          : isDarkMode ? "0 0 10px rgba(0, 255, 255, 0.1)" : "0 0 10px rgba(14,165,233, 0.1)",
                      }}
                    >
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 z-50">
                          <div className="group relative">
                            <button
                              className="bg-red-500 text-white p-1 rounded-full cursor-pointer"
                              onClick={() => disconnectTool(connectedTool.id)}
                            >
                              <X size={14} />
                            </button>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                              Disconnect {tool.name}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <CardContent
                        className="transition-all duration-300 hover:scale-105 cursor-pointer p-6 relative"
                        onClick={() => onSelectTool(tool)}
                      >
                        {isSelected && (
                          <div
                            className={clsx(
                              "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
                              isDarkMode
                                ? 'bg-gradient-to-r from-green-400 to-cyan-400'
                                : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                            )}
                          >
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}

                        <div className="flex items-start gap-4">
                          <div
                            className={clsx(
                              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                              isSelected
                                ? isDarkMode
                                  ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                                  : "bg-gradient-to-r from-cyan-500 to-blue-500"
                                : isDarkMode
                                  ? "bg-gradient-to-r from-gray-700 to-gray-600 group-hover:from-cyan-500/50 group-hover:to-blue-500/50"
                                  : "bg-gradient-to-r from-gray-300 to-gray-400 group-hover:from-cyan-500/50 group-hover:to-blue-500/50"
                            )}
                          >
                            <tool.icon
                              className={clsx(
                                "w-6 h-6 transition-colors duration-300",
                                isSelected
                                  ? "text-white"
                                  : isDarkMode
                                    ? "text-gray-300 group-hover:text-white"
                                    : "text-gray-600 group-hover:text-white"
                              )}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3
                              className={clsx(
                                "font-bold text-base mb-1 transition-colors duration-300",
                                isSelected
                                  ? isDarkMode ? "text-white" : "text-gray-800"
                                  : isDarkMode
                                    ? "text-gray-200 group-hover:text-white"
                                    : "text-gray-700 group-hover:text-gray-900"
                              )}
                            >
                              {tool.name}
                            </h3>
                            <p
                              className={clsx(
                                "text-sm leading-relaxed transition-colors duration-300",
                                isSelected
                                  ? isDarkMode ? "text-gray-300" : "text-gray-600"
                                  : isDarkMode
                                    ? "text-gray-400 group-hover:text-gray-200"
                                    : "text-gray-500 group-hover:text-gray-700"
                              )}
                            >
                              {tool.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={clsx(
                              "text-xs transition-all duration-300",
                              isSelected
                                ? isDarkMode
                                  ? "border-cyan-400 text-cyan-300 bg-cyan-500/10"
                                  : "border-cyan-400 text-cyan-600 bg-cyan-100"
                                : isDarkMode
                                  ? "border-gray-500 text-gray-400 group-hover:border-cyan-400 group-hover:text-cyan-300"
                                  : "border-gray-400 text-gray-500 group-hover:border-cyan-400 group-hover:text-cyan-600"
                            )}
                          >
                            {tool.category}
                          </Badge>

                          <Button
                            size="sm"
                            variant="ghost"
                            className={clsx(
                              "h-8 px-3 text-xs transition-all duration-300",
                              isSelected
                                ? isDarkMode
                                  ? "text-green-400 hover:text-green-300"
                                  : "text-emerald-600 hover:text-emerald-500"
                                : isDarkMode
                                  ? "text-cyan-400 hover:text-cyan-300"
                                  : "text-cyan-600 hover:text-cyan-500"
                            )}
                          >
                            {isSelected ? "Added" : "Add"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={clsx(
                  "w-6 h-6 rounded-full flex items-center justify-center",
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gradient-to-r from-violet-500 to-purple-500'
                )}
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
              <h3
                className={clsx(
                  "text-xl font-bold",
                  isDarkMode ? "text-white" : "text-cyan-600"
                )}
                style={{ textShadow: isDarkMode ? "0 0 10px #FF00FF" : '0 0 10px #00FFFF' }}
              >
                Custom Tools
              </h3>
              <div
                className={clsx(
                  "flex-1 h-px",
                  isDarkMode
                    ? 'bg-gradient-to-r from-purple-500/50 to-transparent'
                    : 'bg-gradient-to-r from-violet-300/50 to-transparent'
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customTools.map((tool, index) => {
                return (
                  <Card
                    key={index}
                    className={clsx(
                      "relative select-none",
                      isDarkMode
                        ? "bg-gradient-to-br from-cyan-500/15 to-purple-500/15 border-cyan-400"
                        : "bg-gradient-to-br from-cyan-100 to-violet-100 border-cyan-400"
                    )}
                    style={{
                      boxShadow: isDarkMode ? "0 0 25px rgba(0, 255, 255, 0.3)" : "0 0 25px rgba(14,165,233, 0.2)"
                    }}
                  >
                    <div className="absolute -top-2 -right-2 z-50">
                      <div className="group relative">
                        <button
                          className="bg-red-500 text-white p-1 rounded-full cursor-pointer"
                          onClick={() => disconnectTool(tool.id || "")}
                        >
                          <X size={14} />
                        </button>
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                          Disconnect {tool.name}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    <CardContent
                      className="transition-all duration-300 hover:scale-105 cursor-pointer p-6 relative"
                      onClick={() => onSelectCustomTool(tool)}
                    >
                      <div
                        className={clsx(
                          "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
                          isDarkMode
                            ? 'bg-gradient-to-r from-green-400 to-cyan-400'
                            : 'bg-gradient-to-r from-emerald-400 to-cyan-400'
                        )}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>

                      <div className="flex items-start gap-4">
                        <div
                          className={clsx(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                            isDarkMode
                              ? "bg-gradient-to-r from-cyan-500 to-blue-500"
                              : "bg-gradient-to-r from-cyan-500 to-blue-500"
                          )}
                        >
                          <Cog className="w-6 h-6 transition-colors text-white duration-300" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className={clsx(
                              "font-bold text-base mb-1 transition-colors duration-300",
                              isDarkMode ? "text-white" : "text-gray-800"
                            )}
                          >
                            {tool.name}
                          </h3>
                          <p
                            className={clsx(
                              "text-sm leading-relaxed transition-colors duration-300",
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            )}
                          >
                            {tool.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
              <Card
                className="flex items-center justify-center border-3 border-dashed border-gray-300 hover:border-sky-300 dark:border-gray-600 dark:hover:border-sky-600 text-xl font-bold text-gray-300 hover:text-sky-300 dark:text-gray-600 dark:hover:text-sky-600 min-h-40 cursor-pointer transition-all duration-300 hover:scale-105 select-none"
                onClick={() => onSelectCustomTool(null)}
              >
                Add Custom Tool
              </Card>
            </div>
          </div>
        </div>
      </div>
      <ConfigToolModal
        isOpen={isOpen}
        connectedTools={connectedTools}
        selectedTool={selectedTool}
        setIsOpen={setIsOpen}
        setConnectedTools={setConnectedTools}
        setSelectedTool={setSelectedTool}
      />
      <ConfigCustomToolModal
        isOpen={isCustomModalOpen}
        customTools={customTools}
        selectedTool={selectedCustomTool}
        setCustomTools={setCustomTools}
        setIsOpen={setIsCustomModalOpen}
        setSelectedTool={setSelectedCustomTool}
      />
    </SettingsLayout>
  );
};

export default Tools;
