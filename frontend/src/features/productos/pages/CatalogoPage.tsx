import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { useCategorias } from "../../categorias/hooks/useCategorias";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";
import type { FiltrosProductos } from "../types";

const LIMITE = 12;

export function CatalogoPage() {
  const [pagina, setPagina] = useState(1);
  const [texto, setTexto] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const filtros: FiltrosProductos = {
    search: busqueda || undefined,
    categoria_id: categoriaId,
    skip: (pagina - 1) * LIMITE,
    limit: LIMITE,
  };
  const productos = useProductos(filtros);
  const categorias = useCategorias();

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    setBusqueda(texto.trim());
    setPagina(1);
  };
  const elegirCategoria = (id: number | undefined) => {
    setCategoriaId(id);
    setPagina(1);
  };
  const limpiar = () => {
    setTexto("");
    setBusqueda("");
    setCategoriaId(undefined);
    setPagina(1);
  };

  const hayFiltros = busqueda !== "" || categoriaId !== undefined;
  const chip = (activo: boolean) =>
    `rounded-full border px-4 py-1.5 font-medium transition-colors ${
      activo ? "border-ink bg-ink text-chalk" : "border-line bg-white hover:border-ink"
    }`;

  return (
    <div>
      <header className="mb-8 max-w-2xl">
        <h1 className="text-5xl font-extrabold leading-[1.05]">Lo que hay hoy en la cocina</h1>
        <p className="mt-3 text-lg text-muted">
          Elegí, armá tu carrito y confirmá el pedido con tu dirección de entrega.
        </p>
      </header>

      <form onSubmit={buscar} role="search" className="mb-4 flex flex-wrap gap-2">
        <label htmlFor="buscar" className="sr-only">
          Buscar productos por nombre
        </label>
        <input
          id="buscar"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Buscar por nombre"
          className="min-w-0 flex-1 rounded-md border border-line bg-white px-3 py-2.5 focus:border-ink focus:outline-none sm:max-w-sm"
        />
        <Button type="submit" variant="dark">
          Buscar
        </Button>
        {hayFiltros && (
          <Button variant="ghost" onClick={limpiar}>
            Limpiar filtros
          </Button>
        )}
      </form>

      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
        <button type="button" aria-pressed={categoriaId === undefined} className={chip(categoriaId === undefined)} onClick={() => elegirCategoria(undefined)}>
          Todas
        </button>
        {categorias.data?.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={categoriaId === c.id}
            className={chip(categoriaId === c.id)}
            onClick={() => elegirCategoria(c.id)}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {productos.isPending ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando productos">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-line bg-white">
              <Skeleton className="h-40 w-full rounded-none" />
              <div className="flex flex-col gap-3 p-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : productos.isError ? (
        <EstadoError
          mensaje={handleApiError(productos.error, "No pudimos cargar el catálogo")}
          onReintentar={() => void productos.refetch()}
        />
      ) : productos.data.items.length === 0 ? (
        <EstadoVacio
          titulo={hayFiltros ? "Ningún producto coincide con tu búsqueda" : "Todavía no hay productos"}
          descripcion={hayFiltros ? "Probá con otro nombre o quitá los filtros." : "Volvé en un rato."}
          accion={hayFiltros ? <Button variant="dark" onClick={limpiar}>Limpiar filtros</Button> : undefined}
        />
      ) : (
        <>
          <div
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${productos.isPlaceholderData ? "opacity-60" : ""}`}
          >
            {productos.data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            paginas={productos.data.pages}
            total={productos.data.total}
            onCambiar={setPagina}
          />
          <p className="mt-6 text-center text-muted">
            ¿Listo?{" "}
            <Link to="/carrito" className="font-semibold text-pimiento underline">
              Ver el carrito
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
