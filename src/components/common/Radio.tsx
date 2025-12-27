import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, description, id, checked, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer items-start gap-3",
          props.disabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex items-center justify-center">
          <input
            type="radio"
            id={inputId}
            ref={ref}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all duration-200",
              "border-gray-300 bg-white",
              "peer-checked:border-[#C4885B]",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-[#C4885B] peer-focus-visible:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            )}
          >
            <div
              className={cn(
                "h-2.5 w-2.5 rounded-full bg-[#C4885B] transition-all duration-200",
                checked ? "scale-100 opacity-100" : "scale-0 opacity-0"
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-sm font-medium text-gray-900">{label}</span>
            )}
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Radio.displayName = "Radio";

export { Radio };
