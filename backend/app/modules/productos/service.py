from typing import Optional

from app.core.utils import paging_meta
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self,
        search: Optional[str],
        categoria_id: Optional[int],
        disponible: Optional[bool],
        skip: int,
        limit: int,
    ) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
                skip=skip,
                limit=limit,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items],
                **paging_meta(total, skip, limit),
            )

    def obtener(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._get_activo(uow, producto_id))

    def crear(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, data.categoria_id)
            producto = Producto(**data.model_dump())
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def actualizar(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            cambios = data.model_dump(exclude_unset=True)
            if cambios.get("categoria_id") is not None:
                self._validar_categoria(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                # Los campos obligatorios ignoran null; descripcion e imagen_url pueden borrarse.
                if valor is None and campo not in ("descripcion", "imagen_url"):
                    continue
                setattr(producto, campo, valor)
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, data: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id, for_update=True)
            producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            uow.session.add(producto)
            uow.session.flush()
            uow.session.refresh(producto)
            return ProductoRead.model_validate(producto)

    def eliminar(self, producto_id: int) -> None:
        """Baja lógica."""
        with self.uow as uow:
            producto = self._get_activo(uow, producto_id)
            producto.activo = False
            uow.session.add(producto)

    @staticmethod
    def _get_activo(
        uow: ProductoUnitOfWork, producto_id: int, for_update: bool = False
    ) -> Producto:
        producto = uow.productos.get_by_id(producto_id, for_update=for_update)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")
