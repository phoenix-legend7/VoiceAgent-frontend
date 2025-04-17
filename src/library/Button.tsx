import clsx from "clsx";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const GradientButton: React.FC<ButtonProps> = ({ children, className, onClick }) => {
  return (
    <button
      className={clsx(
        'cursor-pointer gap-x-2 bg-transparent bg-gradient-to-r from-transparent to-white/20 text-neutral-50 border-[1px] border-white/30 rounded-full py-2 px-6 min-w-[48px] min-h-[48px] font-normal leading-none no-underline transition-all duration-300 flex items-center justify-center hover:border-white/50 hover:outline-0',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const RoundedButton: React.FC<ButtonProps> = ({ children, className, onClick, isActive }) => {
  return (
    <button
      className={clsx(
        'cursor-pointer gap-x-2 border-[1px] border-white/30 rounded-full py-2 px-6 min-w-[48px] min-h-[48px] font-normal leading-none no-underline transition-all duration-300 flex items-center justify-center hover:border-white/50 hover:outline-0 hover:px-8 active:bg-green-500',
        isActive ? 'bg-green-500 text-black' : 'bg-transparent text-neutral-50',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const TransparentButton: React.FC<ButtonProps> = ({ children, className, onClick }) => {
  return (
    <button
      className={clsx(
        'cursor-pointer gap-x-2 bg-transparent border-0 rounded-full py-2 px-6 min-w-[48px] min-h-[48px] font-normal leading-none no-underline transition-all duration-300 flex items-center justify-center hover:bg-white/10',
        className
      )}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
