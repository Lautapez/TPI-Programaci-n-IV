import type { EstadoPedido } from "../../features/pedidos/types";

const estilos: Record<EstadoPedido, { clase: string; texto: string }> = {
  PENDIENTE: { clase: "bg-amber-100 text-amber-900", texto: "Pendiente" },
  EN_PREPARACION: { clase: "bg-sky-100 text-sky-900", texto: "En preparación" },
  ENTREGADO: { clase: "bg-emerald-100 text-emerald-900", texto: "Entregado" },
  CANCELADO: { clase: "bg-red-100 text-red-900", texto: "Cancelado" },
};

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { clase, texto } = estilos[estado];
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-sm font-semibold ${clase}`}>
      {texto}
    </span>
  );
}
