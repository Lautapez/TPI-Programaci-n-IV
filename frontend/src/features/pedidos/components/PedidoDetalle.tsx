import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { formatFecha, formatPrecio } from "../../../shared/utils/format";
import type { Pedido } from "../types";

export function PedidoDetalle({ pedido }: { pedido: Pedido }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <BadgeEstado estado={pedido.estado} />
        <p className="text-sm text-muted">Creado el {formatFecha(pedido.created_at)}</p>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-muted">Dirección de entrega</dt>
          <dd className="font-medium">{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted">Forma de pago</dt>
          <dd className="font-medium">{pedido.forma_pago === "EFECTIVO" ? "Efectivo" : "Transferencia"}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-sm text-muted">Notas</dt>
            <dd className="font-medium">{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line text-sm text-muted">
              <th scope="col" className="py-2 font-medium">Producto</th>
              <th scope="col" className="py-2 text-right font-medium">Cant.</th>
              <th scope="col" className="py-2 text-right font-medium">Precio</th>
              <th scope="col" className="py-2 text-right font-medium">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {pedido.items.map((item) => (
              <tr key={item.producto_id} className="border-b border-line/60">
                <td className="py-2">{item.nombre_producto}</td>
                <td className="py-2 text-right">{item.cantidad}</td>
                <td className="py-2 text-right">{formatPrecio(item.precio_unitario)}</td>
                <td className="py-2 text-right">{formatPrecio(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className="pt-3 text-right">Total</th>
              <td className="pt-3 text-right font-display text-xl font-extrabold">
                {formatPrecio(pedido.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
