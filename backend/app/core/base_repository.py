from typing import Generic, Optional, Sequence, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Acceso genérico a datos. Sin reglas de negocio y sin commit."""

    def __init__(self, session: Session, model: type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int, for_update: bool = False) -> Optional[T]:
        if for_update:
            stmt = (
                select(self.model)
                .where(getattr(self.model, "id") == id)
                .with_for_update()
                .execution_options(populate_existing=True)
            )
            return self.session.exec(stmt).first()
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[T]:
        stmt = select(self.model).offset(skip).limit(limit)
        return self.session.exec(stmt).all()

    def add(self, entity: T) -> T:
        self.session.add(entity)
        self.session.flush()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        self.session.delete(entity)
        self.session.flush()
