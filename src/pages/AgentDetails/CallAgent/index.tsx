import { FC, useState } from "react";

import Accordian from "../../../library/Accordian";
import { TabButton } from "../../../library/Tab";
import { AgentTypeRead } from "../../../models/agent";
import CallTab from "./CallTab";
import ChatTab from "./ChatTab";

interface CallAgentProps {
  agent: AgentTypeRead
}

const CallAgent: FC<CallAgentProps> = ({ agent }) => {
  const [activeTab, setActiveTab] = useState<string>("web")

  return (
    <Accordian title="Call Agent" className="mt-1.5 border border-sky-600">
      <div>
        <div className="flex items-center px-4">
          <TabButton label="Web" onClick={() => setActiveTab("web")} isActive={activeTab === "web"} />
          <TabButton label="Chat" onClick={() => setActiveTab("chat")} isActive={activeTab === "chat"} />
        </div>
        {activeTab === "web" && (
          <CallTab agent={agent} />
        )}
        {activeTab === "chat" && (
          <ChatTab agent={agent} />
        )}
      </div>
    </Accordian>
  )
}

export default CallAgent
