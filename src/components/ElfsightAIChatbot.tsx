import { useEffect, useRef } from "react";

interface ElfsightAIChatbotProps {
  className?: string;
}

/**
 * Elfsight AI Chatbot (Elly AI - Spark Agent) Component
 * Embeds the Elfsight AI Chatbot widget
 */
export default function ElfsightAIChatbot({
  className = ""
}: ElfsightAIChatbotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://elfsightcdn.com/platform.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://elfsightcdn.com/platform.js";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }

    return () => {
      const eaapsPortal = document.getElementById('__EAAPS_PORTAL');
      if (eaapsPortal && eaapsPortal.parentNode) {
        eaapsPortal.parentNode.removeChild(eaapsPortal);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <div
        className={import.meta.env.VITE_APP_ELFSHIHT_WIDGET_CLASS}
        data-elfsight-app-lazy
      />
    </div>
  );
}

