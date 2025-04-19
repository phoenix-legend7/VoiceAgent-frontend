import { useState } from "react";
import { RoundedButton } from "../library/Button";

interface CardProps {
  title: string;
  description: string;
}

const Card: React.FC<CardProps> = ({ title, description }) => {
  return (
    <div className='flex flex-col gap-2 w-full h-full backdrop-blur-xs border border-white/30 hover:border-white/80 cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden'>
      <div className='p-6'>
        <h3 className="mb-3 text-2xl font-semibold leading-[1.2]">{title}</h3>
        <p className='text-neutral-400 mb-3'>{description}</p>
      </div>
    </div>
  )
}
const UsageTabGroup = () => {
  const [activeTab, setActiveTab] = useState('tab1');
  const cards = {
    tab1: [
      {
        title: '24/7 Customer Support Automation',
        description: 'Automate routine inquiries with AI voice agents, providing 24/7 support and freeing up human agents for complex issues.',
      },
      {
        title: 'Lead Qualification and Follow-up',
        description: 'Boost sales efficiency with AI agents that qualify leads, capture customer information, and schedule follow-up calls.',
      },
      {
        title: 'Surveys and Feedback Collection',
        description: 'Collect valuable customer insights with AI that conducts surveys and gathers feedback, ensuring timely and accurate data.',
      },
    ],
    tab2: [
      {
        title: '24/7 Virtual Receptionist',
        description: 'Manage incoming calls, provide basic information, and route them efficiently with AI-powered virtual receptionists.',
      },
      {
        title: 'AI Voice Assistants for Field Work',
        description: 'Support field workers with AI that offers real-time coordination, task management, and operational support during on-site activities.',
      },
      {
        title: 'AI Co-Worker',
        description: 'Empower your employees with AI co-workers that assist with tasks, provide real-time information, and improve workplace productivity.',
      },
    ],
    tab3: [
      {
        title: 'Interactive Kiosks with AI avatars',
        description: 'Deliver engaging customer experiences with AI-driven interactive kiosks that provide information, process transactions, and more.',
      },
      {
        title: 'Wearable AI Devices',
        description: 'Bring AI closer to users with wearable devices like smart pendants, glasses, and watches that provide real-time assistance and notifications',
      },
      {
        title: 'Next-Gen Humanized Robots',
        description: 'Enable next-gen robots equipped with speech-to-speech reasoning, enabling natural voice communication and autonomous task execution.',
      },
    ],
  }
  return (
    <div className='my-6'>
      <div className='flex justify-center gap-4 mb-12'>
        <RoundedButton
          isActive={activeTab === 'tab1'}
          onClick={() => setActiveTab('tab1')}
        >
          Customer Support & Sales
        </RoundedButton>
        <RoundedButton
          isActive={activeTab === 'tab2'}
          onClick={() => setActiveTab('tab2')}
        >
          Virtual Assistants
        </RoundedButton>
        <RoundedButton
          isActive={activeTab === 'tab3'}
          onClick={() => setActiveTab('tab3')}
        >
          Voice-Enabled Devices
        </RoundedButton>
      </div>
      {activeTab === 'tab1' && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {cards.tab1.map((card, index) => (
            <Card key={`card-${index}`} {...card} />
          ))}
        </div>
      )}
      {activeTab === 'tab2' && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {cards.tab2.map((card, index) => (
            <Card key={`card-${index}`} {...card} />
          ))}
        </div>
      )}
      {activeTab === 'tab3' && (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {cards.tab3.map((card, index) => (
            <Card key={`card-${index}`} {...card} />
          ))}
        </div>
      )}
    </div>
  )
}

export default UsageTabGroup
