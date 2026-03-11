import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#2DD1AC]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "text-white bg-gradient-to-r from-[#2DD1AC] to-[#2DD1AC]/85 shadow-md hover:shadow-lg hover:-translate-y-0.5",
    secondary:
      "text-white bg-[#2D3748] hover:bg-[#2D3748]/90 shadow-md hover:shadow-lg",
    outline:
      "text-[#2D3748] bg-transparent border-2 border-[#e8e6dc] hover:border-[#2DD1AC] hover:text-[#2DD1AC]",
    ghost:
      "text-[#2D3748] hover:bg-[#e8e6dc]/50",
  };

  const sizes = {
    sm: "text-sm px-4 py-2",
    md: "text-sm px-6 py-3",
    lg: "text-base px-8 py-4",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ fontFamily: "var(--font-ui)" }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
