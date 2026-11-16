import { handleApiError } from "../../../shared/api/handleApiError";
import { EstadoError } from "../../../shared/components/EstadoError";
import { Skeleton } from "../../../shared/components/Skeleton";
import { formatPrecio } from "../../../shared/utils/format";
import { ResumenCard } from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

export function AdminResumenPage() {
  const resumen = useResumenPedidos();

  return (
    <div>
      <h1 className="mb-6 text-4xl font-extrabold">Resumen del negocio</h1>

      {resumen.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : resumen.isError ? (
        <EstadoError
          mensaje={handleApiError(resumen.error, "No pudimos cargar el resumen")}
          onReintentar={() => void resumen.refetch()}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pedidos de hoy" valor={String(resumen.data.pedidos_hoy)} franja="bg-ink" />
          <ResumenCard titulo="Pendientes" valor={String(resumen.data.pendientes)} franja="bg-mostaza" />
          <ResumenCard titulo="En preparación" valor={String(resumen.data.en_preparacion)} franja="bg-sky-600" />
          <ResumenCard titulo="Entregados" valor={String(resumen.data.entregados)} franja="bg-leaf" />
          <ResumenCard titulo="Cancelados" valor={String(resumen.data.cancelados)} franja="bg-pimiento" />
          <ResumenCard
            titulo="Ingresos de pedidos entregados"
            valor={formatPrecio(resumen.data.ingresos_entregados)}
            franja="bg-leaf"
          />
        </div>
      )}
    </div>
  );
}
