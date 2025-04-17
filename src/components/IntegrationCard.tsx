interface IntegrationCardProps {
  title: string;
  description: React.ReactNode;
  icons: string[];
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({ title, description, icons }) => {
  return (
    <div className='flex flex-col gap-2 backdrop-blur-xs border border-white/30 hover:border-white/80 cursor-pointer transition-all duration-300 rounded-2xl overflow-hidden'>
      <div className='p-8'>
        <div className='grid grid-cols-3 gap-4 mb-4'>
          {icons.map((icon, index) => (
            <div key={`icon-${index}`} className='w-16 h-16 rounded-lg flex items-center justify-center border border-white/30'>
              <img src={icon} alt={`icon-${index}`} className='w-9 h-9' />
            </div>
          ))}
        </div>
        <h3 className="mb-3 text-2xl font-semibold leading-[1.2]">{title}</h3>
        <div className='text-neutral-400 mb-3'>{description}</div>
      </div>
    </div>
  )
}

export default IntegrationCard
