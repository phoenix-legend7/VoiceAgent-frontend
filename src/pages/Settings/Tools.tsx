import { useEffect, useState } from "react";
import SettingsLayout from "./SettingsLayout";
import { ConfigToolModal } from "./ConfigToolModal";
import { ConfigCustomToolModal } from "./ConfigCustomToolModal";
import {
  Cog,
  X,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { toast } from "react-toastify";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import axiosInstance from "../../core/axiosInstance";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";

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
  icon: string;
  category: string;
  params: Array<{
    label: string;
    id: string;
    isSecret?: boolean;
  }>;
  popular?: boolean;
  helpInfo?: {
    title: string;
    description: string;
    steps: Array<{
      title: string;
      description: string;
      link?: string;
      code?: string;
    }>;
    documentation?: string;
    supportEmail?: string;
  };
}

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  tool: ToolType | null;
  isDarkMode: boolean;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, tool, isDarkMode }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
      toast.success(`Copied ${label} to clipboard`);
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (!tool?.helpInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={clsx(
        "max-w-2xl max-h-[90vh] overflow-y-auto",
        isDarkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
      )}>
        <DialogHeader>
          <DialogTitle className={clsx(
            "flex items-center gap-3 text-xl",
            isDarkMode ? "text-white" : "text-gray-900"
          )}>
            <img
              src={tool.icon}
              alt={tool.name}
              className="size-8"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {tool.helpInfo.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className={clsx(
            "text-base",
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            {tool.helpInfo.description}
          </p>

          <div className="space-y-6">
            {tool.helpInfo.steps.map((step, index) => (
              <div key={index} className="space-y-3">
                <h4 className={clsx(
                  "font-semibold text-lg",
                  isDarkMode ? "text-white" : "text-gray-900"
                )}>
                  {step.title}
                </h4>
                <p className={clsx(
                  "text-base leading-relaxed",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  {step.description}
                </p>

                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      "inline-flex items-center gap-2 text-base font-medium transition-colors",
                      isDarkMode
                        ? "text-cyan-400 hover:text-cyan-300"
                        : "text-blue-600 hover:text-blue-500"
                    )}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {step.link}
                  </a>
                )}

                {step.code && (
                  <div className="relative max-w-full">
                    <div className={clsx(
                      "text-sm rounded-lg p-4 whitespace-pre-wrap border",
                      isDarkMode
                        ? "bg-gray-800 text-gray-300 border-gray-700"
                        : "bg-gray-50 text-gray-800 border-gray-200"
                    )}>
                      {step.code}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-3 right-3 h-8 w-8 p-0"
                      onClick={() => copyToClipboard(step.code!, "code")}
                    >
                      {copiedText === "code" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {(tool.helpInfo.documentation || tool.helpInfo.supportEmail) && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
              <h4 className={clsx(
                "font-semibold text-lg mb-4",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>
                Additional Resources
              </h4>
              <div className="flex flex-wrap gap-4">
                {tool.helpInfo.documentation && (
                  <a
                    href={tool.helpInfo.documentation}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={clsx(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                      isDarkMode
                        ? "text-cyan-400 hover:text-cyan-300 border-cyan-400/30 hover:border-cyan-400/50"
                        : "text-blue-600 hover:text-blue-500 border-blue-200 hover:border-blue-300"
                    )}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Full Documentation
                  </a>
                )}
                {tool.helpInfo.supportEmail && (
                  <a
                    href={`mailto:${tool.helpInfo.supportEmail}`}
                    className={clsx(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                      isDarkMode
                        ? "text-cyan-400 hover:text-cyan-300 border-cyan-400/30 hover:border-cyan-400/50"
                        : "text-blue-600 hover:text-blue-500 border-blue-200 hover:border-blue-300"
                    )}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Contact Support
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const tools: ToolType[] = [
  // Communication
  {
    id: "whatsapp-business",
    name: "WhatsApp Business",
    description: "Send messages via WhatsApp Business API",
    icon: "/tool-logo/whatsapp.svg",
    category: "SMS",
    params: [
      { label: "Phone Number ID", id: "phone_number_id" },
      { label: "Access Token", id: "access_token", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect WhatsApp Business",
      description: "Send messages via the WhatsApp Business API.",
      steps: [
        {
          title: "1. Log into Meta Business Manager",
          description: "Go to business.facebook.com and log in with your Meta Business account.",
          link: "https://business.facebook.com"
        },
        {
          title: "2. Go to WhatsApp → Getting Started",
          description: "Navigate to the WhatsApp section and open the Getting Started page."
        },
        {
          title: "3. Copy your credentials",
          description: "Copy your Phone Number ID and Access Token, then paste them into the form and click Connect."
        },
        {
          title: "Alternative",
          description: "If you don’t have API access yet, apply via Meta for Developers and request a WhatsApp Business API setup.",
          link: "https://developers.facebook.com/docs/whatsapp"
        }
      ],
      documentation: "https://developers.facebook.com/docs/whatsapp",
      supportEmail: "support@yourcompany.com"
    }
  },

  // CRM & Sales
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Sync leads and deals with your sales pipeline",
    icon: "/tool-logo/pipedrive.svg",
    category: "CRM & Sales",
    popular: true,
    params: [
      { label: "Domain", id: "domain" },
      { label: "API Token", id: "api_token", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect Pipedrive",
      description: "Sync leads and deals with your Pipedrive pipeline.",
      steps: [
        {
          title: "1. Log into Pipedrive",
          description: "Go to your Pipedrive account."
        },
        {
          title: "2. Get your API Token",
          description: "Click your profile (top-right) → Personal Preferences → API, then copy your API Token."
        },
        {
          title: "3. Enter your credentials",
          description: "Enter your domain (e.g., yourcompany.pipedrive.com) and paste the API Token into the form."
        },
        {
          title: "4. Connect",
          description: "Click Connect to complete setup."
        }
      ],
      documentation: "https://developers.pipedrive.com/docs/api/v1",
      supportEmail: "support@yourcompany.com"
    }
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description: "Connect with your HubSpot contacts and deals",
    icon: "/tool-logo/hubspot.svg",
    category: "CRM & Sales",
    popular: true,
    params: [
      { label: "API Key", id: "api_key", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect HubSpot CRM",
      description: "Sync your HubSpot contacts and deals.",
      steps: [
        {
          title: "1. Log into HubSpot",
          description: "Go to Settings → Integrations → API Key, then generate or copy your existing API Key.",
          link: "https://app.hubspot.com"
        },
        {
          title: "2. Paste your API Key",
          description: "Paste it into the API Key field and click Connect."
        },
        {
          title: "Alternative (Private Apps)",
          description: "If API Keys are unavailable, go to Settings → Integrations → Private Apps, create a new app, copy the Access Token, and paste it into the same field."
        }
      ],
      documentation: "https://developers.hubspot.com/docs/api/crm/contacts",
      supportEmail: "support@yourcompany.com"
    }
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Integrate with Salesforce CRM data",
    icon: "/tool-logo/salesforce.svg",
    category: "CRM & Sales",
    params: [
      { label: "Instance URL", id: "instance_url" },
      { label: "Access Token", id: "access_token", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect Salesforce",
      description: "Integrate Salesforce CRM data with your account.",
      steps: [
        {
          title: "1. Log into Salesforce",
          description: "Open Salesforce and go to Setup → Apps → App Manager."
        },
        {
          title: "2. Create or open a Connected App",
          description: "Copy your Instance URL and Access Token, then paste both into the connection form."
        },
        {
          title: "Alternative",
          description: "If you don’t have an Access Token, generate a Security Token under Setup → Users → Profiles."
        }
      ],
      documentation: "https://developer.salesforce.com/docs/",
      supportEmail: "support@yourcompany.com"
    }
  },

  // Email & Communication
  {
    id: "email",
    name: "Email Integration",
    description: "Send follow-up emails automatically",
    icon: "/tool-logo/email.svg",
    category: "Email & Communication",
    popular: true,
    params: [
      { label: "SMTP Server", id: "smtp_server" },
      { label: "SMTP Port", id: "smtp_port" },
      { label: "Email Username", id: "email_username" },
      { label: "Email Password", id: "email_password", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect Email (SMTP)",
      description: "Send automated follow-up emails using your email provider’s SMTP settings.",
      steps: [
        {
          title: "1. Find SMTP settings",
          description: "Locate SMTP details in your provider’s help section (e.g., Gmail → smtp.gmail.com, Port 465 or 587)."
        },
        {
          title: "2. Enter credentials",
          description: "Enter SMTP Server, Port, Email Username, and Password (or App Password if required)."
        },
        {
          title: "3. Connect",
          description: "Click Connect to verify your credentials."
        },
        {
          title: "Alternative (Outlook)",
          description: "Use Outlook SMTP: smtp.office365.com, Port 587."
        }
      ]
    }
  },

  // Calendar & Scheduling
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Schedule appointments automatically",
    icon: "/tool-logo/google-calendar.svg",
    category: "Scheduling",
    popular: true,
    params: [
      { label: "Calendar ID", id: "calendar_id" },
      { label: "Access Token", id: "access_token", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect Google Calendar",
      description: "Schedule appointments automatically via your Google Calendar.",
      steps: [
        {
          title: "1. Open Google Calendar",
          description: "Hover over your calendar → click Settings and sharing."
        },
        {
          title: "2. Copy Calendar ID",
          description: "Scroll to Integrate Calendar and copy your Calendar ID."
        },
        {
          title: "3. Create an OAuth token",
          description: "In Google Cloud Console, create an OAuth token or API key."
        },
        {
          title: "4. Connect",
          description: "Paste both values into the form and click Connect."
        }
      ],
      documentation: "https://developers.google.com/calendar/api/v3/reference",
      supportEmail: "support@yourcompany.com"
    }
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Book meetings through Calendly integration",
    icon: "/tool-logo/calendly.svg",
    category: "Scheduling",
    popular: true,
    params: [
      { label: "API Key", id: "api_key", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect Calendly",
      description: "Book meetings through Calendly integration.",
      steps: [
        {
          title: "1. Log into Calendly",
          description: "Go to Account → Integrations."
        },
        {
          title: "2. Get your API Key",
          description: "Find your Personal Access Token (API Key), copy it, and paste it into the form."
        },
        {
          title: "3. Connect",
          description: "Click Connect to finalize setup."
        }
      ],
      documentation: "https://developer.calendly.com/",
      supportEmail: "support@yourcompany.com"
    }
  },
  {
    id: "acuity-scheduling",
    name: "Acuity Scheduling",
    description: "Schedule appointments with Acuity",
    icon: "/tool-logo/acuity.svg",
    category: "Scheduling",
    params: [
      { label: "User ID", id: "user_id" },
      { label: "API Key", id: "api_key", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect Acuity Scheduling",
      description: "Schedule appointments with Acuity.",
      steps: [
        {
          title: "1. Log into Acuity Scheduling",
          description: "Go to Integrations → API."
        },
        {
          title: "2. Copy credentials",
          description: "Copy your User ID and API Key, paste both into the form, and click Connect."
        }
      ],
      documentation: "https://developers.acuityscheduling.com/",
      supportEmail: "support@yourcompany.com"
    }
  },

  // Automation & Workflows
  {
    id: "make",
    name: "Make.com",
    description: "Create powerful automation workflows",
    icon: "/tool-logo/make.com.svg",
    category: "Automation",
    popular: true,
    params: [
      { label: "Webhook URL", id: "webhook" },
    ],
    helpInfo: {
      title: "How to connect Make.com",
      description: "Automate workflows through webhooks.",
      steps: [
        { title: "1. Log into Make.com", description: "Create a new Scenario." },
        { title: "2. Add Webhook", description: "Choose Webhooks → Custom Webhook." },
        { title: "3. Copy Webhook URL", description: "Copy the generated URL and paste it into the form." },
        { title: "4. Connect", description: "Click Connect to finalize." }
      ],
      documentation: "https://www.make.com/en/help/",
      supportEmail: "support@yourcompany.com"
    }
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect 6000+ apps with automation",
    icon: "/tool-logo/zapier.svg",
    category: "Automation",
    popular: true,
    params: [
      { label: "Webhook URL", id: "webhook" },
    ],
    helpInfo: {
      title: "How to connect Zapier",
      description: "Automate workflows with 6000+ apps using Zapier.",
      steps: [
        { title: "1. Log into Zapier", description: "Create a new Zap and choose Webhooks by Zapier." },
        { title: "2. Select Catch Hook", description: "Zapier will generate a unique Webhook URL." },
        { title: "3. Copy and paste URL", description: "Paste the Webhook URL into the form and click Connect." }
      ],
      documentation: "https://platform.zapier.com/docs",
      supportEmail: "support@yourcompany.com"
    }
  },

  // E-commerce
  {
    id: "shopify",
    name: "Shopify",
    description: "Access your Shopify store data",
    icon: "/tool-logo/shopify.svg",
    category: "E-commerce",
    popular: true,
    params: [
      { label: "Shop Domain", id: "shop_domain" },
      { label: "Access Token", id: "access_token", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect Shopify",
      description: "Sync data from your Shopify store.",
      steps: [
        { title: "1. Log into Shopify Admin", description: "Go to Apps → App & Sales Channel Settings → Develop Apps." },
        { title: "2. Create or open app", description: "From API credentials, copy your Admin API Access Token." },
        { title: "3. Enter credentials", description: "Enter your Shop Domain (e.g., yourstore.myshopify.com) and paste the Access Token." },
        { title: "4. Connect", description: "Click Connect to finalize setup." }
      ],
      documentation: "https://shopify.dev/docs/api",
      supportEmail: "support@yourcompany.com"
    }
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Connect with your WooCommerce store",
    icon: "/tool-logo/woocommerce.svg",
    category: "E-commerce",
    params: [
      { label: "Store URL", id: "store_url" },
      { label: "Consumer Key", id: "consumer_key", isSecret: true },
      { label: "Consumer Secret", id: "consumer_secret", isSecret: true },
    ],
    helpInfo: {
      title: "How to connect WooCommerce",
      description: "Connect your WooCommerce store using REST API credentials.",
      steps: [
        { title: "1. Log into WordPress Admin", description: "Go to WooCommerce → Settings → Advanced → REST API." },
        { title: "2. Create API Key", description: "Create a new API Key with Read/Write access." },
        { title: "3. Copy credentials", description: "Copy the Consumer Key and Secret, enter your Store URL, and click Connect." }
      ],
      documentation: "https://woocommerce.github.io/woocommerce-rest-api-docs/",
      supportEmail: "support@yourcompany.com"
    }
  },

  // Analytics
  // {
  //   id: "google-analytics",
  //   name: "Google Analytics",
  //   description: "Track website visitor data",
  //   icon: "/tool-logo/google-analytics.svg",
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
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [selectedHelpTool, setSelectedHelpTool] = useState<ToolType | null>(null);

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
      setCustomTools(customTools.filter((tool) => tool.id !== id));
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

  const openHelpModal = (tool: ToolType) => {
    setSelectedHelpTool(tool);
    setIsHelpModalOpen(true);
  };

  const closeHelpModal = () => {
    setIsHelpModalOpen(false);
    setSelectedHelpTool(null);
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

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                          <img
                            src={tool.icon}
                            alt={tool.name}
                            className="w-12 h-12 transition-opacity duration-300"
                            onError={(e) => {
                              // Fallback to a default icon if image fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />

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

                          <div className="flex items-center gap-2">
                            {tool.helpInfo && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={clsx(
                                  "h-8 w-8 p-0 transition-all duration-300",
                                  isDarkMode
                                    ? "text-gray-400 hover:text-cyan-300"
                                    : "text-gray-500 hover:text-cyan-600"
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openHelpModal(tool);
                                }}
                              >
                                <HelpCircle className="w-4 h-4" />
                              </Button>
                            )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={closeHelpModal}
        tool={selectedHelpTool}
        isDarkMode={isDarkMode}
      />
    </SettingsLayout>
  );
};

export default Tools;
