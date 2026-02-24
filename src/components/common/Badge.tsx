import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info" | "new" | "special";
}

export function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-[#C4885B] text-white",
    info: "bg-blue-100 text-blue-800",
    new: "bg-[#C4885B] text-white",
    special: "bg-gradient-to-r from-[#C4885B] to-[#D4A574] text-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-px text-[8px] font-normal uppercase tracking-wide leading-tight",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
