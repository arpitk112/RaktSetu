import React from "react";

export interface OptionType {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: OptionType[];
  placeholder?: string;
  required?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      children,
      required = false,
      id,
      className = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-[14px] sm:text-[15px] font-semibold text-[#1F1F1F] flex items-center gap-1"
          >
            {label}
            {required && <span className="text-[#C62828]" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            className={`w-full h-[48px] px-3.5 pr-10 rounded-[10px] border-[1.5px] text-[16px] text-[#1F1F1F] bg-white transition-colors focus:outline-none focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 disabled:bg-[#F7F7F7] disabled:text-[#5F5F5F] disabled:cursor-not-allowed appearance-none cursor-pointer ${
              error
                ? "border-[#C62828] focus:border-[#C62828] focus:ring-[#C62828]/30"
                : "border-[#E0E0E0] hover:border-[#BDBDBD]"
            } ${className}`.trim()}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          {/* Custom Chevron Down SVG indicator */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-[#5F5F5F]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
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

Select.displayName = "Select";
