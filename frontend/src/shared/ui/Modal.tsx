import type { ReactNode } from "react";

interface ModalProps {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
  ancho?: "sm" | "md" | "lg";
}

const anchos = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl" } as const;

/**
 * Se monta solo cuando está abierto (`{abierto && <Modal ... />}`).
 * Usa <dialog>: aporta foco atrapado, Escape y fondo modal sin código extra.
 */
export function Modal({ titulo, onClose, children, ancho = "md" }: ModalProps) {
  return (
    <dialog
      ref={(el) => {
        if (el && !el.open) el.showModal();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={titulo}
      className={`m-auto w-[calc(100%-2rem)] ${anchos[ancho]} rounded-lg border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-ink/60`}
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-xl font-extrabold">{titulo}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded p-1 text-2xl leading-none text-muted hover:text-ink"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </dialog>
  );
}
