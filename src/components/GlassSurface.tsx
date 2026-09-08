import { type HTMLAttributes, memo } from "react";

type GlassSurfaceProps = HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
};

export const GlassSurface = memo(function GlassSurface({
  className = "",
  interactive = false,
  onPointerMove,
  children,
  ...props
}: GlassSurfaceProps) {
  return (
    <div
      className={`liquid-glass ${interactive ? "liquid-glass-interactive" : ""} ${className}`}
      onPointerMove={(event) => {
        if (interactive) {
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.style.setProperty("--glass-x", `${event.clientX - rect.left}px`);
          event.currentTarget.style.setProperty("--glass-y", `${event.clientY - rect.top}px`);
        }
        onPointerMove?.(event);
      }}
      {...props}
    >
      {children}
    </div>
  );
});
