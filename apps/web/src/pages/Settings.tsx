import { ComponentProps, useEffect, useMemo, useState } from "react";
import Color from "colorjs.io";
import { useTheme } from "../contexts/theme";

export default function SettingsPage() {
  const { theme, resetTheme, setThemeColor } = useTheme();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-black">Settings</h1>

      <div>
        <ColourSpace
          value={theme.background}
          onChange={(background) => {
            const foreground = background.clone();
            // foreground.l = 1.0 - foreground.l;
            foreground.l = background.l > 0.5 ? 0.3 : 0.95;
            // foreground.l = Math.min(
            //   1.0,
            //   Math.max(0.0, 1.0 - Math.round(background.l * 4) / 4)
            // );
            // if (Math.abs(foreground.l - background.l) < 0.4) {
            //   foreground.l = background.l > 0.5 ? 0.2 : 0.8;
            // }

            const contrast = background.clone();
            contrast.l = Math.round(contrast.l);

            const focus = background.clone();
            focus.l = 0.7;
            focus.h = (focus.h + 180) % 360;
            focus.c = 0.2;

            setThemeColor("background", background.toString());
            setThemeColor("foreground", foreground.toString());
            setThemeColor("focus", focus.toString());
            setThemeColor("contrast", contrast.toString());
          }}
        />
      </div>

      <div>
        <h2 className="font-bold mb-1">Generated palette</h2>
        <div className="inline-flex flex-row border-4 border-foreground rounded-sm overflow-hidden">
          <div
            className="w-12 h-12 border-r-4 border-foreground"
            style={{ background: theme.background }}
          />
          <div
            className="w-12 h-12 border-r-4 border-foreground"
            style={{ background: theme.foreground }}
          />
          <div
            className="w-12 h-12 border-r-4 border-foreground"
            style={{ background: theme.focus }}
          />
          <div
            className="w-12 h-12 border-foreground"
            style={{ background: theme.contrast }}
          />
        </div>
      </div>

      <div>
        <h2 className="font-bold mb-1">Pick!</h2>
        <ColorPicker
          value={theme.background}
          onChange={(background) => {
            const foreground = background.clone();
            // foreground.l = 1.0 - foreground.l;
            foreground.l = background.l > 0.5 ? 0.3 : 0.95;
            // foreground.l = Math.min(
            //   1.0,
            //   Math.max(0.0, 1.0 - Math.round(background.l * 4) / 4)
            // );
            // if (Math.abs(foreground.l - background.l) < 0.4) {
            //   foreground.l = background.l > 0.5 ? 0.2 : 0.8;
            // }

            const contrast = background.clone();
            contrast.l = Math.round(contrast.l);

            const focus = background.clone();
            focus.l = 0.7;
            focus.h = (focus.h + 180) % 360;
            focus.c = 0.2;

            setThemeColor("background", background.toString());
            setThemeColor("foreground", foreground.toString());
            setThemeColor("focus", focus.toString());
            setThemeColor("contrast", contrast.toString());
          }}
        />
      </div>

      <div>
        <button
          className="v-button"
          onClick={() => {
            if (confirm("Really reset?")) {
              resetTheme();
            }
          }}
        >
          Reset
        </button>
      </div>

      {/* TODO: fix warnings using custom color picker */}
      {/* <div className="flex flex-col gap-4">
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
      </div> */}
    </div>
  );
}

function ColourSpace({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: Color) => void;
}) {
  const [container, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [selector, setSelectorRef] = useState<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );

  const [colorString, setColorString] = useState("");

  useEffect(() => {
    if (!selector || !container) return;

    const containerRect = container.getBoundingClientRect(); // TODO: resize
    let isDragging = false;

    const color = new Color(value);

    const updateColor = () => {
      setColorString(color.toString());
      onChange(color);
    };

    const dragstart = (e: DragEvent) => {
      e.preventDefault();
      isDragging = true;
    };

    const mousemove = (e: MouseEvent) => {
      if (isDragging) {
        const areaWidth = containerRect.width; // TODO: factor in origin of grab
        const areaHeight = containerRect.height;
        const mx = (e.clientX - containerRect.left) / areaWidth;
        const my = (e.clientY - containerRect.top) / areaHeight;

        const x = Math.max(0.0, Math.min(1.0, mx));
        const y = Math.max(0.0, Math.min(1.0, my));

        setPosition({ x, y });
        color.c = y;
        color.h = x * 360;
        updateColor();
      }
    };

    const mouseup = () => {
      isDragging = false;
    };

    updateColor();
    setPosition({ x: 0, y: 0 }); // TODO: update here
    selector.addEventListener("dragstart", dragstart); // TODO: touch
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
    return () => {
      selector.removeEventListener("dragstart", dragstart);
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
    };
  }, [container, selector]);

  // TODO: update color ref w new values

  return (
    <div className="div">
      <div
        ref={setContainerRef}
        className="w-80 h-64 border-4 border-foreground rounded-sm relative"
      >
        <div
          ref={setSelectorRef}
          draggable
          className="block w-8 h-8 border-4 border-foreground rounded-full absolute"
          style={{
            background: colorString,
            left: position ? `calc(${position.x * 100}% - 16px)` : 0,
            top: position ? `calc(${position.y * 100}% - 16px)` : 0,
            opacity: position ? "100%" : "0%",
          }}
        />
      </div>
    </div>
  );
}

function ColorPicker({
  value,
  onChange,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange"> & {
  value: string;
  onChange: (value: Color) => void;
}) {
  const color = useMemo(() => new Color(value).to("srgb"), [value]);

  return (
    <div
      className="relative w-18 h-18 rounded-md outline-4 outline-foreground"
      style={{ background: color.toString() }}
    >
      <input
        type="color"
        className="absolute top-0 left-0 w-full h-full opacity-0"
        onChange={(e) => onChange(new Color(e.currentTarget.value).to("oklch"))}
        value={color.toString({ format: "hex" })}
        {...props}
      />
    </div>
  );
}
