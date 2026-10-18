import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "panel" | "primary-red" | "outline-red" | "light-red";
  padding?: "none" | "small" | "default" | "large";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = "default",
      padding = "default",
      className = "",
      ...props
    },
    ref
  ) => {
    // 14 to 20px radius as specified in Design Spec (rounded-[16px])
    const baseClasses = "rounded-[16px] transition-all";

    const variantClasses = {
      default: "bg-white border border-[#E0E0E0] text-[#1F1F1F] shadow-xs",
      panel: "bg-[#F7F7F7] border border-[#E0E0E0] text-[#1F1F1F]",
      "primary-red": "bg-[#C62828] text-white shadow-sm",
      "outline-red": "bg-white border-2 border-[#C62828] text-[#1F1F1F]",
      "light-red": "bg-[#FFF5F5] border border-[#FDECEC] text-[#1F1F1F]",
    }[variant];

    const paddingClasses = {
      none: "p-0",
      small: "p-4",
      default: "p-5 sm:p-6",
      large: "p-6 sm:p-8",
    }[padding];

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses} ${paddingClasses} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
