import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from "../types";

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => api.listarPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: ["pedidos-resumen"], queryFn: api.obtenerResumen });
}

/** Un pedido cambia pedidos, resumen y también el stock de los productos. */
function useInvalidarPedidos() {
  const qc = useQueryClient();
  return async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["pedidos"] }),
      qc.invalidateQueries({ queryKey: ["pedidos-resumen"] }),
      qc.invalidateQueries({ queryKey: ["productos"] }),
    ]);
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: (data: PedidoCreate) => api.crearPedido(data),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      api.cambiarEstadoPedido(id, estado),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: (id: number) => api.cancelarPedido(id),
    onSuccess: invalidar,
  });
}
