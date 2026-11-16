import { Link, useNavigate } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Card } from "../../../shared/ui/Card";
import { formatPrecio } from "../../../shared/utils/format";
import { useCartStore } from "../../../store/cartStore";
import { CheckoutForm, type CheckoutValues } from "../components/CheckoutForm";
import { useCrearPedido } from "../hooks/usePedidos";

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const crear = useCrearPedido();

  if (items.length === 0 && !crear.isSuccess) {
    return (
      <EstadoVacio
        titulo="No hay nada para confirmar"
        descripcion="Tu carrito está vacío."
        accion={
          <Link to="/" className="rounded-md bg-pimiento px-4 py-2.5 font-semibold text-white hover:bg-pimiento-dark">
            Ir al catálogo
          </Link>
        }
      />
    );
  }

  const confirmar = (values: CheckoutValues) => {
    crear.mutate(
      {
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: values.forma_pago,
        direccion_entrega: values.direccion_entrega,
        notas: values.notas === "" ? null : values.notas,
      },
      {
        onSuccess: () => {
          vaciar();
          navigate("/mis-pedidos");
        },
      },
    );
  };

  return (
    <div>
      <h1 className="mb-6 text-4xl font-extrabold">Confirmar pedido</h1>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Card className="p-6">
          <CheckoutForm
            enviando={crear.isPending}
            error={crear.isError ? handleApiError(crear.error, "No se pudo crear el pedido") : null}
            onSubmit={confirmar}
          />
        </Card>
        <aside>
          <Card className="p-5">
            <h2 className="text-xl font-extrabold">Tu pedido</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {items.map((i) => (
                <li key={i.producto_id} className="flex justify-between gap-3">
                  <span>
                    {i.cantidad} × {i.nombre}
                  </span>
                  <span className="shrink-0">{formatPrecio(i.precio_unitario * i.cantidad)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-muted">Total</span>
              <span className="font-display text-2xl font-extrabold">{formatPrecio(total)}</span>
            </div>
            <Link to="/carrito" className="mt-3 inline-block text-sm font-semibold text-pimiento underline">
              Editar carrito
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}
