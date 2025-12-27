import { forwardRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
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
            type="checkbox"
            id={inputId}
            ref={ref}
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-sm border-2 transition-all duration-200",
              "border-[#C4885B] bg-white",
              "peer-checked:bg-[#C4885B] peer-checked:border-[#C4885B]",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-[#C4885B] peer-focus-visible:ring-offset-2",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            )}
          >
            <Check
              className={cn(
                "h-3.5 w-3.5 text-white transition-opacity duration-200",
                checked ? "opacity-100" : "opacity-0"
              )}
              strokeWidth={3}
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

Checkbox.displayName = "Checkbox";

export { Checkbox };
