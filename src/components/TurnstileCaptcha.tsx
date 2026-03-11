import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: any) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
}

const SITE_KEY = "0x4AAAAAACoCUaSTI918Bqoa";

const TurnstileCaptcha = ({ onVerify, onExpire }: TurnstileCaptchaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const [ready, setReady] = useState(!!window.turnstile);

  // Keep refs updated without causing re-renders
  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (window.turnstile) {
      setReady(true);
      return;
    }

    // Check if script is already loading
    const existing = document.querySelector('script[src*="turnstile"]');
    if (existing) {
      // Script exists but turnstile not ready yet — poll for it
      const poll = setInterval(() => {
        if (window.turnstile) {
          setReady(true);
          clearInterval(poll);
        }
      }, 100);
      return () => clearInterval(poll);
    }

    // Load script with onload callback
    window.onTurnstileLoad = () => setReady(true);
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      window.onTurnstileLoad = undefined;
    };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current || !window.turnstile) return;

    // Remove existing widget if any
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {}
      widgetIdRef.current = null;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!containerRef.current || !window.turnstile) return;
      
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token: string) => onVerifyRef.current(token),
        "expired-callback": () => onExpireRef.current?.(),
        theme: "dark",
        appearance: "always",
        size: "normal",
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [ready]);

  return (
    <div className="flex justify-center my-3">
      <div ref={containerRef} />
      {!ready && (
        <p className="text-xs text-muted-foreground animate-pulse">Loading verification...</p>
      )}
    </div>
  );
};

export default TurnstileCaptcha;
