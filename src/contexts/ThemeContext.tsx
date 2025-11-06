import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeConfig {
  darkMode: boolean;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
}

interface ThemeContextType extends ThemeConfig {
  setDarkMode: (value: boolean) => void;
  setPrimaryColor: (color: string) => void;
  setLogoUrl: (url: string) => void;
  setFaviconUrl: (url: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultConfig: ThemeConfig = {
  darkMode: false,
  primaryColor: "217 91% 60%",
  logoUrl: "",
  faviconUrl: "",
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem("leon-theme-config");
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  useEffect(() => {
    localStorage.setItem("leon-theme-config", JSON.stringify(config));
    
    if (config.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    document.documentElement.style.setProperty("--primary", config.primaryColor);
    document.documentElement.style.setProperty("--accent", config.primaryColor);
    document.documentElement.style.setProperty("--sidebar-primary", config.primaryColor);
    document.documentElement.style.setProperty("--ring", config.primaryColor);

    if (config.faviconUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement("link");
      link.type = "image/x-icon";
      link.rel = "shortcut icon";
      link.href = config.faviconUrl;
      document.getElementsByTagName("head")[0].appendChild(link);
    }
  }, [config]);

  const setDarkMode = (value: boolean) => {
    setConfig((prev) => ({ ...prev, darkMode: value }));
  };

  const setPrimaryColor = (color: string) => {
    setConfig((prev) => ({ ...prev, primaryColor: color }));
  };

  const setLogoUrl = (url: string) => {
    setConfig((prev) => ({ ...prev, logoUrl: url }));
  };

  const setFaviconUrl = (url: string) => {
    setConfig((prev) => ({ ...prev, faviconUrl: url }));
  };

  return (
    <ThemeContext.Provider
      value={{
        ...config,
        setDarkMode,
        setPrimaryColor,
        setLogoUrl,
        setFaviconUrl,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
