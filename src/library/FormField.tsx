import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  invalidText?: string;
}

export const InputBox: React.FC<InputBoxProps> = ({ label, value, onChange, onBlur, onKeyDown, placeholder, className, disabled, inputClassName, invalidText }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={clsx(className, 'flex flex-col gap-2')}>
      {!!label && (
        <label
          className={clsx(
            'leading-[1.6] transition-colors duration-300',
            {
              'text-red-500': !!invalidText,
              'text-sky-600': !invalidText && isFocused,
              'text-gray-400': disabled,
            }
          )}
        >
          {label}
        </label>
      )}
      <input
        type="text"
        className={clsx(
          inputClassName,
          'rounded-md bg-neutral-800/50 border w-full py-2 px-3 focus:outline-none transition-all duration-300',
          !invalidText ? 'border-gray-700 focus:border-sky-600' : 'border-red-500',
          { 'text-gray-400': disabled }
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false)
          onBlur?.()
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      {!!invalidText && (
        <div className="text-red-500 text-sm">{invalidText}</div>
      )}
    </div>
  )
}

interface InputBoxWithUnitProps {
  value: number;
  unit: string;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showRightUnit?: boolean;
}

export const InputBoxWithUnit: React.FC<InputBoxWithUnitProps> = ({ unit, value, onChange, placeholder, className, disabled, showRightUnit = true }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className={clsx(
      className, 'flex items-center justify-center rounded border border-gray-700 transition-all duration-300',
      isFocused ? 'border-sky-600' : 'hover:border-white',
      showRightUnit ? 'pr-3.5' : 'pl-3.5'
    )}>
      {!showRightUnit && <span className="text-gray-400">{unit}</span>}
      <input
        type="number"
        className={clsx(
          'rounded-md w-full py-2 px-3 focus:outline-none',
          { 'text-gray-400': disabled }
        )}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {showRightUnit && <span className="text-gray-400">{unit}</span>}
    </div>
  )
}

interface SwitchWithLabelProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  badgeText?: string;
}

export const SwtichWithLabel: React.FC<SwitchWithLabelProps> = ({ label, value, onChange, className, disabled, badgeText }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={clsx(className, 'flex items-center gap-4 form-switch')}>
      {!!label && (
        <label
          className={clsx(
            'leading-[1.6] transition-colors duration-300',
            { 'text-sky-600': isFocused, 'text-gray-400': disabled }
          )}
        >
          {label}
        </label>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={value}
        className={clsx(
          'relative cursor-pointer inline-flex h-6 min-w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-sky-600 focus:ring-offset-2 disabled:opacity-20',
          value ? 'bg-sky-600 disabled:bg-sky-600/20' : 'bg-gray-700',
        )}
        onClick={() => onChange(!value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={disabled}
      >
        <span
          className={clsx(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            value ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
      {!!badgeText && (
        <div className="bg-gray-700 text-white px-2 py-0.5 rounded-md text-sm">
          {badgeText}
        </div>
      )}
    </div>
  )
}

interface SwitchWithMessageProps {
  value: string;
  messages: { label: string; value: string }[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const SwitchWithMessage: React.FC<SwitchWithMessageProps> = ({ label, value, onChange, className, disabled, messages }) => {
  return (
    <div className={clsx(className, 'flex items-center gap-4 text-sm')}>
      {!!label && <label className="leading-[1.6] transition-colors duration-300">{label}</label>}
      <div className="flex items-center rounded overflow-hidden border border-gray-700">
        {messages.map((message) => (
          <button
            key={message.value}
            type="button"
            className={clsx(
              'cursor-pointer p-2 transition-colors duration-300',
              value === message.value ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'hover:bg-gray-800 text-gray-400'
            )}
            onClick={() => onChange(message.value)}
            disabled={disabled}
          >
            {message.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  className,
  disabled,
  defaultValue,
  min = 0,
  max = 1,
  step = 0.05,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const progress = useMemo(() =>
    (value - min) / (max - min) * 100,
    [value, min, max]
  );
  const defaultValueProgress = useMemo(() =>
    defaultValue ? (defaultValue - min) / (max - min) * 100 : 0,
    [defaultValue, min, max]
  );

  useEffect(() => {
    if (tooltipRef.current) {
      const tooltipWidth = tooltipRef.current.offsetWidth;
      tooltipRef.current.style.left = `calc(${progress}% - ${tooltipWidth / 2}px)`;
    }
  }, [progress]);
  useEffect(() => {
    if (inputRef.current) {
      const mainColor = disabled ? 'oklch(0.872 0.01 258.338)' : 'oklch(0.627 0.194 149.214)';
      const backColor = disabled ? 'oklch(0.551 0.027 264.364)' : 'oklch(0.393 0.095 152.535)';
      inputRef.current.style.background = `linear-gradient(to right, ${mainColor} ${progress}%, ${backColor} ${progress}%)`;
    }
  }, [value, min, max, disabled]);

  return (
    <div className={className}>
      <div className="relative">
        <input
          ref={inputRef}
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseEnter={() => setIsDragging(true)}
          onMouseLeave={() => setIsDragging(false)}
          disabled={disabled}
          className="w-full cursor-pointer disabled:cursor-not-allowed focus:outline-none h-1 range-input"
          min={min}
          max={max}
          step={step}
        />
        <div
          className={clsx(
            "absolute transition-opacity duration-300",
            isDragging ? 'opacity-100' : 'opacity-0'
          )}
          ref={tooltipRef}
          style={{ top: 'calc(-100% - 5px)' }}
        >
          <div className='px-3 py-1 rounded-xs bg-neutral-500 text-sm'>{value}</div>
        </div>
        {defaultValue && (
          <>
            <div className="absolute top-full mt-1" style={{ left: `calc(${defaultValueProgress}% - 25px)` }}>
              <div className={value >= defaultValue ? 'text-white' : 'text-gray-400'}>
                Default
              </div>
            </div>
            <div
              className="absolute w-0.5 h-1 top-[50%] mt-0.5 bg-sky-400"
              style={{ left: `calc(${defaultValueProgress}% - 1px)` }}
            />
          </>
        )}
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="text-white">{min}</div>
        <div className={value === max ? 'text-white' : 'text-gray-400'}>
          {max}
        </div>
      </div>
    </div>
  )
}
