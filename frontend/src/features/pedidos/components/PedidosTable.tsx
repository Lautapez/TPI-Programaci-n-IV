import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "../../../shared/components/DataTable";
import { BadgeEstado } from "../../../shared/ui/BadgeEstado";
import { Button } from "../../../shared/ui/Button";
import { formatFecha, formatPrecio } from "../../../shared/utils/format";
import { TRANSICIONES, type EstadoPedido, type Pedido } from "../types";

interface PedidosTableProps {
  pedidos: Pedido[];
  procesandoId: number | null;
  onVerDetalle: (pedido: Pedido) => void;
  onCambiarEstado: (pedido: Pedido, estado: EstadoPedido) => void;
}

const textoAccion: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Preparar",
  ENTREGADO: "Marcar entregado",
  CANCELADO: "Cancelar",
};

export function PedidosTable({ pedidos, procesandoId, onVerDetalle, onCambiarEstado }: PedidosTableProps) {
  const columnas = useMemo<ColumnDef<Pedido>[]>(
    () => [
      { accessorKey: "id", header: "N°", cell: (i) => <strong>#{i.getValue<number>()}</strong> },
      {
        accessorKey: "usuario_id",
        header: "Cliente",
        cell: (i) => `Usuario ${i.getValue<number>()}`,
      },
      {
        accessorKey: "created_at",
        header: "Fecha",
        cell: (i) => formatFecha(i.getValue<string>()),
      },
      {
        accessorKey: "total",
        header: "Total",
        cell: (i) => formatPrecio(i.getValue<number>()),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: (i) => <BadgeEstado estado={i.getValue<EstadoPedido>()} />,
      },
      {
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const pedido = row.original;
          const ocupado = procesandoId === pedido.id;
          return (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => onVerDetalle(pedido)}>
                Detalle
              </Button>
              {TRANSICIONES[pedido.estado].map((destino) => (
                <Button
                  key={destino}
                  size="sm"
                  variant={destino === "CANCELADO" ? "danger" : "dark"}
                  disabled={ocupado}
                  onClick={() => onCambiarEstado(pedido, destino)}
                >
                  {textoAccion[destino]}
                </Button>
              ))}
            </div>
          );
        },
      },
    ],
    [procesandoId, onVerDetalle, onCambiarEstado],
  );

  return <DataTable data={pedidos} columns={columnas} paginar={false} />;
}
