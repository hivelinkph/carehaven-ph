import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium text-[#2D3748] mb-2"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 text-[#141413] bg-white border-2 rounded-xl transition-all placeholder:text-[#b0aea5] focus:outline-none focus:ring-0 ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[#e8e6dc] focus:border-[#2DD1AC] hover:border-[#b0aea5]"
          } ${className}`}
          style={{ fontFamily: "var(--font-body)", fontSize: "16px" }}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500" style={{ fontFamily: "var(--font-ui)" }}>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
