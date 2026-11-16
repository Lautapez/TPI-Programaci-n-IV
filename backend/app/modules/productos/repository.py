from typing import Optional, Sequence

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Producto], int]:
        """Productos activos filtrados. Devuelve (items de la página, total)."""
        stmt = select(Producto).where(Producto.activo == True)  # noqa: E712
        if search and search.strip():
            stmt = stmt.where(Producto.nombre.ilike(f"%{search.strip()}%"))  # type: ignore[attr-defined]
        if categoria_id is not None:
            stmt = stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            stmt = stmt.where(Producto.disponible == disponible)

        total = self.session.exec(
            select(func.count()).select_from(stmt.subquery())
        ).one()
        items = self.session.exec(
            stmt.options(selectinload(Producto.categoria))  # type: ignore[arg-type]
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        ).all()
        return items, total
