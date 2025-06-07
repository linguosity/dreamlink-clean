import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useVersionCheck() {
  const currentVersion = useRef<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    async function checkVersion() {
      try {
        const res = await fetch("/version.json", { cache: "no-store" });
        if (!res.ok) {
          if (res.status === 404) {
            // Version file doesn't exist yet, silently skip
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const { version } = await res.json();
        
        if (currentVersion.current && currentVersion.current !== version) {
          toast("New version available", {
            description: "Click to refresh and get the latest updates.",
            action: {
              label: "Refresh",
              onClick: () => window.location.reload(),
            },
            duration: 0, // stays up until clicked
          });
        }
        currentVersion.current = version;
      } catch (e) {
        // Only log non-network errors
        if (e instanceof Error && !e.message.includes('Failed to fetch')) {
          console.log("Version check failed:", e);
        }
      }
    }
    
    // Check immediately and then every 30 seconds
    checkVersion();
    interval = setInterval(checkVersion, 30000);
    
    return () => clearInterval(interval);
  }, []);
}