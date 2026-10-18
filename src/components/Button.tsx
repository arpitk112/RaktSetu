import React from "react";
import Link from "next/link";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "default" | "compact";
  fullWidth?: boolean;
  href?: string;
  external?: boolean;
}

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "default",
      fullWidth = false,
      href,
      external = false,
      className = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Height & sizing rules from Design Spec:
    // Primary/Secondary default: 52px high, 12px radius, min 44px tap target
    // Compact: 44px high (for lists/cards)
    const baseClasses =
      "inline-flex items-center justify-center font-bold text-center transition-colors select-none focus:outline-none focus:ring-2 focus:ring-[#C62828] focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const sizeClasses =
      size === "compact"
        ? "h-[44px] px-4 text-[15px] rounded-[10px]"
        : "h-[52px] px-6 text-[16px] rounded-[12px]";

    const variantClasses = {
      primary:
        "bg-[#C62828] text-white hover:bg-[#B71C1C] active:bg-[#991B1B] shadow-sm",
      secondary:
        "bg-white text-[#C62828] border-2 border-[#C62828] hover:bg-[#FFF5F5] active:bg-[#FDECEC]",
      danger:
        "bg-[#B71C1C] text-white hover:bg-[#991B1B] active:bg-[#7F1D1D]",
      ghost:
        "bg-transparent text-[#C62828] hover:bg-[#FFF5F5] active:bg-[#FDECEC]",
    }[variant];

    const widthClasses = fullWidth ? "w-full" : "";
    const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${widthClasses} ${className}`.trim();

    if (href) {
      if (external) {
        return (
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={combinedClasses}
          >
            {children}
          </a>
        );
      }
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={combinedClasses}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        disabled={disabled}
        className={combinedClasses}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
