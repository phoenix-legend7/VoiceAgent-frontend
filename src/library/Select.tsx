import clsx from "clsx";
import React, {
  useState,
  useRef,
  useEffect,
  FC,
  isValidElement,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { FaTimes } from "react-icons/fa";
import { SelectOptionType } from "../models/common";

interface LabelProps {
  children?: ReactNode;
  className?: string;
}
interface Props {
  options: SelectOptionType[];
  className?: string;
  isMulti?: boolean;
  isSearchable?: boolean;
  menuClassName?: string;
  menuPortalTarget?: HTMLDivElement | null;
  placeholder?: string;
  value?: SelectOptionType | SelectOptionType[];
  onChange?: (e: SelectOptionType | SelectOptionType[]) => void;
}

const Select: FC<Props> = ({
  options,
  className = "",
  menuClassName,
  menuPortalTarget = document.body,
  isMulti = false,
  isSearchable = false,
  placeholder = "Select...",
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const selectRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const getTextFromLabel = (label: ReactNode): string => {
    if (typeof label === "string") {
      return label;
    }

    if (typeof label === "number") {
      return label.toString();
    }

    if (isValidElement<LabelProps>(label)) {
      // TypeScript now knows label is a ReactElement
      const children = label.props.children;
      if (Array.isArray(children)) {
        return children.map((child) => getTextFromLabel(child)).join(" ");
      }
      return getTextFromLabel(children);
    }

    if (Array.isArray(label)) {
      return label.map((item) => getTextFromLabel(item)).join(" ");
    }

    return "";
  };
  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    getTextFromLabel(option.label)
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        (!menuRef.current || !menuRef.current.contains(event.target as Node))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredOptions.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions]);

  const handleSelect = (option: SelectOptionType) => {
    if (isMulti) {
      const newValue = value ? [...(value as SelectOptionType[])] : [];
      const index = newValue.findIndex((v) => v.value === option.value);

      if (index >= 0) {
        newValue.splice(index, 1);
      } else {
        newValue.push(option);
      }

      onChange?.(newValue);
    } else {
      onChange?.(option);
      setIsOpen(false);
    }
    setSearchTerm("");
    setHighlightedIndex(-1);
  };

  const isSelected = (option: SelectOptionType) => {
    if (!value) return false;
    return isMulti
      ? (value as SelectOptionType[]).some((v) => v.value === option.value)
      : (value as SelectOptionType).value === option.value;
  };

  const removeOption = (option: SelectOptionType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMulti && value) {
      onChange?.(
        (value as SelectOptionType[]).filter((v) => v.value !== option.value)
      );
    }
  };

  const renderMenu = () => {
    const menuContent = (
      <div
        ref={menuRef}
        className={clsx(
          "absolute z-[100] w-full mt-1 bg-gray-900 border border-gray-600 rounded shadow-lg",
          menuClassName
        )}
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          width: `${menuPosition.width}px`,
        }}
      >
        {isSearchable && (
          <div className="p-2 border-b border-gray-500">
            <input
              type="text"
              className="w-full p-1 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        )}
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-gray-500">No options found</div>
          ) : (
            filteredOptions.map((option, index) => (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected(option)}
                className={clsx("p-2 cursor-pointer hover:bg-gray-700 border-gray-600", {
                  "bg-sky-800": isSelected(option),
                  "bg-gray-900": highlightedIndex === index,
                  "border-t": !!index,
                })}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <div className="flex items-center gap-2">
                  {option.icon}
                  {option.label}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );

    if (menuPortalTarget) {
      return createPortal(menuContent, menuPortalTarget);
    }
    return menuContent;
  };

  return (
    <div ref={selectRef} className={clsx("relative select-none", className)}>
      <div
        className={clsx(
          "flex items-center justify-between p-2 border rounded cursor-pointer",
          isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-600"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {!value || (isMulti && (value as SelectOptionType[]).length === 0) ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : isMulti ? (
            (value as SelectOptionType[]).map((option) => (
              <span
                key={option.value}
                className="flex items-center bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm gap-1"
              >
                {option.icon}
                {option.label}
                <button
                  type="button"
                  className="cursor-pointer text-gray-700 hover:text-gray-500"
                  onClick={(e) => removeOption(option, e)}
                >
                  <FaTimes />
                </button>
              </span>
            ))
          ) : (
            <span className="flex items-center gap-2">
              {(value as SelectOptionType).icon}
              {(value as SelectOptionType).label}
            </span>
          )}
        </div>
        <svg
          className={clsx(
            "w-5 h-5 text-gray-400 transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && renderMenu()}
    </div>
  );
};

interface GroupSelectOptionType extends SelectOptionType {
  badge?: string;
}
interface GroupedSelectProps {
  options: Array<{
    group?: string;
    options: Array<GroupSelectOptionType>;
  }>;
  className?: string;
  value?: GroupSelectOptionType;
  placeholder?: string;
  onChange?: (value: GroupSelectOptionType | undefined) => void;
}

export const GroupedSelect: FC<GroupedSelectProps> = ({
  options,
  className = "",
  value,
  placeholder = "Select...",
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const selectRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate menu position when opening
  useEffect(() => {
    if (isOpen && selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node) &&
        (!menuRef.current || !menuRef.current.contains(event.target as Node))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option: GroupSelectOptionType) => {
    onChange?.(option);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const isSelected = (option: GroupSelectOptionType) => {
    if (!value) return false;
    return (value as GroupSelectOptionType).value === option.value;
  };

  const renderMenu = () => {
    const menuContent = (
      <div
        ref={menuRef}
        className="absolute z-[100] w-full mt-1 bg-gray-900 border border-gray-600 rounded shadow-lg"
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          width: `${menuPosition.width}px`,
        }}
      >
        <div className="max-h-60 overflow-y-auto py-2">
          {options.length === 0 ? (
            <div className="p-2 text-gray-500">No options found</div>
          ) : (
            options.map((groupOption, groupIndex) => (
              <div key={groupIndex}>
                {groupOption.group && (
                  <div key={groupIndex} className="my-3">
                    <div className="flex shrink-0 after:w-100 after:top-1/2 after:border-t after:border-gray-700 after:translate-y-1/2 before:w-100 before:top-1/2 before:border-t before:border-gray-700 before:translate-y-1/2">
                      <div className="px-2 text-nowrap font-bold">
                        {groupOption.group}
                      </div>
                    </div>
                  </div>
                )}
                {groupOption.options.map((option, index) => (
                  <div
                    key={option.value}
                    role="option"
                    aria-selected={isSelected(option)}
                    className={clsx(
                      "px-4 py-2 cursor-pointer hover:bg-gray-800",
                      {
                        "bg-sky-800": isSelected(option),
                        "bg-gray-900": highlightedIndex === index,
                      }
                    )}
                    onClick={() => handleSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                      {!!option.badge && (
                        <span className="px-2 py-1 text-xs font-medium text-white bg-gray-700 rounded-lg">
                          {option.badge}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    );

    return createPortal(menuContent, document.body);
  };

  return (
    <div ref={selectRef} className={clsx("relative select-none", className)}>
      <div
        className={clsx(
          "flex items-center justify-between p-2 border rounded cursor-pointer",
          isOpen ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-600"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {!value ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            <span className="flex items-center gap-2">
              {(value as GroupSelectOptionType).icon}
              {(value as GroupSelectOptionType).label}
            </span>
          )}
        </div>
        <svg
          className={clsx(
            "w-5 h-5 text-gray-400 transition-transform duration-200",
            isOpen ? "rotate-180" : ""
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {isOpen && renderMenu()}
    </div>
  );
};

export default Select;
