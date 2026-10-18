import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      id,
      className = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    // Generate a stable ID if none provided
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-[14px] sm:text-[15px] font-semibold text-[#1F1F1F] flex items-center gap-1"
          >
            {label}
            {required && <span className="text-[#C62828]" aria-hidden="true">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          disabled={disabled}
          className={`h-[48px] px-3.5 rounded-[10px] border-[1.5px] text-[16px] text-[#1F1F1F] bg-white transition-colors placeholder:text-[#5F5F5F] focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 disabled:bg-[#F7F7F7] disabled:text-[#5F5F5F] disabled:cursor-not-allowed ${
            error
              ? "border-[#C62828] focus:border-[#C62828] focus:ring-[#C62828]/30"
              : "border-[#E0E0E0] hover:border-[#BDBDBD]"
          } ${className}`.trim()}
          {...props}
        />
        {error && (
          <p className="text-[13px] text-[#C62828] font-medium mt-0.5" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="text-[13px] text-[#5F5F5F] mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
