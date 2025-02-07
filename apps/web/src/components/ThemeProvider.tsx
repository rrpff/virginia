import { ReactNode, useCallback, useEffect, useState } from "react";
import { Theme, ThemeContext } from "../contexts/theme";

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

  useEffect(() => {
    localStorage.setItem("v_theme", JSON.stringify(theme));
    console.log(localStorage.getItem("v_theme"));
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setThemeColor }}
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
