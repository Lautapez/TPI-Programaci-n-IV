import { formatPrecio } from "../../../shared/utils/format";
import { useCartStore } from "../../../store/cartStore";
import { Button } from "../../../shared/ui/Button";
import type { Producto } from "../types";
import { ProductoImagen } from "./ProductoImagen";

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );

  const agotado = !producto.disponible || producto.stock <= 0;
  const sinMas = enCarrito >= producto.stock;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-line bg-white">
      <ProductoImagen
        nombre={producto.nombre}
        imagenUrl={producto.imagen_url}
        categoriaId={producto.categoria_id}
        className="h-40 w-full"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        {producto.categoria && <p className="text-sm text-muted">{producto.categoria.nombre}</p>}
        <h3 className="text-xl font-extrabold leading-tight">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="line-clamp-2 text-muted">{producto.descripcion}</p>
        )}
        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <p className="font-display text-2xl font-extrabold">{formatPrecio(producto.precio_base)}</p>
          {agotado ? (
            <span className="rounded-full bg-ink/10 px-3 py-1 text-sm font-semibold">Agotado</span>
          ) : (
            <span className="text-sm text-muted">Quedan {producto.stock}</span>
          )}
        </div>
        <Button disabled={agotado || sinMas} onClick={() => agregar(producto)} className="mt-1">
          {agotado
            ? "No disponible"
            : sinMas
              ? "Máximo en el carrito"
              : enCarrito > 0
                ? `Agregar otro (${enCarrito} en el carrito)`
                : "Agregar al carrito"}
        </Button>
      </div>
    </article>
  );
}
