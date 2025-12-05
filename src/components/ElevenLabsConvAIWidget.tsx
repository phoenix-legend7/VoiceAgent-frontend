import { useEffect, useRef } from "react";

interface ElevenLabsConvAIWidgetProps {
  agentId: string;
  className?: string;
}

/**
 * ElevenLabs Conversational AI Widget Component
 * Embeds the ElevenLabs ConvAI widget for voice interactions
 */
export default function ElevenLabsConvAIWidget({
  agentId,
  className = ""
}: ElevenLabsConvAIWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://unpkg.com/@elevenlabs/convai-widget-embed@beta"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed@beta";
      script.async = true;
      script.type = "text/javascript";
      document.body.appendChild(script);
    }

    if (containerRef.current && agentId) {
      containerRef.current.innerHTML = "";

      const widgetElement = document.createElement("elevenlabs-convai");
      widgetElement.setAttribute("agent-id", agentId);

      containerRef.current.appendChild(widgetElement);
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [agentId]);

  return <div ref={containerRef} className={className} />;
}

