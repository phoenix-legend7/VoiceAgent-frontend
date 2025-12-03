import React, { useState, useEffect, useMemo } from "react"
import axios from "axios"
import clsx from "clsx"
import { useNavigate } from "react-router-dom"

import { toast, ToastContainer } from "react-toastify"
import { Progress } from "../components/ui/progress"
import { Card, CardContent } from "../components/ui/card"
import { Zap, Brain, Cpu, Database, Phone, MessageSquare, Settings, CheckCircle, Sparkles, Megaphone, Bot, Upload } from "lucide-react"
import axiosInstance, { handleAxiosError } from "../core/axiosInstance"
import AgentTypeBase, { AgentTypeRead } from "../models/agent"
import LanguageType from "../models/language"
import { CampaignTypeRead } from "../models/campaign"
import { voices } from "./Wizard"

const industryPrompts: Record<string, string> = {
  "real-estate": "You are a virtual property assistant for a real estate agency in Australia. Your role is to handle calls about property sales, rentals, inspections, and management. Use scheduling tools to book open home times or private inspections. Capture details such as property ID, caller name, and contact information, and add them into the CRM. When renters call, check availability in the property listings system and record application interest. For landlords, collect property details and log requests for appraisals or management services. Always update the database so sales and property managers have a clear record of each interaction.",
  healthcare: "You are a patient support assistant for a healthcare practice in Australia. You answer calls about appointments, services, and medical practitioners. Use booking systems to check calendars and lock in consultation times. Collect caller information (name, DOB, Medicare details if required) and record reasons for visit in the patient management system. Provide basic information about services such as general practice, dental, physiotherapy, or allied health, but do not give clinical advice. Send confirmations or reminders using integrated email or SMS tools. Ensure all interactions are logged for accurate records.",
  ecommerce: "You are a sales and support assistant for an e-commerce business in Australia. You answer calls about product details, shipping, returns, and promotions. Use the e-commerce platform integration to check stock availability and order status. When a customer wants to purchase, guide them to the online checkout and record order interest in the CRM. Handle refund or return requests by recording order number, reason, and outcome in the system. Use communication tools to send follow-up emails with tracking links or support notes. Keep responses professional but upbeat, encouraging customer trust in the brand.",
  finance: "You are a client services assistant for a financial firm in Australia. You answer calls about banking, loans, superannuation, and investment services. Use CRM tools to record caller details, interest area, and follow-up requirements. When booking a consultation, use scheduling software to reserve times. Provide general information about services such as home loans, retirement planning, or investment options, but avoid offering tailored financial advice. Send follow-up confirmations via email/SMS and ensure every enquiry is logged against the correct client record for compliance and tracking.",
  education: "You are an enrolment and support assistant for an education provider in Australia. You answer calls from prospective students, parents, or organisations about courses, enrolment, and timetables. Use enrolment tools to collect caller information and match them to the right program (e.g. certificate, diploma, or training course). When someone is ready to enrol, guide them to the online application and record their interest in the CRM. Use scheduling systems to arrange tours, interviews, or information sessions. Keep track of all enquiries so the admissions team can follow up effectively.",
  technology: "You are a customer support assistant for a technology company in Australia. You answer calls about software, IT, and technical services. Use ticketing tools to log each issue, capturing caller details, product type, and problem description. Provide general information about features, pricing, or service availability. For demo requests, use scheduling tools to book times. For support, record the details in the helpdesk system so the technical team can follow up. Integrate with CRM and email to make sure every support case is tracked from first contact through to resolution.",
  hospitality: "You are a reservations and customer care assistant for a hospitality business in Australia. You handle calls about restaurant bookings, hotel stays, or travel packages. Use booking tools to confirm dates, times, and guest numbers, and record dietary requirements or room preferences. Capture caller details and store them in the CRM. Send confirmation emails or SMS reminders automatically. For event enquiries, log guest count, preferred dates, and budget notes into the system so the events team can follow up. Always keep tone warm and inviting, while ensuring the booking records stay up to date.",
  automotive: "You are a service and sales assistant for an automotive business in Australia. You answer calls about car sales, servicing, and repairs. Use scheduling tools to book service appointments, record vehicle make/model, and confirm availability. For test drives, capture details such as vehicle of interest, preferred times, and caller contact information. Use the CRM to log sales enquiries and service histories. Provide general information about pricing or service packages, and use integrations to check stock of vehicles or parts. Ensure all bookings and enquiries are logged for the sales and service teams.",
  insurance: "You are a client services assistant for an insurance provider in Australia. You answer calls about policies, renewals, and claims. Use CRM tools to record caller details and note the product they are enquiring about (e.g. home, car, life, health). Provide general information about policy inclusions or processes. For claims, log claim type and caller contact information, and ensure it is filed in the claims system. Send follow-up information via email/SMS, and always ensure accurate records are kept for compliance and future contact.",
  legal: "You are an intake assistant for a law firm in Australia. You handle first calls from people seeking legal services such as family law, property conveyancing, wills, or commercial matters. Collect the caller's name, contact information, and a short description of their issue. Use intake tools to securely store this data, ensuring confidentiality. Provide general information about how the firm works and use scheduling tools to book initial consultations. Ensure that each enquiry is logged into the client management system so solicitors have the right context before meetings.",
  trade: "You are a customer service assistant for a skilled trades business in Australia. You answer calls about plumbing, electrical, HVAC, carpentry, or other trade services. Use scheduling tools to book service appointments, record customer details, and capture the nature of the job required. For emergency calls, prioritize urgent requests and log them in the dispatch system. Provide general information about services, pricing, and availability. Use CRM tools to track customer history and service records. Ensure all bookings and service requests are logged for the trades team to follow up efficiently.",
  solar: "You are a sales and support assistant for a solar energy company in Australia. You answer calls about solar panel installations, energy savings, government rebates, and system maintenance. Use scheduling tools to book site assessments and installations. Capture customer details, property information, and energy usage requirements in the CRM. Provide information about solar benefits, financing options, and warranty coverage. Use lead management tools to track sales opportunities and follow up on quotes. Ensure all enquiries are logged for the sales and installation teams to provide timely service.",
  other: "You are a helpful customer service assistant. You answer calls professionally and assist customers with their enquiries. Use your training and available tools to provide accurate information and support. Capture customer details and interaction summaries in the CRM system. Schedule appointments or follow-ups as needed. Maintain a friendly and professional tone while ensuring all customer interactions are properly documented for future reference.",
}

const generatePresignedUrl = async (filename: string) => {
  const payload = { filename };
  const response = await axiosInstance.post(
    "knowledge/generate_presigned_url",
    payload
  );
  const data = response.data;
  if (!data.url) {
    throw new Error(data);
  }
  return data;
};
const uploadFileToAWS = async (
  key: string,
  awsAccessKeyId: string,
  awsSecurityToken: string,
  policy: string,
  signature: string,
  file: File
) => {
  const form = new FormData();
  form.append("key", key);
  form.append("AWSAccessKeyId", awsAccessKeyId);
  form.append("x-amz-security-token", awsSecurityToken);
  form.append("policy", policy);
  form.append("signature", signature);
  form.append("file", file);
  return axios.post(
    "https://millis-ai-agent-knowledge.s3.amazonaws.com/",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
};
const createKnowledge = async (file: File) => {
  try {
    const presignedUrl = await generatePresignedUrl(file.name);
    await uploadFileToAWS(
      presignedUrl.fields["key"],
      presignedUrl.fields["AWSAccessKeyId"],
      presignedUrl.fields["x-amz-security-token"],
      presignedUrl.fields["policy"],
      presignedUrl.fields["signature"],
      file
    );
    const data = {
      object_key: presignedUrl.fields.key,
      description: file.name,
      name: file.name,
      file_type: file.type,
      size: file.size,
    };
    const response = await axiosInstance.post("/knowledge/create_file", data);
    return response.data as string
  } catch (error) {
    console.error('Failed to create file', error)
    toast.error("Failed to create file")
  }
};

interface BuildingAnimationProps {
  agentData: any
  onComplete: () => void
}

export default function BuildingAnimation({ agentData, onComplete }: BuildingAnimationProps) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [matrixChars, setMatrixChars] = useState<string[]>([])
  const [isDark, setIsDark] = useState(true)

  const buildingSteps = [
    { id: 1, title: "Uploading files", icon: Upload },
    { id: 2, title: "Creating agent", icon: Bot },
    { id: 3, title: "Setting Up Phone Integration", icon: Phone },
    { id: 4, title: "Configuring Voice Engine", icon: MessageSquare },
    { id: 5, title: "Creating campaign", icon: Megaphone },
    { id: 6, title: "Configuring campaign", icon: Settings },
  ]

  const numberSteps = useMemo(() => {
    // Check if phone setup is properly configured
    const hasPhoneSetup = agentData.phoneSetup &&
      agentData.phoneSetup.provider &&
      (agentData.phoneSetup.phoneNumber || agentData.selectedPhoneNumber) &&
      (
        (agentData.phoneSetup.provider === "plivo" && agentData.phoneSetup.authId && agentData.phoneSetup.authToken) ||
        (agentData.phoneSetup.provider === "vanage" && agentData.phoneSetup.apiKey && agentData.phoneSetup.apiSecret) ||
        (agentData.phoneSetup.provider === "exotel" && agentData.phoneSetup.apiKey && agentData.phoneSetup.apiSecret && agentData.phoneSetup.accountSid && agentData.phoneSetup.appId) ||
        (agentData.phoneSetup.provider === "twilio" && agentData.phoneSetup.accountSid && agentData.phoneSetup.apiKey && agentData.phoneSetup.apiSecret)
      )

    // Check if knowledge base files exist
    const hasKnowledgeFiles = agentData.knowledgeBase?.files && agentData.knowledgeBase.files.length > 0

    let steps = 2 // Always have: Uploading files (if any), Creating agent

    if (hasKnowledgeFiles) {
      steps += 1 // Uploading files step
    }

    if (hasPhoneSetup) {
      steps += 4 // Phone import, Voice config, Campaign creation, Campaign config
    }

    return steps
  }, [agentData.phoneSetup, agentData.knowledgeBase])

  // Check theme from localStorage
  useEffect(() => {
    const theme = localStorage.getItem('theme')
    setIsDark(theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches))
  }, [])

  // Generate matrix characters
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()".split("")
    setMatrixChars(chars)
  }, [])

  useEffect(() => {
    const createKnowledges = async () => {
      const files = (agentData.knowledgeBase?.files || []) as File[]
      if (files.length === 0) {
        // Skip knowledge base creation if no files uploaded
        return []
      }
      const ids = await Promise.all(files.map((file) => createKnowledge(file)))
      setCurrentStep(1)
      return ids.filter(id => id !== undefined)
    }
    const createAgent = async (files: string[]) => {
      // Handle case where industry might be skipped (default to technology)
      const industryPrompt = industryPrompts[agentData.industry] || industryPrompts.technology

      // Build prompt with user-provided description if available
      let prompt = `You are ${agentData.agentName}.\n\n${industryPrompt}`

      if (agentData.description) {
        // Use the compiled description from wizard
        prompt += `\n\nAdditional context:\n"""\n${agentData.description}\n"""`
      } else {
        // Fallback to individual fields
        if (agentData.purpose) {
          prompt += `\n\nYour primary purpose is:\n"""\n${agentData.purpose}\n"""`
        }
        if (agentData.personality) {
          prompt += `\n\nYour personality is: ${agentData.personality}.`
        }
      }

      const payload: AgentTypeBase = {
        name: agentData.agentName,
        config: {
          prompt,
          voice: {
            provider: 'elevenlabs',
            voice_id: agentData.voice || voices[0].id, // Default to first voice if none selected
          },
          flow: {},
          first_message: agentData.greeting || `Hello! I'm ${agentData.agentName}. How can I help you today?`,
          language: "en-US" as LanguageType,
          ...(files.length > 0 ? {
            knowledge_base: { files }
          } : {})
        },
        tools: [],
      }
      const response = await axiosInstance.post("/agent", payload)
      setCurrentStep(2)
      return response.data
    }
    const importPhone = async () => {
      const payload: { [key: string]: string } = {
        provider: agentData.phoneSetup.provider || "twilio",
        region: agentData.phoneSetup.region,
        country: agentData.phoneSetup.country,
        phone: agentData.phoneSetup.phoneNumber || agentData.selectedPhoneNumber,
      }
      
      if (agentData.phoneSetup.provider === "plivo") {
        payload.auth_id = agentData.phoneSetup.authId
        payload.auth_token = agentData.phoneSetup.authToken
      } else {
        payload.api_key = agentData.phoneSetup.apiKey
        payload.api_secret = agentData.phoneSetup.apiSecret
        if (agentData.phoneSetup.provider !== "vanage") {
          payload.account_sid = agentData.phoneSetup.accountSid
        }
        if (agentData.phoneSetup.provider === "exotel") {
          payload.subdomain = agentData.phoneSetup.subdomain
          payload.app_id = agentData.phoneSetup.appId
        }
      }
      
      await axiosInstance.post("/phones/import", payload)
      setCurrentStep(3)
      return agentData.phoneSetup.phoneNumber || agentData.selectedPhoneNumber
    }
    const configuringVoice = async (agent: AgentTypeRead, phone: string) => {
      const response = await axiosInstance.post("/set_phone_agent", {
        phone: phone,
        agent_id: agent?.id,
      });
      const data = response.data;
      if (data !== "ok") {
        throw new Error(data.details);
      }
      setCurrentStep(4)
    }
    const createCampaign = async (phone: string) => {
      // Check if payment method exists before creating campaign
      try {
        const paymentMethodsResponse = await axiosInstance.get("/billing/payment-methods")
        const paymentMethods = paymentMethodsResponse.data.payment_methods || []

        if (paymentMethods.length === 0) {
          toast.warning("Please add a payment method before creating a campaign")
          navigate("/settings/billing")
          throw new Error("Payment method required")
        }
      } catch (error: any) {
        if (error.message === "Payment method required") {
          throw error
        }
        // If payment check fails for other reasons, still allow creation but log the error
        console.error('Failed to check payment methods:', error)
      }

      const response = await axiosInstance.post(
        `/campaigns`,
        { name: `Campaign for ${phone}` }
      )
      setCurrentStep(5)
      return response.data
    }
    const configureCampaign = async (campaign: CampaignTypeRead, phone: string) => {
      await axiosInstance.post(`/campaigns/${campaign.id}/set_caller`, {
        caller: phone,
      })
      setCurrentStep(6)
    }
    const startProgress = async () => {
      try {
        // Check if payment method exists before creating agent
        try {
          const paymentMethodsResponse = await axiosInstance.get("/billing/payment-methods")
          const paymentMethods = paymentMethodsResponse.data.payment_methods || []

          if (paymentMethods.length === 0) {
            toast.warning("Please add a payment method before creating an agent")
            navigate("/settings/billing")
            onComplete()
            return
          }
        } catch (error) {
          // If payment check fails, still allow creation but log the error
          console.error('Failed to check payment methods:', error)
        }

        const files = await createKnowledges()
        const agent = await createAgent(files)

        // Only setup phone integration if phone setup was not skipped
        const hasPhoneSetup = agentData.phoneSetup &&
          agentData.phoneSetup.provider &&
          (agentData.phoneSetup.phoneNumber || agentData.selectedPhoneNumber) &&
          (
            (agentData.phoneSetup.provider === "plivo" && agentData.phoneSetup.authId && agentData.phoneSetup.authToken) ||
            (agentData.phoneSetup.provider === "vanage" && agentData.phoneSetup.apiKey && agentData.phoneSetup.apiSecret) ||
            (agentData.phoneSetup.provider === "exotel" && agentData.phoneSetup.apiKey && agentData.phoneSetup.apiSecret && agentData.phoneSetup.accountSid && agentData.phoneSetup.appId) ||
            (agentData.phoneSetup.provider === "twilio" && agentData.phoneSetup.accountSid && agentData.phoneSetup.apiKey && agentData.phoneSetup.apiSecret)
          )

        if (hasPhoneSetup) {
          const phone = await importPhone()
          await configuringVoice(agent, phone)
          const campaign = await createCampaign(phone)
          await configureCampaign(campaign, phone)
        } else {
          // Skip phone setup steps if no phone configuration provided
          setCurrentStep(6)
        }

        setTimeout(() => {
          onComplete()
        }, 1000)
      } catch (e) {
        handleAxiosError("Failed to build agent", e)
        setTimeout(() => {
          onComplete()
        }, 5000)
      }
    }
    startProgress()
  }, [onComplete])

  return (
    <div className={clsx(
      "min-h-screen relative overflow-hidden flex items-center justify-center py-6",
      isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    )}>
      {/* Matrix Rain Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "absolute text-xs font-mono animate-matrix-rain",
              isDark ? 'text-green-400 opacity-20' : 'text-blue-500 opacity-15'
            )}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <div key={j} className="mb-1">
                {matrixChars[Math.floor(Math.random() * matrixChars.length)]}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Neural Network Visualization */}
      <div className="fixed inset-0 pointer-events-none">
        <svg className={clsx("w-full h-full", isDark ? 'opacity-10' : 'opacity-8')}>
          {Array.from({ length: 20 }).map((_, i) => (
            <g key={i}>
              <circle
                cx={`${20 + (i % 5) * 20}%`}
                cy={`${20 + Math.floor(i / 5) * 20}%`}
                r="2"
                fill={isDark ? "#F26AE1" : "#8B5CF6"}
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
              {i < 19 && (
                <line
                  x1={`${20 + (i % 5) * 20}%`}
                  y1={`${20 + Math.floor(i / 5) * 20}%`}
                  x2={`${20 + ((i + 1) % 5) * 20}%`}
                  y2={`${20 + Math.floor((i + 1) / 5) * 20}%`}
                  stroke={isDark ? "#A38AFF" : "#C084FC"}
                  strokeWidth="0.5"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Holographic Grid */}
      <div className={clsx("fixed inset-0 pointer-events-none", isDark ? 'opacity-5' : 'opacity-3')}>
        <div className="w-full h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 animate-gradient-shift" />
      </div>

      {/* Lightning Bolts */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-lightning"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <svg width="100" height="100" className={clsx(isDark ? 'text-cyan-400' : 'text-blue-500')}>
              <path
                d={`M${Math.random() * 50} ${Math.random() * 50} L${Math.random() * 50 + 25} ${Math.random() * 50 + 25} L${Math.random() * 50} ${Math.random() * 50 + 50}`}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="animate-pulse"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              "absolute w-1 h-1 rounded-full animate-float-hologram",
              isDark
                ? 'bg-gradient-to-r from-cyan-400 to-purple-400'
                : 'bg-gradient-to-r from-blue-500 to-purple-500'
            )}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Main Content */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-[#F26AE1] to-[#A38AFF] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
            <Brain className="w-12 h-12 text-white animate-spin-slow" />
          </div>
          <h1 className={clsx(
            "text-4xl font-bold mb-4 animate-text-glow",
            isDark ? 'text-white' : 'text-gray-900'
          )}>
            Building Your AI Agent
          </h1>
          <p className={clsx(
            "text-lg",
            isDark ? 'text-gray-300' : 'text-gray-600'
          )}>
            Creating {agentData.name} with advanced AI capabilities...
          </p>
        </div>

        {/* Progress Section */}
        <Card className={clsx(
          "border backdrop-blur-sm mb-8",
          isDark
            ? 'bg-gray-800/90 border-gray-700'
            : 'bg-white/90 border-gray-200 shadow-lg'
        )}>
          <CardContent className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className={clsx(
                  "font-medium",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  Overall Progress
                </span>
                <span className="text-[#F26AE1] font-bold">{Math.round((currentStep / numberSteps) * 100)}%</span>
              </div>
              <Progress value={currentStep / numberSteps} className={clsx(
                "h-3",
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              )} />
            </div>

            {/* Current Step */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-[#F26AE1] to-[#A38AFF] rounded-full flex items-center justify-center animate-glow">
                {React.createElement(buildingSteps[currentStep]?.icon || Brain, {
                  className: "w-6 h-6 text-white",
                })}
              </div>
              <div>
                <h3 className={clsx(
                  "font-semibold text-lg",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  {buildingSteps[currentStep]?.title || "Initializing..."}
                </h3>
                <p className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>
                  Processing neural pathways and configurations...
                </p>
              </div>
            </div>

            {/* Step List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const hasKnowledgeFiles = agentData.knowledgeBase?.files && agentData.knowledgeBase.files.length > 0
                const hasPhoneSetup = agentData.phoneSetup &&
                  agentData.phoneSetup.provider &&
                  (agentData.phoneSetup.phoneNumber || agentData.selectedPhoneNumber) &&
                  (
                    (agentData.phoneSetup.provider === "plivo" && agentData.phoneSetup.authId && agentData.phoneSetup.authToken) ||
                    (agentData.phoneSetup.provider === "vanage" && agentData.phoneSetup.apiKey && agentData.phoneSetup.apiSecret) ||
                    (agentData.phoneSetup.provider === "exotel" && agentData.phoneSetup.apiKey && agentData.phoneSetup.apiSecret && agentData.phoneSetup.accountSid && agentData.phoneSetup.appId) ||
                    (agentData.phoneSetup.provider === "twilio" && agentData.phoneSetup.accountSid && agentData.phoneSetup.apiKey && agentData.phoneSetup.apiSecret)
                  )

                // Filter steps based on what's being configured
                const relevantSteps = buildingSteps.filter((_, index) => {
                  if (index === 0) return hasKnowledgeFiles // Uploading files
                  if (index === 1) return true // Creating agent (always shown)
                  if (index >= 2) return hasPhoneSetup // Phone-related steps
                  return false
                })

                return relevantSteps.map((step, index) => {
                  const Icon = step.icon
                  const isCompleted = index < currentStep
                  const isActive = index === currentStep

                  return (
                    <div
                      key={step.id}
                      className={clsx(
                        "flex items-center space-x-3 p-3 rounded-lg transition-all border",
                        isActive && [
                          isDark
                            ? "bg-gradient-to-r from-[#F26AE1]/20 to-[#A38AFF]/20 border-[#F26AE1]/30"
                            : "bg-gradient-to-r from-[#F26AE1]/10 to-[#A38AFF]/10 border-[#F26AE1]/40"
                        ],
                        isCompleted && !isActive && [
                          isDark
                            ? "bg-green-500/10 border-green-500/20"
                            : "bg-green-100 border-green-300/50"
                        ],
                        !isCompleted && !isActive && [
                          isDark
                            ? "bg-gray-700/50 border-gray-600"
                            : "bg-gray-50 border-gray-200"
                        ]
                      )}
                    >
                      <div
                        className={clsx(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          isActive && "bg-gradient-to-r from-[#F26AE1] to-[#A38AFF] animate-glow",
                          isCompleted && !isActive && "bg-green-500",
                          !isCompleted && !isActive && [
                            isDark ? "bg-gray-600" : "bg-gray-300"
                          ]
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <Icon className={clsx(
                            "w-4 h-4 text-white",
                            isActive && "animate-spin-slow"
                          )} />
                        )}
                      </div>
                      <span
                        className={clsx(
                          "font-medium",
                          isActive && [isDark ? "text-white" : "text-gray-900"],
                          isCompleted && !isActive && "text-green-600",
                          !isCompleted && !isActive && [isDark ? "text-gray-400" : "text-gray-500"]
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                  )
                })
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Agent Configuration Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={clsx(
            "border backdrop-blur-sm",
            isDark
              ? 'bg-gray-800/90 border-gray-700'
              : 'bg-white/90 border-gray-200 shadow-lg'
          )}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Cpu className="w-6 h-6 text-[#F26AE1]" />
                <h3 className={clsx(
                  "font-semibold",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  AI Core
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Neural Layers:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>847</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Parameters:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>2.1B</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Training Data:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>15.2TB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={clsx(
            "border backdrop-blur-sm",
            isDark
              ? 'bg-gray-800/90 border-gray-700'
              : 'bg-white/90 border-gray-200 shadow-lg'
          )}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <MessageSquare className="w-6 h-6 text-[#A38AFF]" />
                <h3 className={clsx(
                  "font-semibold",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  Voice Engine
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Voice Model:</span>
                  <span className={clsx(
                    "capitalize",
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>{agentData.voiceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Tone:</span>
                  <span className={clsx(
                    "capitalize",
                    isDark ? 'text-white' : 'text-gray-900'
                  )}>{agentData.tone}</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Language:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>English (US)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={clsx(
            "border backdrop-blur-sm",
            isDark
              ? 'bg-gray-800/90 border-gray-700'
              : 'bg-white/90 border-gray-200 shadow-lg'
          )}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Database className="w-6 h-6 text-cyan-400" />
                <h3 className={clsx(
                  "font-semibold",
                  isDark ? 'text-white' : 'text-gray-900'
                )}>
                  Configuration
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Industry:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>{agentData.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>Goal:</span>
                  <span className={clsx(isDark ? 'text-white' : 'text-gray-900')}>{agentData.primaryGoal}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <Card className={clsx(
          "border backdrop-blur-sm",
          isDark
            ? 'bg-gray-800/90 border-gray-700'
            : 'bg-white/90 border-gray-200 shadow-lg'
        )}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className={clsx(
                "font-semibold",
                isDark ? 'text-white' : 'text-gray-900'
              )}>
                System Metrics
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">98.7%</div>
                <div className={clsx(
                  "text-sm",
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">1.2s</div>
                <div className={clsx(
                  "text-sm",
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">24/7</div>
                <div className={clsx(
                  "text-sm",
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>Availability</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">∞</div>
                <div className={clsx(
                  "text-sm",
                  isDark ? 'text-gray-400' : 'text-gray-600'
                )}>Scalability</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Messages */}
        <div className="mt-8 text-center">
          <div className={clsx(
            "flex items-center justify-center space-x-2",
            isDark ? 'text-gray-300' : 'text-gray-700'
          )}>
            <Sparkles className="w-5 h-5 text-[#F26AE1] animate-spin" />
            <span>Optimizing neural pathways for {agentData.industry} industry...</span>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}
