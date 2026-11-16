from datetime import datetime, time
from typing import Optional

from app.core.utils import now, paging_meta
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

PENDIENTE = EstadoPedido.PENDIENTE.value
EN_PREPARACION = EstadoPedido.EN_PREPARACION.value
ENTREGADO = EstadoPedido.ENTREGADO.value
CANCELADO = EstadoPedido.CANCELADO.value

# RN-02: mapa de transiciones válidas. Los estados terminales no admiten cambios.
TRANSICIONES: dict[str, set[str]] = {
    PENDIENTE: {EN_PREPARACION, CANCELADO},
    EN_PREPARACION: {ENTREGADO, CANCELADO},
    ENTREGADO: set(),
    CANCELADO: set(),
}


# ---------------- Excepciones de dominio ----------------
class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ReglaDeNegocio(Exception):
    """Base de los errores de regla de negocio (400)."""


class StockInsuficiente(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class ProductoRepetido(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


class PedidoNoCancelable(ReglaDeNegocio):
    pass


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- RN-01: crear pedido ----------
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        ids = [item.producto_id for item in data.items]
        if len(set(ids)) != len(ids):
            raise ProductoRepetido("No se puede repetir un producto en el pedido")

        with self.uow as uow:
            pedido = Pedido(
                usuario_id=usuario_id,
                estado=PENDIENTE,
                forma_pago=data.forma_pago.value,
                direccion_entrega=data.direccion_entrega.strip(),
                notas=data.notas.strip() if data.notas else None,
                total=0.0,
            )
            uow.pedidos.add(pedido)

            total = 0.0
            # Se recorre ordenado por id de producto para tomar los bloqueos
            # siempre en el mismo orden y evitar deadlocks entre pedidos concurrentes.
            for item in sorted(data.items, key=lambda i: i.producto_id):
                producto = uow.productos.get_by_id(item.producto_id, for_update=True)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"El producto {item.producto_id} no existe o no está activo"
                    )
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"«{producto.nombre}» no está disponible"
                    )
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para «{producto.nombre}»: "
                        f"disponible {producto.stock}, solicitado {item.cantidad}"
                    )
                producto.stock -= item.cantidad
                uow.session.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,  # type: ignore[arg-type]
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,
                        precio_unitario=producto.precio_base,
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    # ---------- Consultas ----------
    def listar(
        self,
        usuario_id: int,
        es_admin: bool,
        estado: Optional[EstadoPedido],
        skip: int,
        limit: int,
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro_estado = estado.value if estado else None
            if es_admin:
                items, total = uow.pedidos.list_paginado(None, filtro_estado, skip, limit)
            else:
                items, total = uow.pedidos.list_by_usuario(
                    usuario_id, filtro_estado, skip, limit
                )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in items],
                **paging_meta(total, skip, limit),
            )

    def obtener(self, pedido_id: int, usuario_id: int, es_admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id)
            if not es_admin and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    # ---------- RN-02 / RN-03: cambio de estado (admin) ----------
    def cambiar_estado(self, pedido_id: int, nuevo_estado: EstadoPedido) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id, for_update=True)
            self._aplicar_transicion(uow, pedido, nuevo_estado.value)
            return PedidoRead.model_validate(pedido)

    # ---------- RN-03 / RN-04: cancelación por el dueño ----------
    def cancelar_propio(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._get(uow, pedido_id, for_update=True)
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != PENDIENTE:
                raise PedidoNoCancelable(
                    "Solo se pueden cancelar pedidos en estado PENDIENTE"
                )
            self._aplicar_transicion(uow, pedido, CANCELADO)
            return PedidoRead.model_validate(pedido)

    # ---------- Resumen del panel ----------
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_dia = datetime.combine(now().date(), time.min)
            return ResumenPedidos(
                pendientes=conteos.get(PENDIENTE, 0),
                en_preparacion=conteos.get(EN_PREPARACION, 0),
                entregados=conteos.get(ENTREGADO, 0),
                cancelados=conteos.get(CANCELADO, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_dia),
                ingresos_entregados=uow.pedidos.sum_total_por_estado(ENTREGADO),
            )

    # ---------- Internos ----------
    @staticmethod
    def _get(uow: PedidoUnitOfWork, pedido_id: int, for_update: bool = False) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id, for_update=for_update)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _aplicar_transicion(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: str) -> None:
        actual = pedido.estado
        if nuevo not in TRANSICIONES.get(actual, set()):
            raise TransicionInvalida(f"Transición inválida: {actual} → {nuevo}")
        if nuevo == CANCELADO:
            # RN-03: restituye el stock de cada línea en la misma transacción.
            for linea in pedido.items:
                producto = uow.productos.get_by_id(linea.producto_id, for_update=True)
                if producto is not None:
                    producto.stock += linea.cantidad
                    uow.session.add(producto)
        pedido.estado = nuevo
        pedido.updated_at = now()
        uow.session.add(pedido)
        uow.session.flush()
        uow.session.refresh(pedido)
