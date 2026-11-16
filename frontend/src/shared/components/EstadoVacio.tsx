import type { ReactNode } from "react";

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EstadoVacio({ titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-ink/25 px-6 py-14 text-center">
      <h2 className="text-2xl font-extrabold">{titulo}</h2>
      {descripcion && <p className="max-w-md text-muted">{descripcion}</p>}
      {accion}
    </div>
  );
}
