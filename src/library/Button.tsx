import clsx from "clsx";

interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  isActive?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const GradientButton: React.FC<ButtonProps> = ({ children, className, onClick, disabled }) => {
  return (
    <button
      className={clsx(
        'cursor-pointer gap-x-2 bg-transparent bg-gradient-to-r from-transparent to-black/20 dark:to-white/20 text-neutral-950 dark:text-neutral-50 border-[1px] border-black/70 dark:border-white/30 rounded-full py-2 px-6 min-w-[48px] min-h-[48px] font-normal leading-none no-underline transition-all duration-300 flex items-center justify-center hover:border-black/50 dark:hover:border-white/50 hover:outline-0',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const RoundedButton: React.FC<ButtonProps> = ({ children, className, onClick, isActive, disabled }) => {
  return (
    <button
      className={clsx(
        'cursor-pointer gap-x-2 border-[1px] border-black/60 dark:border-white/30 rounded-full py-2 px-6 min-w-[48px] min-h-[48px] font-normal leading-none no-underline transition-all duration-300 flex items-center justify-center hover:border-black dark:hover:border-white/50 hover:outline-0 hover:px-8 active:bg-sky-500',
        isActive ? 'bg-sky-500 text-white dark:text-black' : 'bg-transparent text-neutral-950 dark:text-neutral-50',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const TransparentButton: React.FC<ButtonProps> = ({ children, className, onClick, disabled }) => {
  return (
    <button
      className={clsx(
        'cursor-pointer gap-x-2 bg-transparent border border-gray-300 dark:border-gray-700 rounded-full py-2 px-6 min-w-[48px] min-h-[48px] font-normal leading-none no-underline transition-all duration-300 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
