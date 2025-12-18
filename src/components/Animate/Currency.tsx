import { useEffect, useState } from "react";
import { formatCurrency, getSelectedCurrency, convertFromUSDCents, Currency } from "../../utils/currency";

export function AnimatedCurrency({
  value,
  duration = 2000,
  fromCents = false,
  currency,
}: {
  value: number;
  duration?: number;
  fromCents?: boolean;
  currency?: Currency;
}) {
  const [count, setCount] = useState(0);
  const selectedCurrency = currency || getSelectedCurrency();

  // Convert value if it's in USD cents
  const convertedValue = fromCents
    ? convertFromUSDCents(value, selectedCurrency)
    : value;

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      setCount(progress * convertedValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [convertedValue, duration]);

  return <span>{formatCurrency(count, selectedCurrency)}</span>;
}
