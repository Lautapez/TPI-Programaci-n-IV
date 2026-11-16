import { Button } from "../ui/Button";

interface PaginacionProps {
  pagina: number;
  paginas: number;
  total: number;
  onCambiar: (pagina: number) => void;
}

export function Paginacion({ pagina, paginas, total, onCambiar }: PaginacionProps) {
  if (paginas <= 1) return null;
  return (
    <nav
      aria-label="Paginación"
      className="mt-8 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-sm text-muted">
        Página {pagina} de {paginas} · {total} resultados
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pagina >= paginas}
          onClick={() => onCambiar(pagina + 1)}
        >
          Siguiente
        </Button>
      </div>
    </nav>
  );
}
