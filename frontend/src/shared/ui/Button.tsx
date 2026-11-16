import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "dark" | "outline" | "danger" | "ghost";
type Tamano = "sm" | "md";

const variantes: Record<Variante, string> = {
  primary: "bg-pimiento text-white hover:bg-pimiento-dark",
  dark: "bg-ink text-chalk hover:bg-black",
  outline: "border border-ink/30 text-ink hover:border-ink hover:bg-ink/5",
  danger: "border border-pimiento/40 text-pimiento hover:bg-pimiento hover:text-white",
  ghost: "text-ink hover:bg-ink/5",
};

const tamanos: Record<Tamano, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante;
  size?: Tamano;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variant]} ${tamanos[size]} ${className}`}
      {...props}
    />
  );
}
