import { useCallback, useEffect, useState } from "react";
import Color from "colorjs.io";
import { useTheme } from "../contexts/theme";

export default function SettingsPage() {
  const { theme, resetTheme, setThemeColor } = useTheme();

  const handleColorChange = useCallback(
    (background: Color) => {
      const foreground = background.clone();
      foreground.l = background.l > 0.5 ? 0.3 : 0.95;

      const contrast = background.clone();
      contrast.l = Math.round(contrast.l);
      if (contrast.l === background.l) {
        contrast.l = contrast.l === 0 ? 0.05 : 0.95;
      }

      const focus = background.clone();
      focus.l = 0.7;
      focus.h = (focus.h + 180) % 360;
      focus.c = 0.2;

      setThemeColor("background", background.toString());
      setThemeColor("foreground", foreground.toString());
      setThemeColor("focus", focus.toString());
      setThemeColor("contrast", contrast.toString());
    },
    [setThemeColor]
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-black">Settings</h1>

      <div>
        <ColourSpace value={theme.background} onChange={handleColorChange} />
      </div>

      <div>
        {/* TODO: support unlocking this? and therefore locking the main palette */}
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
  const [color] = useState(() => new Color(value));

  const handleColorChange = useCallback(
    ({ x, y }: XY) => {
      color.h = x * 360;
      color.c = y;
      onChange(color);
    },
    [color, onChange]
  );

  const handleLightnessChange = useCallback(
    ({ y }: XY) => {
      color.l = 1.0 - y;
      onChange(color);
    },
    [color, onChange]
  );

  return (
    <div className="flex flex-row gap-8">
      <AreaSlider
        width={320}
        height={256}
        value={{ x: color.h / 360, y: color.c }}
        onChange={handleColorChange}
      />
      <AreaSlider
        width={1}
        height={256}
        value={{ x: 0, y: 1.0 - color.l }}
        onChange={handleLightnessChange}
      />
    </div>
  );
}

type XY = { x: number; y: number };
type AreaSliderProps = {
  height: number;
  width: number;
  value: XY | null;
  onChange: (position: XY) => void;
};

function AreaSlider({ width, height, value, onChange }: AreaSliderProps) {
  const [container, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [selector, setSelectorRef] = useState<HTMLDivElement | null>(null);
  const [position, setPosition] = useState<XY | null>(value);

  useEffect(() => {
    if (!selector || !container) return;

    const containerRect = container.getBoundingClientRect(); // TODO: resize
    let isDragging = false;

    const dragstart = (e: DragEvent) => {
      e.preventDefault();
      isDragging = true;
    };

    const mousemove = (e: MouseEvent) => {
      if (isDragging) {
        const areaWidth = containerRect.width;
        const areaHeight = containerRect.height;
        const mx = (e.clientX - containerRect.left) / areaWidth;
        const my = (e.clientY - containerRect.top) / areaHeight;

        const x = Math.max(0.0, Math.min(1.0, mx));
        const y = Math.max(0.0, Math.min(1.0, my));
        setPosition({ x, y });
        onChange({ x, y });
      }
    };

    const mouseup = () => {
      isDragging = false;
    };

    selector.addEventListener("dragstart", dragstart); // TODO: touch
    window.addEventListener("mousemove", mousemove);
    window.addEventListener("mouseup", mouseup);
    return () => {
      selector.removeEventListener("dragstart", dragstart);
      window.removeEventListener("mousemove", mousemove);
      window.removeEventListener("mouseup", mouseup);
    };
  }, [container, selector, onChange]);

  return (
    <div className="div">
      <div
        ref={setContainerRef}
        className="border-4 border-foreground rounded-sm relative"
        style={{
          width,
          height,
        }}
      >
        <div
          ref={setSelectorRef}
          draggable
          className="block w-8 h-8 bg-background border-4 border-foreground rounded-full absolute"
          style={{
            left: position ? `calc(${position.x * 100}% - 16px)` : 0,
            top: position ? `calc(${position.y * 100}% - 16px)` : 0,
            opacity: position ? "100%" : "0%",
          }}
        />
      </div>
    </div>
  );
}

// function ColorPicker({
//   value,
//   onChange,
//   ...props
// }: Omit<ComponentProps<"input">, "value" | "onChange"> & {
//   value: string;
//   onChange: (value: Color) => void;
// }) {
//   const color = useMemo(() => new Color(value).to("srgb"), [value]);

//   return (
//     <div
//       className="relative w-18 h-18 rounded-md outline-4 outline-foreground"
//       style={{ background: color.toString() }}
//     >
//       <input
//         type="color"
//         className="absolute top-0 left-0 w-full h-full opacity-0"
//         onChange={(e) => onChange(new Color(e.currentTarget.value).to("oklch"))}
//         value={color.toString({ format: "hex" })}
//         {...props}
//       />
//     </div>
//   );
// }
