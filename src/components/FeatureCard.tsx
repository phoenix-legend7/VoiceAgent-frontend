interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="flex flex-col gap-2 w-full h-full backdrop-blur-xs border border-white/30 rounded-2xl overflow-hidden">
      <div className='p-6'>
        <div className='mb-4'>
          <div className="rounded-lg w-12 h-12 bg-white/5 text-sky-500 border border-white/30 flex items-center justify-center">
            <img src={icon} alt="" className="hue-rotate-[135deg]" />
          </div>
        </div>
        <h3 className="mb-3 text-2xl font-semibold leading-[1.2]">{title}</h3>
        <p className='text-neutral-400 mb-3'>{description}</p>
      </div>
    </div>
  )
}

export default FeatureCard
