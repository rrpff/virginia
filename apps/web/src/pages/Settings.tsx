import { ComponentProps, Fragment } from "react";
import { useTheme } from "../contexts/theme";

export default function SettingsPage() {
  const { theme, resetTheme, setThemeColor } = useTheme();

  return (
    <Fragment>
      <h1 className="text-3xl font-black mb-4">Settings</h1>

      {/* TODO: fix warnings using custom color picker */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label className="pb-4" htmlFor="foreground">
            Foreground
            <small className="block text-muted">Text, borders, and icons</small>
          </label>
          <ColorPicker
            id="foreground"
            value={theme.foreground}
            onChange={(e) => setThemeColor("foreground", e.currentTarget.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="pb-4" htmlFor="background">
            Background
            <small className="block text-muted">
              The background of the app
            </small>
          </label>
          <ColorPicker
            id="background"
            value={theme.background}
            onChange={(e) => setThemeColor("background", e.currentTarget.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="pb-4" htmlFor="focus">
            Focus{" "}
            <small className="block text-muted">
              Seen when clicking buttons or using the keyboard to navigate
            </small>
          </label>
          <ColorPicker
            id="focus"
            value={theme.focus}
            onChange={(e) => setThemeColor("focus", e.currentTarget.value)}
          />
        </div>

        <div className="flex flex-col">
          <label className="pb-4" htmlFor="contrast">
            Contrast{" "}
            <small className="block text-muted">
              Background for inputs and some other elements. Should contrast
              slightly with the background and strongly with the foreground
            </small>
          </label>
          <ColorPicker
            id="contrast"
            value={theme.contrast}
            onChange={(e) => setThemeColor("contrast", e.currentTarget.value)}
          />
        </div>
      </div>

      <button
        className="mt-12 v-button"
        onClick={() => {
          if (confirm("Really reset?")) {
            resetTheme();
          }
        }}
      >
        Reset
      </button>
    </Fragment>
  );
}

function ColorPicker({ ...props }: ComponentProps<"input">) {
  return (
    <div
      className="relative w-18 h-18 rounded-md border-4 border-black outline-4 outline-white"
      style={{ background: props.value as string }}
    >
      <input
        type="color"
        className="absolute top-0 left-0 w-full h-full opacity-0"
        {...props}
      />
    </div>
  );
}
