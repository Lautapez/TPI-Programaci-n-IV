import { useCallback, useState } from "react";
import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { EstadoVacio } from "../../../shared/components/EstadoVacio";
import { Paginacion } from "../../../shared/components/Paginacion";
import { Skeleton } from "../../../shared/components/Skeleton";
import { Button } from "../../../shared/ui/Button";
import { Select } from "../../../shared/ui/Input";
import { Modal } from "../../../shared/ui/Modal";
import { formatPrecio } from "../../../shared/utils/format";
import { PedidoDetalle } from "../components/PedidoDetalle";
import { PedidosTable } from "../components/PedidosTable";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido, Pedido } from "../types";

const LIMITE = 10;

const ESTADOS: { valor: EstadoPedido; texto: string }[] = [
  { valor: "PENDIENTE", texto: "Pendiente" },
  { valor: "EN_PREPARACION", texto: "En preparación" },
  { valor: "ENTREGADO", texto: "Entregado" },
  { valor: "CANCELADO", texto: "Cancelado" },
];

type ModalState = { tipo: "detalle"; pedido: Pedido } | { tipo: "cancelar"; pedido: Pedido };

function esEstado(valor: string): valor is EstadoPedido {
  return ESTADOS.some((e) => e.valor === valor);
}

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined);
  const [pagina, setPagina] = useState(1);
  const [modal, setModal] = useState<ModalState | null>(null);
  const pedidos = usePedidos({ estado, skip: (pagina - 1) * LIMITE, limit: LIMITE });
  const cambiar = useCambiarEstadoPedido();

  const procesandoId = cambiar.isPending ? cambiar.variables.id : null;

  const verDetalle = useCallback((pedido: Pedido) => setModal({ tipo: "detalle", pedido }), []);
  const cambiarEstado = useCallback(
    (pedido: Pedido, destino: EstadoPedido) => {
      if (destino === "CANCELADO") {
        cambiar.reset();
        setModal({ tipo: "cancelar", pedido });
      } else {
        cambiar.mutate({ id: pedido.id, estado: destino });
      }
    },
    [cambiar],
  );

  const cerrar = () => {
    setModal(null);
    cambiar.reset();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-extrabold">Pedidos</h1>
        <div className="w-56">
          <Select
            id="filtro-estado"
            label="Filtrar por estado"
            value={estado ?? ""}
            onChange={(e) => {
              setEstado(esEstado(e.target.value) ? e.target.value : undefined);
              setPagina(1);
            }}
          >
            <option value="">Todos</option>
            {ESTADOS.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.texto}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {cambiar.isError && modal === null && (
        <p role="alert" className="mb-4 rounded-md bg-red-50 px-3 py-2 text-pimiento-dark">
          {handleApiError(cambiar.error, "No se pudo cambiar el estado")}
        </p>
      )}

      {pedidos.isPending ? (
        <Skeleton className="h-64 w-full" />
      ) : pedidos.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidos.error, "No pudimos cargar los pedidos")}
          onReintentar={() => void pedidos.refetch()}
        />
      ) : pedidos.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No hay pedidos para mostrar"
          descripcion={estado ? "No hay pedidos en ese estado." : "Cuando los clientes confirmen pedidos, van a aparecer acá."}
        />
      ) : (
        <>
          <PedidosTable
            pedidos={pedidos.data.items}
            procesandoId={procesandoId}
            onVerDetalle={verDetalle}
            onCambiarEstado={cambiarEstado}
          />
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
            Vas a cancelar el pedido por {formatPrecio(modal.pedido.total)}. El stock de cada producto se
            restituye y el cambio no se puede deshacer.
          </p>
          {cambiar.isError && (
            <p role="alert" className="mt-3 rounded-md bg-red-50 px-3 py-2 text-pimiento-dark">
              {handleApiError(cambiar.error, "No se pudo cancelar el pedido")}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={cerrar}>
              Volver
            </Button>
            <Button
              disabled={cambiar.isPending}
              onClick={() =>
                cambiar.mutate({ id: modal.pedido.id, estado: "CANCELADO" }, { onSuccess: cerrar })
              }
            >
              {cambiar.isPending ? "Cancelando…" : "Cancelar pedido"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
