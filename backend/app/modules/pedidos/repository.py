from datetime import datetime
from typing import Optional, Sequence

from sqlalchemy import func
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import DetallePedido, Pedido


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, DetallePedido)


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_paginado(
        self,
        usuario_id: Optional[int] = None,
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Pedido], int]:
        stmt = select(Pedido)
        if usuario_id is not None:
            stmt = stmt.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            stmt = stmt.where(Pedido.estado == estado)
        total = self.session.exec(
            select(func.count()).select_from(stmt.subquery())
        ).one()
        items = self.session.exec(
            stmt.options(selectinload(Pedido.items))  # type: ignore[arg-type]
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())  # type: ignore[attr-defined]
            .offset(skip)
            .limit(limit)
        ).all()
        return items, total

    def list_by_usuario(
        self,
        usuario_id: int,
        estado: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> tuple[Sequence[Pedido], int]:
        return self.list_paginado(usuario_id, estado, skip, limit)

    def count_by_estado(self) -> dict[str, int]:
        rows = self.session.exec(
            select(Pedido.estado, func.count(Pedido.id)).group_by(Pedido.estado)  # type: ignore[arg-type]
        ).all()
        return {estado: cantidad for estado, cantidad in rows}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(
            select(func.count(Pedido.id)).where(Pedido.created_at >= desde)  # type: ignore[arg-type]
        ).one()

    def sum_total_por_estado(self, estado: str) -> float:
        valor = self.session.exec(
            select(func.coalesce(func.sum(Pedido.total), 0.0)).where(  # type: ignore[arg-type]
                Pedido.estado == estado
            )
        ).one()
        return float(valor or 0.0)
