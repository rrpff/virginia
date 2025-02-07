import { createContext, useContext } from "react";

export type Theme = {
  foreground: string;
  background: string;
  focus: string;
  contrast: string;
};

export type ThemeContextType = {
  setThemeColor: (key: keyof Theme, value: string) => void;
  theme: Theme;
};

export const ThemeContext = createContext<ThemeContextType>({
  setThemeColor: () => {},
  theme: {
    foreground: "",
    background: "",
    focus: "",
    contrast: "",
  },
});

export function useTheme() {
  return useContext(ThemeContext);
}
