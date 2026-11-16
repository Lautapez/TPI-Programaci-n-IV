from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import require_role
from app.core.utils import resolve_paging
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.usuarios.models import Usuario

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    page: Optional[int] = Query(None, ge=1),
    size: Optional[int] = Query(None, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=100),
    categoria_id: Optional[int] = None,
    disponible: Optional[bool] = None,
    service: ProductoService = Depends(get_producto_service),
) -> ProductosPaginados:
    skip, limit = resolve_paging(skip, limit, page, size)
    return service.listar(search, categoria_id, disponible, skip, limit)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: int, service: ProductoService = Depends(get_producto_service)
) -> ProductoRead:
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("", response_model=ProductoRead, status_code=201)
def crear_producto(
    data: ProductoCreate,
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ProductoRead:
    try:
        return service.crear(data)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.put("/{producto_id}", response_model=ProductoRead)
def actualizar_producto(
    producto_id: int,
    data: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ProductoRead:
    try:
        return service.actualizar(producto_id, data)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.patch("/{producto_id}/stock", response_model=ProductoRead)
def actualizar_stock(
    producto_id: int,
    data: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> ProductoRead:
    try:
        return service.actualizar_stock(producto_id, data)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.delete("/{producto_id}", status_code=204)
def eliminar_producto(
    producto_id: int,
    service: ProductoService = Depends(get_producto_service),
    _admin: Usuario = Depends(require_role(["admin"])),
) -> None:
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc))
