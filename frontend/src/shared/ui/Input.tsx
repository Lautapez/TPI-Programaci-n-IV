import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const base =
  "w-full rounded-md border bg-white px-3 py-2 text-base text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none";

interface CampoProps {
  label: string;
  error?: string;
  ayuda?: string;
}

function Envoltorio({
  label,
  error,
  ayuda,
  htmlFor,
  children,
}: CampoProps & { htmlFor: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {ayuda && !error && <p className="text-sm text-muted">{ayuda}</p>}
      {error && (
        <p role="alert" className="text-sm text-pimiento">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, CampoProps {
  id: string;
}

export function Input({ label, error, ayuda, id, className = "", ...props }: InputProps) {
  return (
    <Envoltorio label={label} error={error} ayuda={ayuda} htmlFor={id}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${base} ${error ? "border-pimiento" : "border-line"} ${className}`}
        {...props}
      />
    </Envoltorio>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, CampoProps {
  id: string;
}

export function Select({ label, error, ayuda, id, className = "", children, ...props }: SelectProps) {
  return (
    <Envoltorio label={label} error={error} ayuda={ayuda} htmlFor={id}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${base} ${error ? "border-pimiento" : "border-line"} ${className}`}
        {...props}
      >
        {children}
      </select>
    </Envoltorio>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, CampoProps {
  id: string;
}

export function Textarea({ label, error, ayuda, id, className = "", ...props }: TextareaProps) {
  return (
    <Envoltorio label={label} error={error} ayuda={ayuda} htmlFor={id}>
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={`${base} min-h-24 ${error ? "border-pimiento" : "border-line"} ${className}`}
        {...props}
      />
    </Envoltorio>
  );
}
