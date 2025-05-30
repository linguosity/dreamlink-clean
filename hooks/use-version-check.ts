import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useVersionCheck() {
  const currentVersion = useRef<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    async function checkVersion() {
      try {
        const res = await fetch("/version.json", { cache: "no-store" });
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
        // Ignore network errors
        console.log("Version check failed:", e);
      }
    }
    
    // Check immediately and then every 30 seconds
    checkVersion();
    interval = setInterval(checkVersion, 30000);
    
    return () => clearInterval(interval);
  }, []);
}