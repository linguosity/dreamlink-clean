"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface Preferences {
  emailNotifications: boolean;
  darkMode: boolean;
  dreamReminders: boolean;
  reminderTime: string;
  biblicalReferences: boolean;
  language: string;
  showCoverImages: boolean;
}

const defaultPreferences: Preferences = {
  emailNotifications: true,
  darkMode: false,
  dreamReminders: true,
  reminderTime: "21:00",
  biblicalReferences: true,
  language: "en",
  showCoverImages: true
};

interface PreferencesContextType {
  preferences: Preferences;
  updatePreferences: (newPreferences: Partial<Preferences>) => void;
  loading: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadPreferences() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();
          
          if (profileData?.preferences) {
            setPreferences({
              ...defaultPreferences,
              ...profileData.preferences
            });
          }
        }
      } catch (error) {
        console.error("Error loading preferences:", error);
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [supabase]);

  const updatePreferences = async (newPreferences: Partial<Preferences>) => {
    const updatedPreferences = { ...preferences, ...newPreferences };
    setPreferences(updatedPreferences);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('profiles')
          .upsert({ 
            id: user.id, 
            preferences: updatedPreferences 
          });
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      // Revert on error
      setPreferences(preferences);
    }
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreferences, loading }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}