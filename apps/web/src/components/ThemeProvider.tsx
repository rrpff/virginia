import { ReactNode, useCallback, useEffect, useState } from "react";
import { Theme, ThemeContext } from "../contexts/theme";

const DEFAULT_THEME: Theme = {
  foreground: "oklch(37.5% 0.0296 19.18148516721477)",
  background: "oklch(94.85% 0.0148 19.18148516721477)",
  focus: "oklch(84.85% 0.1653 94.76)",
  contrast: "oklch(100% 0 0)",
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>({
    foreground: getCssVariable("--color-foreground") ?? "",
    background: getCssVariable("--color-background") ?? "",
    focus: getCssVariable("--color-focus") ?? "",
    contrast: getCssVariable("--color-contrast") ?? "",
  });

  const setThemeColor = useCallback((key: keyof Theme, value: string) => {
    setCssVariable(`--color-${key}`, value);
    setTheme((current) => ({
      ...current,
      [key]: value,
    }));
  }, []);

  const resetTheme = useCallback(() => {
    setCssVariable(`--color-foreground`, DEFAULT_THEME.foreground);
    setCssVariable(`--color-background`, DEFAULT_THEME.background);
    setCssVariable(`--color-focus`, DEFAULT_THEME.focus);
    setCssVariable(`--color-contrast`, DEFAULT_THEME.contrast);
    setTheme({ ...DEFAULT_THEME });
  }, []);

  useEffect(() => {
    localStorage.setItem("v_theme", JSON.stringify(theme));
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, resetTheme, setThemeColor }}
      children={children}
    />
  );
}

function setCssVariable(variable: string, value: string) {
  return document.documentElement.style.setProperty(variable, value);
}

function getCssVariable(variable: string) {
  return window.getComputedStyle(document.body).getPropertyValue(variable);
}
