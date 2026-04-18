import { cn } from "@/lib/utils";

interface AdSlotProps {
  variant?: "banner" | "sidebar" | "in-content";
  className?: string;
}

/**
 * Placeholder ad slot reserved for Google AdSense.
 * Replace inner content with your AdSense `<ins class="adsbygoogle">` tag.
 */
export function AdSlot({ variant = "banner", className }: AdSlotProps) {
  const sizes = {
    banner: "h-24 md:h-28",
    sidebar: "h-64",
    "in-content": "h-32 md:h-40",
  };
  return (
    <aside
      className={cn("ad-slot w-full", sizes[variant], className)}
      aria-label="Advertisement"
      data-ad-slot={variant}
    >
      <span>Advertisement</span>
    </aside>
  );
}
