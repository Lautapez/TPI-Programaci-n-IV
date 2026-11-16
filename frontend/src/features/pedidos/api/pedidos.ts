import { api } from "../../../shared/api/axiosInstance";
import type {
  EstadoPedido,
  FiltrosPedidos,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from "../types";

export async function listarPedidos(filtros: FiltrosPedidos): Promise<PedidosPaginados> {
  const res = await api.get<PedidosPaginados>("/pedidos", { params: filtros });
  return res.data;
}

export async function obtenerResumen(): Promise<ResumenPedidos> {
  const res = await api.get<ResumenPedidos>("/pedidos/resumen");
  return res.data;
}

export async function crearPedido(data: PedidoCreate): Promise<Pedido> {
  const res = await api.post<Pedido>("/pedidos", data);
  return res.data;
}

export async function cambiarEstadoPedido(id: number, estado: EstadoPedido): Promise<Pedido> {
  const res = await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado });
  return res.data;
}

export async function cancelarPedido(id: number): Promise<Pedido> {
  const res = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
  return res.data;
}
