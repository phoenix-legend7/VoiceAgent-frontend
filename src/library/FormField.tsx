import clsx from 'clsx';
import React, { useState } from 'react';

interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ label, value, onChange, placeholder, className, disabled, inputClassName }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={clsx(className, 'flex flex-col gap-2')}>
      {!!label && (
        <label
          className={clsx(
            'leading-[1.6] transition-colors duration-300',
            { 'text-green-600': isFocused, 'text-gray-400': disabled }
          )}
        >
          {label}
        </label>
      )}
      <input
        type="text"
        className={clsx(
          inputClassName,
          'rounded-md bg-neutral-800/50 border border-gray-700 w-full py-2 px-3 focus:border-green-600 focus:outline-none transition-all duration-300',
          { 'text-gray-400': disabled }
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled}
      />
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
}

export const InputBoxWithUnit: React.FC<InputBoxWithUnitProps> = ({ unit, value, onChange, placeholder, className, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className={clsx(
      className, 'flex items-center justify-center rounded pr-3.5 border border-gray-700 transition-all duration-300',
      isFocused ? 'border-green-600' : 'hover:border-white'
    )}>
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
      <span className="text-gray-400">{unit}</span>
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
            { 'text-green-600': isFocused, 'text-gray-400': disabled }
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
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-20',
          value ? 'bg-green-600 disabled:bg-green-600/20' : 'bg-gray-700',
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
