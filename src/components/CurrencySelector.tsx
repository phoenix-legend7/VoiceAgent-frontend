import { useState, useEffect } from "react";
import { DollarSign } from "lucide-react";
import clsx from "clsx";
import {
  Currency,
  CURRENCIES,
  getSelectedCurrency,
  setSelectedCurrency
} from "../utils/currency";

interface CurrencySelectorProps {
  onCurrencyChange?: (currency: Currency) => void;
  className?: string;
}

export default function CurrencySelector({ onCurrencyChange, className }: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrencyState] = useState<Currency>(getSelectedCurrency());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved currency on mount
    setSelectedCurrencyState(getSelectedCurrency());
  }, []);

  const handleCurrencySelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    setSelectedCurrencyState(currency);
    setIsOpen(false);

    // Trigger callback if provided
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }

    // Reload the page to update all currency displays
    window.location.reload();
  };

  const currencyInfo = CURRENCIES[selectedCurrency];

  return (
    <div className={clsx("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <DollarSign className="w-4 h-4" />
        <span className="font-medium">{currencyInfo.code}</span>
        <span className="text-sm text-gray-500">({currencyInfo.symbol})</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                Select Currency
              </div>
              {Object.values(CURRENCIES).map((currency) => {
                const isSelected = currency.code === selectedCurrency;
                return (
                  <button
                    key={currency.code}
                    onClick={() => handleCurrencySelect(currency.code)}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors",
                      isSelected
                        ? "bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{currency.code}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {currency.symbol}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {currency.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
                All prices are stored in USD and converted using live exchange rates.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
