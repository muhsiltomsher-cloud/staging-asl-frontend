import { forwardRef, Children, isValidElement, cloneElement } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, asChild = false, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary: "bg-gray-900 text-white hover:bg-gray-800 focus-visible:ring-gray-900",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-100 focus-visible:ring-gray-500",
      ghost: "hover:bg-gray-100 focus-visible:ring-gray-500",
      link: "text-gray-900 underline-offset-4 hover:underline focus-visible:ring-gray-500",
    };

    const sizes = {
      sm: "h-9 rounded-md px-3 text-sm",
      md: "h-10 rounded-md px-4 text-sm",
      lg: "h-12 rounded-md px-6 text-base",
    };

    const combinedClassName = cn(baseStyles, variants[variant], sizes[size], className);

    // Handle asChild - render child element with button styles
    if (asChild) {
      const child = Children.only(children);
      if (isValidElement(child)) {
        return cloneElement(child, {
          className: cn(combinedClassName, (child.props as { className?: string }).className),
          "aria-disabled": disabled || isLoading || undefined,
          ...props,
        } as React.HTMLAttributes<HTMLElement>);
      }
      return null;
    }

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
