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

    // The widget will be rendered by the Elfsight platform script
    // based on the div with the class and data attribute
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <div
        className="elfsight-app-60b0fe01-f123-43a2-82c7-ae2313f6b519"
        data-elfsight-app-lazy
      />
    </div>
  );
}

