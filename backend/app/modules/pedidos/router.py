from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_current_active_user, require_role
from app.core.utils import resolve_paging
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


def _a_http(exc: Exception) -> HTTPException:
    """Traduce las excepciones de dominio a HTTPException."""
    if isinstance(exc, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status_code=404, detail=str(exc))
    if isinstance(exc, PedidoAjeno):
        return HTTPException(status_code=403, detail=str(exc))
    if isinstance(exc, ReglaDeNegocio):
        return HTTPException(status_code=400, detail=str(exc))
    raise exc


_DOMINIO = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post("", response_model=PedidoRead, status_code=201)
def crear_pedido(
    data: PedidoCreate,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.crear(data, usuario.id)  # type: ignore[arg-type]
    except _DOMINIO as exc:
        raise _a_http(exc)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    page: Optional[int] = Query(None, ge=1),
    size: Optional[int] = Query(None, ge=1, le=100),
    estado: Optional[EstadoPedido] = None,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidosPaginados:
    skip, limit = resolve_paging(skip, limit, page, size)
    return service.listar(
        usuario.id,  # type: ignore[arg-type]
        usuario.role == "admin",
        estado,
        skip,
        limit,
    )


# Se declara antes de /{pedido_id} para que "resumen" no se interprete como un id.
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(
    _admin: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> ResumenPedidos:
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.obtener(pedido_id, usuario.id, usuario.role == "admin")  # type: ignore[arg-type]
    except _DOMINIO as exc:
        raise _a_http(exc)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado_pedido(
    pedido_id: int,
    data: CambioEstado,
    _admin: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cambiar_estado(pedido_id, data.estado)
    except _DOMINIO as exc:
        raise _a_http(exc)


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
) -> PedidoRead:
    try:
        return service.cancelar_propio(pedido_id, usuario.id)  # type: ignore[arg-type]
    except _DOMINIO as exc:
        raise _a_http(exc)
