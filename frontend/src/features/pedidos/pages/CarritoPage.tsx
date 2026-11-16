import { Link, useNavigate } from "react-router-dom";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { formatPrecio } from "../../../shared/utils/format";
import { useCartStore } from "../../../store/cartStore";
import { ProductoImagen } from "../../productos/components/ProductoImagen";

export function CarritoPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);

  if (items.length === 0) {
    return (
      <EstadoVacio
        titulo="Tu carrito está vacío"
        descripcion="Agregá productos desde el catálogo y volvé para confirmar el pedido."
        accion={
          <Link to="/" className="rounded-md bg-pimiento px-4 py-2.5 font-semibold text-white hover:bg-pimiento-dark">
            Ver el catálogo
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-4xl font-extrabold">Tu carrito</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li key={item.producto_id}>
              <Card className="flex flex-wrap items-center gap-4 p-3">
                <ProductoImagen
                  nombre={item.nombre}
                  imagenUrl={item.imagen_url}
                  categoriaId={item.producto_id}
                  className="size-16 rounded-md [&_span]:text-2xl"
                />
                <div className="min-w-40 flex-1">
                  <p className="font-semibold">{item.nombre}</p>
                  <p className="text-muted">{formatPrecio(item.precio_unitario)} c/u</p>
                </div>
                <div className="flex items-center gap-2" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label="Quitar una unidad"
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                  >
                    −
                  </Button>
                  <span className="w-8 text-center font-semibold" aria-live="polite">
                    {item.cantidad}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    aria-label="Agregar una unidad"
                    disabled={item.cantidad >= item.stock}
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                  >
                    +
                  </Button>
                </div>
                <p className="w-28 text-right font-display text-lg font-extrabold">
                  {formatPrecio(item.precio_unitario * item.cantidad)}
                </p>
                <Button size="sm" variant="ghost" onClick={() => quitar(item.producto_id)}>
                  Quitar
                </Button>
              </Card>
            </li>
          ))}
        </ul>

        <aside>
          <Card className="sticky top-4 p-5">
            <h2 className="text-xl font-extrabold">Resumen</h2>
            <dl className="mt-4 flex items-baseline justify-between">
              <dt className="text-muted">Total</dt>
              <dd className="font-display text-3xl font-extrabold">{formatPrecio(total)}</dd>
            </dl>
            <Button className="mt-5 w-full" onClick={() => navigate("/checkout")}>
              Continuar al checkout
            </Button>
            <Button variant="ghost" className="mt-2 w-full" onClick={vaciar}>
              Vaciar carrito
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}
