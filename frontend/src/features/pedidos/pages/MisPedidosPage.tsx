import { useState } from "react";
import { Link } from "react-router-dom";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { Card } from "../../../shared/ui/Card";
import { Modal } from "../../../shared/ui/Modal";
import { formatFecha, formatPrecio } from "../../../shared/utils/format";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { Pedido } from "../types";

const LIMITE = 10;

type ModalState = { tipo: "detalle"; pedido: Pedido } | { tipo: "cancelar"; pedido: Pedido };

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState<ModalState | null>(null);
  const pedidos = usePedidos({ skip: (pagina - 1) * LIMITE, limit: LIMITE });
  const cancelar = useCancelarPedido();

  const cerrar = () => {
    setModal(null);
    cancelar.reset();
  };

  return (
    <div>
      <h1 className="mb-6 text-4xl font-extrabold">Mis pedidos</h1>

      {pedidos.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error, "No pudimos cargar tus pedidos")}
          onReintentar={() => void pedidos.refetch()}
        />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste ningún pedido"
          descripcion="Cuando confirmes uno, lo vas a poder seguir desde acá."
          accion={
            <Link to="/" className="rounded-md bg-pimiento px-4 py-2.5 font-semibold text-white hover:bg-pimiento-dark">
              Ver el catálogo
            </Link>
          }
        />
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {pedidos.data.items.map((pedido) => (
              <li key={pedido.id}>
                <Card className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
                  <div className="min-w-32">
                    <p className="font-display text-xl font-extrabold">Pedido #{pedido.id}</p>
                    <p className="text-sm text-muted">{formatFecha(pedido.created_at)}</p>
                  </div>
                  <BadgeEstado estado={pedido.estado} />
                  <p className="text-muted">
                    {pedido.items.length} {pedido.items.length === 1 ? "producto" : "productos"}
                  </p>
                  <p className="ml-auto font-display text-xl font-extrabold">{formatPrecio(pedido.total)}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setModal({ tipo: "detalle", pedido })}>
                      Ver detalle
                    </Button>
                    {pedido.estado === "PENDIENTE" && (
                      <Button size="sm" variant="danger" onClick={() => setModal({ tipo: "cancelar", pedido })}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Paginacion
            pagina={pagina}
            paginas={pedidos.data.pages}
            total={pedidos.data.total}
            onCambiar={setPagina}
          />
        </>
      )}

      {modal?.tipo === "detalle" && (
        <Modal titulo={`Pedido #${modal.pedido.id}`} ancho="lg" onClose={cerrar}>
          <PedidoDetalle pedido={modal.pedido} />
        </Modal>
      )}

      {modal?.tipo === "cancelar" && (
        <Modal titulo={`Cancelar pedido #${modal.pedido.id}`} ancho="sm" onClose={cerrar}>
          <p>
            Vas a cancelar este pedido por {formatPrecio(modal.pedido.total)}. Los productos vuelven al stock y
            no se puede deshacer.
          </p>
          {cancelar.isError && (
            <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-pimiento-dark">
              {handleApiError(cancelar.error, "No se pudo cancelar el pedido")}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={cerrar}>
              Volver
            </Button>
            <Button
              disabled={cancelar.isPending}
              onClick={() => cancelar.mutate(modal.pedido.id, { onSuccess: cerrar })}
            >
              {cancelar.isPending ? "Cancelando…" : "Cancelar pedido"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
